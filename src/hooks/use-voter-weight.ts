"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { RealmsReader } from "@/lib/governance/realms-reader"
import { useDemoModeStore } from "@/stores/demo-mode"

export interface UseVoterWeightReturn {
  weight: string | null
  tokenOwnerRecordPubkey: string | null
  isLoading: boolean
}

export function useVoterWeight(daoId: string | null): UseVoterWeightReturn {
  const { publicKey } = useWallet()
  const isDemoMode = useDemoModeStore((s) => s.isDemoMode)
  const [weight, setWeight] = useState<string | null>(null)
  const [tokenOwnerRecordPubkey, setTokenOwnerRecordPubkey] = useState<
    string | null
  >(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!daoId) {
      setWeight(null)
      setTokenOwnerRecordPubkey(null)
      return
    }

    const reader = new RealmsReader("realms")

    async function load() {
      setIsLoading(true)
      try {
        // In demo mode, use simulated weight even with a real wallet connected
        const walletAddress = isDemoMode ? undefined : publicKey?.toBase58()
        const info = await reader.getVoterInfo(daoId!, walletAddress)
        setWeight(info.weight)
        setTokenOwnerRecordPubkey(info.tokenOwnerRecordPubkey ?? null)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [daoId, publicKey, isDemoMode])

  return { weight, tokenOwnerRecordPubkey, isLoading }
}
