"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { createStealthTransfer } from "@/lib/solana/stealth-transfer"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"

export interface TipResult {
  stealthAddress: string
  commitment: string
  txSignature: string
  explorerUrl: string
}

// Default recipient viewing + spending keys for stealth tips (base58)
// In production: per-artist meta-address from profile
const DEFAULT_RECIPIENT_VIEWING_KEY =
  process.env.NEXT_PUBLIC_RECIPIENT_VIEWING_PUBKEY ??
  "11111111111111111111111111111111"

const DEFAULT_RECIPIENT_SPENDING_KEY =
  process.env.NEXT_PUBLIC_RECIPIENT_SPENDING_PUBKEY ??
  "11111111111111111111111111111111"

export function useStealthTip() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const tx = useSolanaTransaction()
  const [lastTip, setLastTip] = useState<TipResult | null>(null)

  const sendTip = useCallback(
    async (
      amountSol: number,
      artistName?: string,
      recipientViewingKey?: string,
      recipientSpendingKey?: string
    ): Promise<TipResult | null> => {
      if (!publicKey) return null

      const amountLamports = Math.floor(amountSol * 1_000_000_000)

      const transfer = await createStealthTransfer({
        amountLamports,
        memo: artistName ? `SIP-TIP:${artistName}` : "SIP-TIP",
        recipientViewingPublicKey:
          recipientViewingKey ?? DEFAULT_RECIPIENT_VIEWING_KEY,
        recipientSpendingPublicKey:
          recipientSpendingKey ?? DEFAULT_RECIPIENT_SPENDING_KEY,
      })

      const transaction = await transfer.buildTransaction(
        publicKey,
        connection.rpcEndpoint
      )

      const signature = await tx.sendTransaction(transaction)
      if (!signature) return null

      const result: TipResult = {
        stealthAddress: transfer.stealthAddress,
        commitment: transfer.commitment.commitmentHash,
        txSignature: signature,
        explorerUrl: transfer.getExplorerUrl(signature),
      }

      setLastTip(result)
      return result
    },
    [publicKey, connection, tx]
  )

  return { sendTip, lastTip, tx }
}
