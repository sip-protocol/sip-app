"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import {
  createCommitmentStore,
} from "@/lib/solana/commitment-store"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"
import type { UseSolanaTransactionReturn } from "@/hooks/use-solana-transaction"

export interface TicketCommitmentResult {
  commitmentHash: string
  salt: string
  explorerUrl: string | null
}

export interface UseTicketCommitmentReturn {
  /** Last commitment result after successful commit */
  lastCommitment: TicketCommitmentResult | null
  /** Solana transaction lifecycle state */
  tx: UseSolanaTransactionReturn
  /** Commit a ticket purchase on-chain (SIP-COMMIT:ticket memo) */
  commitPurchase: (eventId: string, tier: string) => Promise<string | null>
}

export function useTicketCommitment(): UseTicketCommitmentReturn {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const tx = useSolanaTransaction()

  const [lastCommitment, setLastCommitment] = useState<TicketCommitmentResult | null>(null)

  const commitPurchase = useCallback(
    async (eventId: string, tier: string): Promise<string | null> => {
      if (!publicKey) return null

      const data = `${eventId}:${tier}`
      const store = await createCommitmentStore({
        data,
        commitmentType: "ticket",
      })

      const transaction = await store.buildTransaction(
        publicKey,
        connection.rpcEndpoint
      )

      const signature = await tx.sendTransaction(transaction)

      if (signature) {
        setLastCommitment({
          commitmentHash: store.commitmentHash,
          salt: store.salt,
          explorerUrl: store.getExplorerUrl(signature),
        })
      }

      return signature
    },
    [publicKey, connection, tx]
  )

  return { lastCommitment, tx, commitPurchase }
}
