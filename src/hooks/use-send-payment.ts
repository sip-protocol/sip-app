"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import type { ViewingKey } from "@sip-protocol/types"
import type { PrivacyLevel } from "@/components/payments/privacy-toggle"
import type { Token } from "@/components/payments/amount-input"
import type { TxStatus } from "@/components/payments/transaction-status"
import { createStealthTransfer } from "@/lib/solana/stealth-transfer"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"

interface SendPaymentParams {
  recipient: string
  amount: string
  token: Token
  privacyLevel: PrivacyLevel
  /** Viewing key for compliant mode (encrypted with transaction) */
  viewingKey?: ViewingKey | null
}

interface SendPaymentResult {
  txHash: string
}

interface UseSendPaymentResult {
  status: TxStatus
  txHash: string | null
  error: string | null
  send: (params: SendPaymentParams) => Promise<SendPaymentResult | undefined>
  reset: () => void
}

/**
 * Parse a SIP meta-address string into spending and viewing public keys.
 * Format: sip:solana:<spendingPubKey>:<viewingPubKey>
 */
function parseMetaAddress(metaAddress: string): {
  spendingPublicKey: string
  viewingPublicKey: string
} {
  const parts = metaAddress.split(":")
  if (parts.length !== 4 || parts[0] !== "sip" || parts[1] !== "solana") {
    throw new Error(
      "Invalid SIP meta-address format. Expected: sip:solana:<spending>:<viewing>"
    )
  }
  return {
    spendingPublicKey: parts[2],
    viewingPublicKey: parts[3],
  }
}

export function useSendPayment(): UseSendPaymentResult {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const tx = useSolanaTransaction()

  const [status, setStatus] = useState<TxStatus>("idle")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setTxHash(null)
    setError(null)
    tx.reset()
  }, [tx])

  const send = useCallback(
    async (
      params: SendPaymentParams
    ): Promise<SendPaymentResult | undefined> => {
      if (!publicKey) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setStatus("pending")
        setError(null)
        setTxHash(null)

        // 1. Parse recipient meta-address → spending + viewing keys (base58)
        const { spendingPublicKey, viewingPublicKey } = parseMetaAddress(
          params.recipient
        )

        // 2. Convert amount to lamports (minimum 0.002 SOL to cover claim costs)
        const amountSol = parseFloat(params.amount)
        if (isNaN(amountSol) || amountSol <= 0) {
          throw new Error("Invalid amount")
        }
        if (amountSol < 0.002) {
          throw new Error(
            "Minimum shielded transfer is 0.002 SOL (covers on-chain claim costs)"
          )
        }
        const amountLamports = Math.floor(amountSol * 1_000_000_000)

        // 3. Create stealth transfer (DKSAP + encrypted keypair + commitment)
        const transfer = await createStealthTransfer({
          amountLamports,
          recipientViewingPublicKey: viewingPublicKey,
          recipientSpendingPublicKey: spendingPublicKey,
        })

        // 4. Build signable Solana transaction
        const transaction = await transfer.buildTransaction(
          publicKey,
          connection.rpcEndpoint
        )

        // 5. Sign + send + confirm via wallet adapter
        const signature = await tx.sendTransaction(transaction)
        if (!signature) {
          throw new Error("Transaction was rejected or failed")
        }

        setTxHash(signature)
        setStatus("confirmed")

        console.log("Shielded payment sent:", {
          recipient: params.recipient,
          amount: params.amount,
          stealthAddress: transfer.stealthAddress,
          txSignature: signature,
          explorerUrl: transfer.getExplorerUrl(signature),
        })

        return { txHash: signature }
      } catch (err) {
        console.error("Send payment error:", err)
        setError(err instanceof Error ? err.message : "Transaction failed")
        setStatus("error")
        return undefined
      }
    },
    [publicKey, connection, tx]
  )

  return { status, txHash, error, send, reset }
}
