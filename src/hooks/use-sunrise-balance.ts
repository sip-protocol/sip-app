"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { useDemoModeStore } from "@/stores/demo-mode"
import { GSOL_MINT } from "@/lib/migrations/constants"
import { logger } from "@/lib/logger"

const gsolMintPubkey = new PublicKey(GSOL_MINT)

export interface UseSunriseBalanceReturn {
  gsolBalance: number | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

/**
 * Fetch gSOL token balance for the connected wallet.
 *
 * When a wallet is connected, queries on-chain token accounts via
 * `getParsedTokenAccountsByOwner` filtered by the gSOL mint address.
 * Falls back to 0 on error or when no wallet is connected.
 * In demo mode, returns a static mock balance.
 */
export function useSunriseBalance(): UseSunriseBalanceReturn {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const isDemoMode = useDemoModeStore((s) => s.isDemoMode)
  const [gsolBalance, setGsolBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Bumped by refresh() to re-run the fetch effect without duplicating its logic
  const [refreshNonce, setRefreshNonce] = useState(0)

  // The effect owns its async work with a cancel guard so a settled query never
  // updates state after unmount or after a dependency change.
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!publicKey && !isDemoMode) {
        setGsolBalance(null)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        if (isDemoMode || !publicKey) {
          // Demo mode: return a representative mock balance
          setGsolBalance(isDemoMode ? 12.5 : 0)
          return
        }

        // Real wallet scan: query gSOL token accounts owned by the connected wallet
        const result = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { mint: gsolMintPubkey }
        )

        const balance =
          result.value[0]?.account.data.parsed.info.tokenAmount.uiAmount ?? 0

        if (!cancelled) setGsolBalance(balance)
      } catch (err) {
        logger.warn(
          `[SIP] Failed to fetch gSOL balance, defaulting to 0: ${err instanceof Error ? err.message : err}`,
          "useSunriseBalance"
        )
        if (!cancelled) {
          setGsolBalance(0)
          setError(
            err instanceof Error ? err.message : "Failed to fetch gSOL balance"
          )
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [publicKey, connection, isDemoMode, refreshNonce])

  // Manual refresh re-runs the fetch effect via a nonce bump (single fetch path)
  const refresh = useCallback(() => {
    setRefreshNonce((n) => n + 1)
  }, [])

  return { gsolBalance, isLoading, error, refresh }
}
