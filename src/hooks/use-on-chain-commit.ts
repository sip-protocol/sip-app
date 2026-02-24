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
 * Builds a VerifyCommitment instruction via the SIP Privacy program.
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
      if (!publicKey) {
        console.warn(`[SIP-COMMIT:${commitmentType}] skip: no publicKey`)
        return null
      }
      if (
        isDemoMode &&
        typeof window !== "undefined" &&
        !window.__SIP_TEST_WALLET
      ) {
        console.warn(
          `[SIP-COMMIT:${commitmentType}] skip: demo mode without test wallet`
        )
        return null
      }

      try {
        const store = await createCommitmentStore({
          data: `${id}:${data}`,
          commitmentType,
        })

        const transaction = await store.buildTransaction(
          publicKey,
          connection.rpcEndpoint
        )

        const sig = await tx.sendTransaction(transaction)
        if (sig) {
          console.info(`[SIP-COMMIT:${commitmentType}] tx: ${sig}`)
        }
        return sig
      } catch (err) {
        console.error(`[SIP-COMMIT:${commitmentType}] error:`, err)
        return null
      }
    },
    [publicKey, connection, tx, isDemoMode, commitmentType]
  )

  return { commit, tx }
}
