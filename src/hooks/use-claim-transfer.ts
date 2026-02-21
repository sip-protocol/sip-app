"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { useStealthKeys } from "./use-stealth-keys"
import { buildClaimTransaction } from "@/lib/solana/claim-transfer"
import type { DetectedPayment } from "./use-scan-payments"
import { usePaymentHistoryStore } from "@/stores/payment-history"

interface UseClaimTransferResult {
  /** Claim a detected stealth payment, returns tx signature or null */
  claim: (payment: DetectedPayment) => Promise<string | null>
  /** Whether a claim is currently in progress */
  isClaiming: boolean
  /** Error from the last claim attempt */
  error: string | null
}

export function useClaimTransfer(): UseClaimTransferResult {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { keys } = useStealthKeys()

  const [isClaiming, setIsClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const claim = useCallback(
    async (payment: DetectedPayment): Promise<string | null> => {
      if (!publicKey || !keys) {
        setError("Wallet not connected or stealth keys not generated")
        return null
      }

      if (payment.claimed) {
        setError("Payment already claimed")
        return null
      }

      setIsClaiming(true)
      setError(null)

      try {
        // Build the claim transaction
        const { transaction, stealthSigner } = await buildClaimTransaction({
          transferRecordPda: new PublicKey(payment.transferRecordPda),
          encryptedSeed: payment.encryptedSeed,
          ephemeralPubkey: payment.ephemeralPubkey.slice(1, 33), // Strip 0x02 prefix, pass raw 32 bytes
          stealthRecipient: new PublicKey(payment.stealthAddress),
          spendingPrivateKey: keys.spendingPrivateKey,
          recipientPubkey: publicKey,
          rpcUrl: connection.rpcEndpoint,
        })

        // Stealth account must sign (proves ownership of the one-time keypair)
        transaction.partialSign(stealthSigner)

        // Send via wallet adapter (wallet signs as fee payer / recipient)
        const signature = await sendTransaction(transaction, connection, {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        })

        // Wait for confirmation
        await connection.confirmTransaction(signature, "confirmed")

        // Record in payment history
        usePaymentHistoryStore.getState().addClaimed({
          walletAddress: publicKey.toBase58(),
          transferRecordPda: payment.transferRecordPda,
          amount: payment.amount,
          token: payment.token,
          txSignature: signature,
          stealthAddress: payment.stealthAddress,
          timestamp: Date.now(),
        })

        return signature
      } catch (err) {
        console.error("Claim failed:", err)
        setError(err instanceof Error ? err.message : "Claim failed")
        return null
      } finally {
        setIsClaiming(false)
      }
    },
    [publicKey, connection, keys, sendTransaction]
  )

  return {
    claim,
    isClaiming,
    error,
  }
}
