"use client"

import { useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import {
  createCommitmentStore,
  type CommitmentType,
} from "@/lib/solana/commitment-store"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"
import { useDemoModeStore } from "@/stores/demo-mode"
import { logger } from "@/lib/logger"

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
        logger.warn(
          `[SIP-COMMIT:${commitmentType}] skip: no publicKey`,
          "useOnChainCommit"
        )
        return null
      }
      if (
        isDemoMode &&
        typeof window !== "undefined" &&
        !window.__SIP_TEST_WALLET
      ) {
        logger.warn(
          `[SIP-COMMIT:${commitmentType}] skip: demo mode without test wallet`,
          "useOnChainCommit"
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
          logger.info(
            `[SIP-COMMIT:${commitmentType}] tx: ${sig}`,
            "useOnChainCommit"
          )
        }
        return sig
      } catch (err) {
        logger.error(
          `[SIP-COMMIT:${commitmentType}] error`,
          err,
          "useOnChainCommit"
        )
        return null
      }
    },
    [publicKey, connection, tx, isDemoMode, commitmentType]
  )

  return { commit, tx }
}
