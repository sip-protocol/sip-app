"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import {
  createCommitmentStore,
  createRevealTransaction,
} from "@/lib/solana/commitment-store"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"
import type { UseSolanaTransactionReturn } from "@/hooks/use-solana-transaction"

export interface GameCommitmentResult {
  commitmentHash: string
  salt: string
  explorerUrl: string | null
}

export interface UseGameCommitmentReturn {
  /** Last commitment result after successful commit */
  lastCommitment: GameCommitmentResult | null
  /** Solana transaction lifecycle state */
  tx: UseSolanaTransactionReturn
  /** Commit a game move on-chain (SIP-COMMIT:move memo) */
  commitMove: (gameId: string, move: string) => Promise<string | null>
  /** Reveal a previously committed move on-chain (SIP-REVEAL:move memo) */
  revealMove: (gameId: string, move: string) => Promise<string | null>
}

export function useGameCommitment(): UseGameCommitmentReturn {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const tx = useSolanaTransaction()

  const [lastCommitment, setLastCommitment] =
    useState<GameCommitmentResult | null>(null)

  const commitMove = useCallback(
    async (gameId: string, move: string): Promise<string | null> => {
      if (!publicKey) return null

      const data = `${gameId}:${move}`
      const store = await createCommitmentStore({
        data,
        commitmentType: "move",
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

  const revealMove = useCallback(
    async (gameId: string, move: string): Promise<string | null> => {
      if (!publicKey || !lastCommitment) return null

      const data = `${gameId}:${move}`
      const transaction = await createRevealTransaction(
        data,
        lastCommitment.salt,
        "move",
        publicKey,
        connection.rpcEndpoint
      )

      return tx.sendTransaction(transaction)
    },
    [publicKey, connection, tx, lastCommitment]
  )

  return { lastCommitment, tx, commitMove, revealMove }
}
