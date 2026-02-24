"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { useStealthKeys } from "./use-stealth-keys"
import { SIP_PROGRAM_ID } from "@/lib/solana/program-client"
import { NULLIFIER_ACCOUNT_SIZE } from "@/lib/solana/stealth-transfer"
import { sha256 } from "@noble/hashes/sha2.js"
import bs58 from "bs58"
import { logger } from "@/lib/logger"

export interface DetectedPayment {
  /** TransferRecord PDA address (base58) */
  id: string
  /** SOL balance of stealth account (in SOL) */
  amount: number
  token: "SOL"
  /** Stealth recipient pubkey (base58) */
  stealthAddress: string
  /** Encrypted stealth seed from TransferRecord (for claiming) */
  encryptedSeed: Uint8Array
  /** Ephemeral public key from TransferRecord (33 bytes, first byte is 0x02 prefix) */
  ephemeralPubkey: Uint8Array
  /** Unix timestamp (seconds) */
  timestamp: number
  /** Whether this payment has been claimed */
  claimed: boolean
  /** TransferRecord PDA address (base58) — same as id */
  transferRecordPda: string
}

interface UseScanPaymentsResult {
  payments: DetectedPayment[]
  isScanning: boolean
  error: string | null
  progress: number
  scan: () => Promise<void>
}

/**
 * TransferRecord byte layout:
 *   0..8:     discriminator
 *   8..40:    sender (Pubkey)
 *   40..72:   stealth_recipient (Pubkey)
 *   72..105:  amount_commitment ([u8;33])
 *   105..138: ephemeral_pubkey ([u8;33])
 *   138..170: viewing_key_hash ([u8;32])
 *   170..174: encrypted_amount length (u32 LE)
 *   174..174+N: encrypted_amount data
 *   After Vec: timestamp (i64), claimed (bool), ...
 */
function parseTransferRecord(data: Uint8Array) {
  const stealthRecipient = new PublicKey(data.slice(40, 72))
  const ephemeralPubkey = data.slice(105, 138) // 33 bytes
  const viewingKeyHash = data.slice(138, 170) // 32 bytes

  // encrypted_amount Vec<u8>
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  const encLen = view.getUint32(170, true)
  const encryptedSeed = data.slice(174, 174 + encLen)

  // After Vec: timestamp (i64, Unix seconds) + claimed (bool)
  const afterVec = 174 + encLen
  const timestampBigInt = view.getBigInt64(afterVec, true)
  const timestamp = Number(timestampBigInt) * 1000 // Convert seconds → milliseconds
  const claimed = data[afterVec + 8] !== 0

  return {
    stealthRecipient,
    ephemeralPubkey,
    viewingKeyHash,
    encryptedSeed,
    timestamp,
    claimed,
  }
}

export function useScanPayments(): UseScanPaymentsResult {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const { keys } = useStealthKeys()

  const [payments, setPayments] = useState<DetectedPayment[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const scan = useCallback(async () => {
    if (!publicKey || !keys) {
      setError("Wallet not connected or stealth keys not generated")
      return
    }

    setIsScanning(true)
    setError(null)
    setProgress(0)

    try {
      // Compute viewing key hash for memcmp filter (viewing key is base58)
      const viewingKeyBytes = bs58.decode(keys.viewingPublicKey)
      const viewingKeyHash = sha256(viewingKeyBytes)

      setProgress(20)

      // Query all TransferRecords matching our viewing key hash
      // memcmp filter at byte offset 138 (viewing_key_hash field)
      const accounts = await connection.getProgramAccounts(SIP_PROGRAM_ID, {
        commitment: "confirmed",
        filters: [
          {
            memcmp: {
              offset: 138,
              bytes: bs58.encode(viewingKeyHash),
            },
          },
        ],
      })

      setProgress(60)

      // Compute nullifier rent to subtract from displayed balance.
      // The sender pre-funds the stealth account with this amount so claiming is free.
      const nullifierRent = await connection.getMinimumBalanceForRentExemption(
        NULLIFIER_ACCOUNT_SIZE
      )

      // Parse each TransferRecord and get stealth account balances
      const detected: DetectedPayment[] = []

      for (const { pubkey, account } of accounts) {
        try {
          const record = parseTransferRecord(new Uint8Array(account.data))

          // Get balance of stealth account (infer SOL amount)
          const balance = await connection.getBalance(
            record.stealthRecipient,
            "confirmed"
          )

          // Net claimable = balance minus nullifier rent (pre-funded by sender)
          const netClaimable = record.claimed
            ? 0
            : Math.max(0, balance - nullifierRent) / 1_000_000_000

          detected.push({
            id: pubkey.toBase58(),
            amount: netClaimable,
            token: "SOL",
            stealthAddress: record.stealthRecipient.toBase58(),
            encryptedSeed: record.encryptedSeed,
            ephemeralPubkey: record.ephemeralPubkey,
            timestamp: record.timestamp,
            claimed: record.claimed,
            transferRecordPda: pubkey.toBase58(),
          })
        } catch {
          logger.warn(
            `Failed to parse TransferRecord ${pubkey.toBase58()}`,
            "useScanPayments"
          )
        }
      }

      // Sort by timestamp descending (newest first)
      detected.sort((a, b) => b.timestamp - a.timestamp)

      setPayments(detected)
      setProgress(100)
    } catch (err) {
      logger.error("Scan error", err, "useScanPayments")
      setError(err instanceof Error ? err.message : "Scan failed")
    } finally {
      setIsScanning(false)
    }
  }, [publicKey, connection, keys])

  return {
    payments,
    isScanning,
    error,
    progress,
    scan,
  }
}
