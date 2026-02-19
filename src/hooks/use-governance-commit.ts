"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import {
  createCommitmentStore,
  createRevealTransaction,
} from "@/lib/solana/commitment-store"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"

export interface GovernanceCommitResult {
  commitmentHash: string | null
  salt: string | null
  tx: ReturnType<typeof useSolanaTransaction>
  commitVote: (
    proposalId: string,
    choice: number,
    weight: string
  ) => Promise<string | null>
  revealVote: (
    proposalId: string,
    choice: number,
    weight: string
  ) => Promise<string | null>
}

export function useGovernanceCommit(): GovernanceCommitResult {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const tx = useSolanaTransaction()
  const [commitmentHash, setCommitmentHash] = useState<string | null>(null)
  const [salt, setSalt] = useState<string | null>(null)

  const commitVote = useCallback(
    async (
      proposalId: string,
      choice: number,
      weight: string
    ): Promise<string | null> => {
      if (!publicKey) return null

      const data = `${proposalId}:${choice}:${weight}`
      const commitment = await createCommitmentStore({
        data,
        commitmentType: "vote",
      })

      setCommitmentHash(commitment.commitmentHash)
      setSalt(commitment.salt)

      const transaction = await commitment.buildTransaction(
        publicKey,
        connection.rpcEndpoint
      )

      return tx.sendTransaction(transaction)
    },
    [publicKey, connection, tx]
  )

  const revealVote = useCallback(
    async (
      proposalId: string,
      choice: number,
      weight: string
    ): Promise<string | null> => {
      if (!publicKey || !salt) return null

      const data = `${proposalId}:${choice}:${weight}`
      const transaction = await createRevealTransaction(
        data,
        salt,
        "vote",
        publicKey,
        connection.rpcEndpoint
      )

      return tx.sendTransaction(transaction)
    },
    [publicKey, salt, connection, tx]
  )

  return { commitmentHash, salt, tx, commitVote, revealVote }
}
