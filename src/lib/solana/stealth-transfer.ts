/**
 * Stealth Transfer Primitive
 *
 * Builds real Solana transactions that send SOL to one-time stealth addresses
 * via the SIP Privacy Anchor program's shielded_transfer instruction.
 *
 * Architecture: Hybrid DKSAP + Encrypted Keypair
 * - DKSAP (Dual-Key Stealth Address Protocol) for discovery via viewing key hash
 * - Random Keypair for on-chain stealth account (ed25519 DKSAP scalar != Solana Keypair)
 * - Stealth seed encrypted with DKSAP shared secret (XChaCha20-Poly1305)
 * - Recipient recovers shared secret via ECDH, decrypts seed, reconstructs Keypair
 *
 * This module does NOT sign or send transactions — it produces a signable
 * Transaction object for the calling hook/component to submit via wallet adapter.
 */

import { getSDK } from "@/lib/sip-client"
import { createRealCommitment } from "@/lib/crypto-helpers"
import type { CommitmentResult } from "@/lib/crypto-helpers"
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
  SystemProgram,
} from "@solana/web3.js"
import {
  buildShieldedTransferInstruction,
  FEE_COLLECTOR,
} from "@/lib/solana/program-client"
import { sha256 } from "@noble/hashes/sha2.js"
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js"
import { bytesToHex, concatBytes } from "@noble/hashes/utils.js"
import bs58 from "bs58"

export interface StealthTransferParams {
  /** Amount to transfer in lamports */
  amountLamports: number
  /** Recipient's viewing public key (base58, from meta-address) */
  recipientViewingPublicKey: string
  /** Recipient's spending public key (base58, from meta-address) */
  recipientSpendingPublicKey: string
  /** Optional memo to attach (e.g., "SIP-TIP:artistName") */
  memo?: string
}

export interface StealthTransferResult {
  /** Stealth account public key (base58) — the one-time address holding SOL */
  stealthAddress: string
  /** Ephemeral public key for DKSAP shared secret recovery (hex) */
  ephemeralPublicKey: string
  /** Pedersen commitment of the transfer amount */
  commitment: CommitmentResult
  /** Viewing key hash used for on-chain discovery (hex) */
  viewingKeyHash: string
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
 * Create a mock ZK proof (deterministic from inputs)
 */
function createMockProof(
  commitmentHex: string,
  amount: bigint,
  _blindingHex: string
): Uint8Array {
  const proof = new Uint8Array(128)
  const seed = hexToBytes(commitmentHex)
  for (let i = 0; i < 128; i++) {
    proof[i] =
      seed[i % seed.length] ^ Number((amount >> BigInt(i % 8)) & BigInt(0xff))
  }
  return proof
}

/**
 * Encrypt a 32-byte stealth seed using XChaCha20-Poly1305.
 *
 * Key derivation: encKey = SHA-256(sharedSecret)
 * Nonce derivation: nonce = SHA-256(encKey || "sip-nonce")[0..24] (deterministic)
 *
 * @returns 48-byte ciphertext (32 plaintext + 16 auth tag)
 */
export function encryptStealthSeed(
  seed: Uint8Array,
  sharedSecret: Uint8Array
): Uint8Array {
  const encKey = sha256(sharedSecret)
  const nonceInput = concatBytes(encKey, new TextEncoder().encode("sip-nonce"))
  const nonce = sha256(nonceInput).slice(0, 24)
  const cipher = xchacha20poly1305(encKey, nonce)
  return cipher.encrypt(seed)
}

/**
 * Decrypt a stealth seed encrypted with encryptStealthSeed.
 *
 * @param ciphertext - 48-byte ciphertext (32 encrypted seed + 16 auth tag)
 * @param sharedSecret - Raw shared secret bytes (same as sender computed)
 * @returns 32-byte stealth seed
 */
export function decryptStealthSeed(
  ciphertext: Uint8Array,
  sharedSecret: Uint8Array
): Uint8Array {
  const encKey = sha256(sharedSecret)
  const nonceInput = concatBytes(encKey, new TextEncoder().encode("sip-nonce"))
  const nonce = sha256(nonceInput).slice(0, 24)
  const cipher = xchacha20poly1305(encKey, nonce)
  return cipher.decrypt(ciphertext)
}

/**
 * Create a stealth transfer via the SIP Privacy program's shielded_transfer instruction.
 *
 * Generates a one-time stealth address (random Keypair), encrypts its seed with
 * the DKSAP shared secret so the recipient can recover it, and returns a
 * transaction builder that calls the program on-chain.
 *
 * @param params - Transfer parameters (amount, recipient viewing/spending keys)
 * @returns Stealth address, commitment, and transaction builder
 */
export async function createStealthTransfer(
  params: StealthTransferParams
): Promise<StealthTransferResult> {
  const {
    amountLamports,
    recipientViewingPublicKey,
    recipientSpendingPublicKey,
  } = params
  const sdk = await getSDK()

  // 1. Build meta-address from recipient's public keys (base58 → hex for SDK)
  const spendingBytes = bs58.decode(recipientSpendingPublicKey)
  const viewingBytes = bs58.decode(recipientViewingPublicKey)
  const spendingKeyHex = `0x${bytesToHex(spendingBytes)}` as `0x${string}`
  const viewingKeyHex = `0x${bytesToHex(viewingBytes)}` as `0x${string}`
  const recipientMetaAddress = {
    spendingKey: spendingKeyHex,
    viewingKey: viewingKeyHex,
    chain: "solana" as const,
  }

  // 2. Run DKSAP: get ephemeral pubkey + shared secret for encryption
  const dksapResult = sdk.generateStealthAddress(recipientMetaAddress)
  const sharedSecretBytes = hexToBytes(dksapResult.sharedSecret)
  const ephemeralPubKeyHex = String(
    dksapResult.stealthAddress.ephemeralPublicKey
  )

  // 3. Generate random Keypair for the on-chain stealth account
  //    (Can't use DKSAP-derived key because ed25519 scalar != Solana Keypair seed)
  const stealthKeypair = Keypair.generate()
  const stealthSeed = stealthKeypair.secretKey.slice(0, 32)

  // 4. Encrypt stealth seed with DKSAP shared secret
  const encryptedSeed = encryptStealthSeed(stealthSeed, sharedSecretBytes)

  // 5. Compute viewing key hash for on-chain discovery (viewingBytes already decoded above)
  const viewingKeyHash = sha256(viewingBytes)

  // 6. Create Pedersen commitment
  const commitment = await createRealCommitment(BigInt(amountLamports))

  return {
    stealthAddress: stealthKeypair.publicKey.toBase58(),
    ephemeralPublicKey: ephemeralPubKeyHex,
    commitment,
    viewingKeyHash: `0x${bytesToHex(viewingKeyHash)}`,

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
      tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }))
      tx.add(
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 })
      )

      // Ensure fee_collector is rent-exempt
      const feeCollectorInfo = await connection.getAccountInfo(FEE_COLLECTOR)
      const rentExemptMin =
        await connection.getMinimumBalanceForRentExemption(0)
      const currentBalance = feeCollectorInfo?.lamports ?? 0
      if (currentBalance < rentExemptMin) {
        const topUp = rentExemptMin - currentBalance
        tx.add(
          SystemProgram.transfer({
            fromPubkey: senderPubkey,
            toPubkey: FEE_COLLECTOR,
            lamports: topUp,
          })
        )
      }

      // Parse commitment bytes
      const commitmentBytes = hexToBytes(commitment.commitmentHash)

      // Ephemeral pubkey: 33 bytes (0x02 prefix + 32-byte ed25519 key)
      const ephemeralBytes = new Uint8Array(33)
      ephemeralBytes[0] = 0x02
      const rawEphemeral = hexToBytes(ephemeralPubKeyHex)
      ephemeralBytes.set(rawEphemeral.slice(0, 32), 1)

      // Mock ZK proof
      const proof = createMockProof(
        commitment.commitmentHash,
        BigInt(amountLamports),
        commitment.blindingFactor
      )

      // Build the shielded_transfer instruction
      const ix = await buildShieldedTransferInstruction({
        connection,
        sender: senderPubkey,
        amountCommitment: commitmentBytes,
        stealthPubkey: stealthKeypair.publicKey,
        ephemeralPubkey: ephemeralBytes,
        viewingKeyHash,
        encryptedAmount: encryptedSeed,
        proof,
        actualAmount: BigInt(amountLamports),
      })

      tx.add(ix)

      return tx
    },

    getExplorerUrl: (txSignature: string, cluster?: string): string => {
      const base = `https://solscan.io/tx/${txSignature}`
      if (!cluster || cluster === "mainnet-beta") return base
      return `${base}?cluster=${cluster}`
    },
  }
}
