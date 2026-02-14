"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"

export interface UseSunriseBalanceReturn {
  gsolBalance: number | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

/**
 * Fetch gSOL token balance for the connected wallet.
 * In simulation mode, returns a mock balance.
 */
export function useSunriseBalance(): UseSunriseBalanceReturn {
  const { publicKey } = useWallet()
  const [gsolBalance, setGsolBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = async () => {
    if (!publicKey) {
      setGsolBalance(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Simulation: mock gSOL balance
      // Future: use getParsedTokenAccountsByOwner with GSOL_MINT filter
      setGsolBalance(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balance")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey?.toBase58()])

  return { gsolBalance, isLoading, error, refresh: fetchBalance }
}
