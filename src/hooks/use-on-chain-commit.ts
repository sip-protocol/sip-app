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
      console.log("[SIP-COMMIT] called", {
        commitmentType,
        hasPublicKey: !!publicKey,
        isDemoMode,
        hasTestWallet: typeof window !== "undefined" && !!window.__SIP_TEST_WALLET,
        rpcEndpoint: connection.rpcEndpoint,
      })

      if (!publicKey) {
        console.log("[SIP-COMMIT] bail: no publicKey")
        return null
      }
      if (isDemoMode && typeof window !== "undefined" && !window.__SIP_TEST_WALLET) {
        console.log("[SIP-COMMIT] bail: demo mode without test wallet")
        return null
      }

      try {
        console.log("[SIP-COMMIT] building commitment store...")
        const store = await createCommitmentStore({
          data: `${id}:${data}`,
          commitmentType,
        })
        console.log("[SIP-COMMIT] store created, building tx...")

        const transaction = await store.buildTransaction(
          publicKey,
          connection.rpcEndpoint
        )
        console.log("[SIP-COMMIT] tx built, sending...")

        const sig = await tx.sendTransaction(transaction)
        console.log("[SIP-COMMIT] result:", sig)
        return sig
      } catch (err) {
        console.error("[SIP-COMMIT] error:", err)
        return null
      }
    },
    [publicKey, connection, tx, isDemoMode, commitmentType]
  )

  return { commit, tx }
}
