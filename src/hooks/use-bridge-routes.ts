"use client"

import { useMemo } from "react"
import {
  getAvailableDestChains,
  getTokensForRoute,
  getRoute,
  BRIDGE_CHAINS,
} from "@/lib/bridge/constants"
import type { BridgeChainId, BridgeRoute } from "@/lib/bridge/types"
import type { ChainInfo } from "@/lib/bridge/constants"

interface UseBridgeRoutesReturn {
  availableDestChains: BridgeChainId[]
  availableTokens: string[]
  route: BridgeRoute | undefined
  sourceChainInfo: ChainInfo | undefined
  destChainInfo: ChainInfo | undefined
  estimatedTime: number | null
}

export function useBridgeRoutes(
  sourceChain: BridgeChainId | null,
  destChain: BridgeChainId | null,
): UseBridgeRoutesReturn {
  return useMemo(() => {
    if (!sourceChain) {
      return {
        availableDestChains: [],
        availableTokens: [],
        route: undefined,
        sourceChainInfo: undefined,
        destChainInfo: undefined,
        estimatedTime: null,
      }
    }

    const availableDestChains = getAvailableDestChains(sourceChain)
    const route =
      destChain ? getRoute(sourceChain, destChain) : undefined
    const availableTokens =
      destChain ? getTokensForRoute(sourceChain, destChain) : []

    return {
      availableDestChains,
      availableTokens,
      route,
      sourceChainInfo: BRIDGE_CHAINS[sourceChain],
      destChainInfo: destChain ? BRIDGE_CHAINS[destChain] : undefined,
      estimatedTime: route?.estimatedTime ?? null,
    }
  }, [sourceChain, destChain])
}
