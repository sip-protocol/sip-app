"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import type { ViewingKey } from "@sip-protocol/types"
import type { PrivacyLevel } from "@/components/payments/privacy-toggle"
import type { Token } from "@/components/payments/amount-input"
import type { TxStatus } from "@/components/payments/transaction-status"

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

export function useSendPayment(): UseSendPaymentResult {
  const { publicKey, signTransaction } = useWallet()

  const [status, setStatus] = useState<TxStatus>("idle")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setTxHash(null)
    setError(null)
  }, [])

  const send = useCallback(
    async (
      params: SendPaymentParams
    ): Promise<SendPaymentResult | undefined> => {
      if (!publicKey || !signTransaction) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setStatus("pending")
        setError(null)
        setTxHash(null)

        // TODO: Integrate with @sip-protocol/sdk
        // For now, simulate a transaction for demo purposes
        // In production, this will use:
        //
        // import { useSIP } from '@sip-protocol/react'
        // const { shieldedTransfer } = useSIP()
        // const tx = await shieldedTransfer({
        //   recipient: params.recipient,
        //   amount: parseUnits(params.amount, params.token === 'SOL' ? 9 : 6),
        //   privacyLevel: params.privacyLevel,
        //   viewingKey: params.viewingKey, // For compliant mode
        // })

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // For demo: generate a mock tx hash
        const mockTxHash = Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("")

        setTxHash(mockTxHash)
        setStatus("confirmed")

        // Log for debugging
        console.log("Shielded payment sent:", {
          ...params,
          from: publicKey.toBase58(),
          txHash: mockTxHash,
          viewingKeyHash: params.viewingKey?.hash ?? null,
        })

        return { txHash: mockTxHash }
      } catch (err) {
        console.error("Send payment error:", err)
        setError(err instanceof Error ? err.message : "Transaction failed")
        setStatus("error")
        return undefined
      }
    },
    [publicKey, signTransaction]
  )

  return { status, txHash, error, send, reset }
}
