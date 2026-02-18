/**
 * Stealth Transfer Primitive
 *
 * Builds real Solana transactions that send SOL to one-time stealth addresses.
 * Uses @sip-protocol/sdk for stealth address generation and Pedersen commitments.
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
  SystemProgram,
} from "@solana/web3.js"
import { createMemoInstruction } from "@solana/spl-memo"

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
  buildTransaction: (senderPubkey: PublicKey, rpcUrl: string) => Promise<Transaction>
  /** Generate a Solscan explorer URL for a given tx signature */
  getExplorerUrl: (txSignature: string, cluster?: string) => string
}

/**
 * Create a stealth transfer: generates a one-time address, commits the amount,
 * and returns a transaction builder for the caller to sign and send.
 *
 * @param params - Transfer parameters (amount in lamports, optional memo)
 * @returns Stealth address, commitment, and transaction builder
 *
 * @example
 * ```ts
 * const transfer = await createStealthTransfer({ amountLamports: 1_000_000 })
 * const tx = await transfer.buildTransaction(walletPubkey, rpcUrl)
 * // sign + send tx via wallet adapter
 * const url = transfer.getExplorerUrl(txSignature, "devnet")
 * ```
 */
export async function createStealthTransfer(
  params: StealthTransferParams
): Promise<StealthTransferResult> {
  const { amountLamports, memo } = params
  const sdk = await getSDK()

  // 1. Generate one-time stealth address
  const { metaAddress } = sdk.generateStealthMetaAddress("solana")
  const stealthResult = sdk.generateStealthAddress(metaAddress)

  // 2. Create Pedersen commitment of the transfer amount
  const commitment = await createRealCommitment(BigInt(amountLamports))

  // 3. Encode meta-address for storage/display
  const metaAddressStr = sdk.encodeStealthMetaAddress(metaAddress)

  // Raw address string (no sip: prefix) — directly usable with Solana PublicKey
  const rawStealthAddress = String(stealthResult.stealthAddress.address)
  const ephemeralPubKey = String(stealthResult.stealthAddress.ephemeralPublicKey)

  return {
    stealthAddress: rawStealthAddress,
    ephemeralPublicKey: ephemeralPubKey,
    commitment,
    metaAddress: metaAddressStr,

    /**
     * Build a signable Solana transaction that transfers SOL to the stealth address.
     * Fetches a recent blockhash from the provided RPC endpoint.
     */
    buildTransaction: async (
      senderPubkey: PublicKey,
      rpcUrl: string
    ): Promise<Transaction> => {
      const connection = new Connection(rpcUrl, "confirmed")
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed")

      const recipientPubkey = new PublicKey(rawStealthAddress)

      const tx = new Transaction({
        feePayer: senderPubkey,
        blockhash,
        lastValidBlockHeight,
      })

      // SOL transfer instruction
      tx.add(
        SystemProgram.transfer({
          fromPubkey: senderPubkey,
          toPubkey: recipientPubkey,
          lamports: amountLamports,
        })
      )

      // Optional memo instruction (e.g., for tagging stealth transfers)
      if (memo) {
        tx.add(createMemoInstruction(memo))
      }

      return tx
    },

    /**
     * Generate a Solscan explorer URL for a transaction signature.
     * Defaults to devnet; pass "mainnet-beta" for production.
     */
    getExplorerUrl: (txSignature: string, cluster?: string): string => {
      const base = `https://solscan.io/tx/${txSignature}`
      if (cluster === "mainnet-beta") return base
      return `${base}?cluster=${cluster ?? "devnet"}`
    },
  }
}
