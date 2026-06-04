"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { RealmsReader } from "@/lib/governance/realms-reader"

export interface UseVoterWeightReturn {
  weight: string | null
  tokenOwnerRecordPubkey: string | null
  isLoading: boolean
}

export function useVoterWeight(daoId: string | null): UseVoterWeightReturn {
  const { publicKey } = useWallet()
  const [weight, setWeight] = useState<string | null>(null)
  const [tokenOwnerRecordPubkey, setTokenOwnerRecordPubkey] = useState<
    string | null
  >(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!daoId) {
        setWeight(null)
        setTokenOwnerRecordPubkey(null)
        return
      }

      const reader = new RealmsReader("realms")
      setIsLoading(true)
      try {
        const info = await reader.getVoterInfo(daoId, publicKey?.toBase58())
        if (!cancelled) {
          setWeight(info.weight)
          setTokenOwnerRecordPubkey(info.tokenOwnerRecordPubkey ?? null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [daoId, publicKey])

  return { weight, tokenOwnerRecordPubkey, isLoading }
}
