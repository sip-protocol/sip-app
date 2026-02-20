"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { createStealthTransfer } from "@/lib/solana/stealth-transfer"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"

export interface FundResult {
  stealthAddress: string
  commitment: string
  txSignature: string
  explorerUrl: string
}

/** Tier amounts in SOL */
const TIER_AMOUNTS: Record<string, number> = {
  micro: 0.01,
  seed: 0.1,
  research: 0.5,
  grant: 1.0,
}

/**
 * Hook for sending anonymous research funding via stealth addresses.
 *
 * Builds a real Solana transaction that sends SOL to a one-time stealth address,
 * tagged with the project ID in the memo for indexing.
 */
// Default recipient viewing + spending keys for stealth funding
// In production: per-project meta-address from project profile
const DEFAULT_RECIPIENT_VIEWING_KEY =
  process.env.NEXT_PUBLIC_RECIPIENT_VIEWING_PUBKEY ??
  "0x0000000000000000000000000000000000000000000000000000000000000000"

const DEFAULT_RECIPIENT_SPENDING_KEY =
  process.env.NEXT_PUBLIC_RECIPIENT_SPENDING_PUBKEY ??
  "0x0000000000000000000000000000000000000000000000000000000000000000"

export function useStealthFund() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const tx = useSolanaTransaction()
  const [lastFund, setLastFund] = useState<FundResult | null>(null)

  const sendFund = useCallback(
    async (
      projectId: string,
      tier: string,
      projectTitle?: string,
      recipientViewingKey?: string,
      recipientSpendingKey?: string
    ): Promise<FundResult | null> => {
      if (!publicKey) return null

      const amountSol = TIER_AMOUNTS[tier] ?? 0.01
      const amountLamports = Math.floor(amountSol * 1_000_000_000)

      const transfer = await createStealthTransfer({
        amountLamports,
        memo: `SIP-FUND:${projectId}${projectTitle ? `:${projectTitle}` : ""}`,
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

      const result: FundResult = {
        stealthAddress: transfer.stealthAddress,
        commitment: transfer.commitment.commitmentHash,
        txSignature: signature,
        explorerUrl: transfer.getExplorerUrl(signature),
      }

      setLastFund(result)
      return result
    },
    [publicKey, connection, tx]
  )

  return { sendFund, lastFund, tx }
}
