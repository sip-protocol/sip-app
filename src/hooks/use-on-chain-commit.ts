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
 * Returns null only when no wallet is connected.
 * Real transactions fire whenever a wallet is connected, even in demo mode.
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
        logger.info(
          `[SIP-COMMIT:${commitmentType}] demo mode with real wallet — proceeding with on-chain tx`,
          "useOnChainCommit"
        )
      }

      // When test wallet is present, emit directly to console so Playwright
      // can capture SIP-COMMIT logs even against production builds.
      const isTestWallet =
        typeof window !== "undefined" && !!window.__SIP_TEST_WALLET

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
          const msg = `[SIP-COMMIT:${commitmentType}] tx: ${sig}`
          logger.info(msg, "useOnChainCommit")
          if (isTestWallet) console.info(msg)
        }
        return sig
      } catch (err) {
        const msg = `[SIP-COMMIT:${commitmentType}] error: ${err instanceof Error ? err.message : String(err)}`
        logger.error(msg, err, "useOnChainCommit")
        if (isTestWallet) console.error(msg)
        return null
      }
    },
    [publicKey, connection, tx, isDemoMode, commitmentType]
  )

  return { commit, tx }
}
