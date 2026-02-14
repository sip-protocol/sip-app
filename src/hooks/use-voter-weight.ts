"use client"

import { useState, useEffect } from "react"
import { RealmsReader } from "@/lib/governance/realms-reader"

export interface UseVoterWeightReturn {
  weight: string | null
  isLoading: boolean
}

export function useVoterWeight(daoId: string | null): UseVoterWeightReturn {
  const [weight, setWeight] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!daoId) {
      setWeight(null)
      return
    }

    const reader = new RealmsReader("simulation")

    async function load() {
      setIsLoading(true)
      try {
        const w = await reader.getVoterWeight(daoId!)
        setWeight(w)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [daoId])

  return { weight, isLoading }
}
