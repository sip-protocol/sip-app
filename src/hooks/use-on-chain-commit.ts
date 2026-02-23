"use client"

import { useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import {
  createCommitmentStore,
  type CommitmentType,
} from "@/lib/solana/commitment-store"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"
import { useDemoModeStore } from "@/stores/demo-mode"

/**
 * Generic on-chain commitment hook for any track.
 *
 * Builds a 1-lamport self-transfer with SIP-COMMIT:{type}:{hash} memo.
 * Returns a `commit(id, data)` function matching the `onCommitTransaction`
 * callback signature used by all track services.
 *
 * In demo mode without a wallet (or without test wallet), returns null.
 * When __SIP_TEST_WALLET is set, real tx fires even in demo mode.
 */
export function useOnChainCommit(commitmentType: CommitmentType) {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const tx = useSolanaTransaction()
  const isDemoMode = useDemoModeStore((s) => s.isDemoMode)

  const commit = useCallback(
    async (id: string, data: string): Promise<string | null> => {
      if (!publicKey) return null
      if (isDemoMode && typeof window !== "undefined" && !window.__SIP_TEST_WALLET)
        return null

      const store = await createCommitmentStore({
        data: `${id}:${data}`,
        commitmentType,
      })

      const transaction = await store.buildTransaction(
        publicKey,
        connection.rpcEndpoint
      )

      return tx.sendTransaction(transaction)
    },
    [publicKey, connection, tx, isDemoMode, commitmentType]
  )

  return { commit, tx }
}
