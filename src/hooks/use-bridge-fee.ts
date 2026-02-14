"use client"

import { useMemo } from "react"
import { estimateBridgeFee } from "@/lib/bridge/stealth-bridge"
import { BRIDGE_FEE_BPS } from "@/lib/bridge/constants"
import type { BridgeFeeEstimate } from "@/lib/bridge/types"

interface UseBridgeFeeReturn {
  fee: BridgeFeeEstimate | null
  isEstimating: false
}

export function useBridgeFee(
  amount: string,
  token: string | null,
): UseBridgeFeeReturn {
  const fee = useMemo(() => {
    const numAmount = parseFloat(amount)
    if (!token || isNaN(numAmount) || numAmount <= 0) {
      return null
    }

    const est = estimateBridgeFee(amount, BRIDGE_FEE_BPS)
    return {
      bridgeFee: est.bridgeFee,
      gasFee: est.gasFee,
      totalFee: est.totalFee,
      token,
    }
  }, [amount, token])

  return { fee, isEstimating: false as const }
}
