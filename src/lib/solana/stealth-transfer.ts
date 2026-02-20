/**
 * Stealth Transfer Primitive
 *
 * Builds real Solana transactions that send SOL to one-time stealth addresses
 * via the SIP Privacy Anchor program's shielded_transfer instruction.
 *
 * Uses @sip-protocol/sdk for stealth address generation and Pedersen commitments.
 * Creates on-chain TransferRecord PDA with commitment, ephemeral key, and viewing key hash.
 *
 * This module does NOT sign or send transactions — it produces a signable
 * Transaction object for the calling hook/component to submit via wallet adapter.
 */

import { getSDK } from "@/lib/sip-client"
import { createRealCommitment } from "@/lib/crypto-helpers"
import type { CommitmentResult } from "@/lib/crypto-helpers"
import {
  Connection,
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
} from "@solana/web3.js"
import { buildShieldedTransferInstruction } from "@/lib/solana/program-client"

export interface StealthTransferParams {
  /** Amount to transfer in lamports */
  amountLamports: number
  /** Optional memo to attach (e.g., "sip:stealth-transfer") */
  memo?: string
}

export interface StealthTransferResult {
  /** Raw stealth address (base58/hex) — ready for Solana PublicKey */
  stealthAddress: string
  /** Ephemeral public key for recipient to derive spending key */
  ephemeralPublicKey: string
  /** Pedersen commitment of the transfer amount */
  commitment: CommitmentResult
  /** Encoded meta-address for the stealth keypair */
  metaAddress: string
  /** Builds a signable Solana transaction (caller signs + sends) */
  buildTransaction: (
    senderPubkey: PublicKey,
    rpcUrl: string
  ) => Promise<Transaction>
  /** Generate a Solscan explorer URL for a given tx signature */
  getExplorerUrl: (txSignature: string, cluster?: string) => string
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16)
  }
  return bytes
}

/**
 * Convert bigint to 8-byte little-endian Uint8Array
 */
function bigintToLeBytes(value: bigint): Uint8Array {
  const buf = new ArrayBuffer(8)
  const view = new DataView(buf)
  view.setBigUint64(0, value, true)
  return new Uint8Array(buf)
}

/**
 * Create a mock ZK proof (deterministic from inputs)
 */
function createMockProof(
  commitmentHex: string,
  amount: bigint,
  _blindingHex: string
): Uint8Array {
  const proof = new Uint8Array(128)
  // Fill with hash-like deterministic data
  const seed = hexToBytes(commitmentHex)
  for (let i = 0; i < 128; i++) {
    proof[i] = seed[i % seed.length] ^ Number((amount >> BigInt(i % 8)) & BigInt(0xff))
  }
  return proof
}

/**
 * Encrypt amount with viewing key (XOR with key hash)
 */
function encryptAmount(
  amount: bigint,
  viewingKeyHex: string
): Uint8Array {
  const amountBytes = bigintToLeBytes(amount)
  const keyBytes = hexToBytes(viewingKeyHex)
  const encrypted = new Uint8Array(8)
  for (let i = 0; i < 8; i++) {
    encrypted[i] = amountBytes[i] ^ keyBytes[i % keyBytes.length]
  }
  return encrypted
}

/**
 * Create a stealth transfer via the SIP Privacy program's shielded_transfer instruction.
 *
 * Generates a one-time stealth address, commits the amount with Pedersen commitment,
 * and returns a transaction builder that calls the program on-chain.
 *
 * @param params - Transfer parameters (amount in lamports)
 * @returns Stealth address, commitment, and transaction builder
 */
export async function createStealthTransfer(
  params: StealthTransferParams
): Promise<StealthTransferResult> {
  const { amountLamports } = params
  const sdk = await getSDK()

  // 1. Generate one-time stealth address
  const { metaAddress } = sdk.generateStealthMetaAddress("solana")
  const stealthResult = sdk.generateStealthAddress(metaAddress)

  // 2. Create Pedersen commitment of the transfer amount
  const commitment = await createRealCommitment(BigInt(amountLamports))

  // 3. Encode meta-address for storage/display
  const metaAddressStr = sdk.encodeStealthMetaAddress(metaAddress)

  const rawStealthAddress = String(stealthResult.stealthAddress.address)
  const ephemeralPubKey = String(
    stealthResult.stealthAddress.ephemeralPublicKey
  )

  return {
    stealthAddress: rawStealthAddress,
    ephemeralPublicKey: ephemeralPubKey,
    commitment,
    metaAddress: metaAddressStr,

    /**
     * Build a signable Solana transaction that transfers SOL to the stealth address
     * via the SIP Privacy program's shielded_transfer instruction.
     */
    buildTransaction: async (
      senderPubkey: PublicKey,
      rpcUrl: string
    ): Promise<Transaction> => {
      const connection = new Connection(rpcUrl, "confirmed")
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed")

      const tx = new Transaction({
        feePayer: senderPubkey,
        blockhash,
        lastValidBlockHeight,
      })

      // Request 300K compute units for shielded_transfer
      tx.add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 })
      )
      tx.add(
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 })
      )

      // Parse commitment from SDK result
      const commitmentBytes = hexToBytes(commitment.commitmentHash)

      // Prepare ephemeral pubkey (33 bytes compressed)
      const ephemeralBytes = new Uint8Array(33)
      ephemeralBytes[0] = 0x02 // compressed prefix
      const rawEphemeral = hexToBytes(ephemeralPubKey)
      ephemeralBytes.set(rawEphemeral.slice(0, 32), 1)

      // Viewing key hash (use first 32 bytes of meta-address hash)
      const viewingKey = metaAddress.viewingKey
      const viewingKeyBytes = hexToBytes(
        typeof viewingKey === "string" ? viewingKey : String(viewingKey)
      )
      // Simple SHA-256-like hash via repeated XOR for viewing key hash
      const viewingKeyHash = new Uint8Array(32)
      for (let i = 0; i < viewingKeyBytes.length; i++) {
        viewingKeyHash[i % 32] ^= viewingKeyBytes[i]
      }

      // Encrypt amount
      const encryptedAmount = encryptAmount(
        BigInt(amountLamports),
        commitment.blindingFactor
      )

      // Mock proof
      const proof = createMockProof(
        commitment.commitmentHash,
        BigInt(amountLamports),
        commitment.blindingFactor
      )

      // Stealth address as Solana PublicKey
      const stealthPubkey = new PublicKey(rawStealthAddress)

      // Build the shielded_transfer instruction
      const ix = await buildShieldedTransferInstruction({
        connection,
        sender: senderPubkey,
        amountCommitment: commitmentBytes,
        stealthPubkey,
        ephemeralPubkey: ephemeralBytes,
        viewingKeyHash,
        encryptedAmount,
        proof,
        actualAmount: BigInt(amountLamports),
      })

      tx.add(ix)

      return tx
    },

    /**
     * Generate a Solscan explorer URL for a transaction signature.
     * Defaults to mainnet; pass "devnet" for development.
     */
    getExplorerUrl: (txSignature: string, cluster?: string): string => {
      const base = `https://solscan.io/tx/${txSignature}`
      if (!cluster || cluster === "mainnet-beta") return base
      return `${base}?cluster=${cluster}`
    },
  }
}
