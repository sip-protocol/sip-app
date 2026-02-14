import type { BridgeChainId, BridgeRoute, BridgeStep } from "./types"

export interface ChainInfo {
  id: BridgeChainId
  name: string
  icon: string
  nativeToken: string
  explorerUrl: string
  wormholeChainId: number
}

export const BRIDGE_CHAINS: Record<BridgeChainId, ChainInfo> = {
  solana: {
    id: "solana",
    name: "Solana",
    icon: "/tokens/sol.png",
    nativeToken: "SOL",
    explorerUrl: "https://solscan.io",
    wormholeChainId: 1,
  },
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    icon: "/tokens/eth.png",
    nativeToken: "ETH",
    explorerUrl: "https://etherscan.io",
    wormholeChainId: 2,
  },
  base: {
    id: "base",
    name: "Base",
    icon: "/tokens/base.png",
    nativeToken: "ETH",
    explorerUrl: "https://basescan.org",
    wormholeChainId: 30,
  },
  arbitrum: {
    id: "arbitrum",
    name: "Arbitrum",
    icon: "/tokens/arb.png",
    nativeToken: "ETH",
    explorerUrl: "https://arbiscan.io",
    wormholeChainId: 23,
  },
  optimism: {
    id: "optimism",
    name: "Optimism",
    icon: "/tokens/op.png",
    nativeToken: "ETH",
    explorerUrl: "https://optimistic.etherscan.io",
    wormholeChainId: 24,
  },
}

export const BRIDGE_TOKENS = ["USDC", "SOL", "ETH"] as const

export const BRIDGE_ROUTES: BridgeRoute[] = [
  { sourceChain: "solana", destChain: "ethereum", tokens: ["USDC"], estimatedTime: 15, available: true },
  { sourceChain: "solana", destChain: "base", tokens: ["USDC"], estimatedTime: 12, available: true },
  { sourceChain: "solana", destChain: "arbitrum", tokens: ["USDC"], estimatedTime: 12, available: true },
  { sourceChain: "solana", destChain: "optimism", tokens: ["USDC"], estimatedTime: 12, available: true },
  { sourceChain: "ethereum", destChain: "solana", tokens: ["USDC"], estimatedTime: 15, available: true },
  { sourceChain: "base", destChain: "solana", tokens: ["USDC"], estimatedTime: 12, available: true },
  { sourceChain: "arbitrum", destChain: "solana", tokens: ["USDC"], estimatedTime: 12, available: true },
  { sourceChain: "optimism", destChain: "solana", tokens: ["USDC"], estimatedTime: 12, available: true },
  { sourceChain: "ethereum", destChain: "base", tokens: ["USDC", "ETH"], estimatedTime: 10, available: true },
  { sourceChain: "ethereum", destChain: "arbitrum", tokens: ["USDC", "ETH"], estimatedTime: 10, available: true },
  { sourceChain: "base", destChain: "ethereum", tokens: ["USDC", "ETH"], estimatedTime: 10, available: true },
  { sourceChain: "arbitrum", destChain: "ethereum", tokens: ["USDC", "ETH"], estimatedTime: 10, available: true },
]

export const SIMULATION_DELAYS: Record<BridgeStep, number> = {
  generating_stealth: 1500,
  initiating_transfer: 2000,
  awaiting_attestation: 3000,
  relaying: 2000,
  complete: 0,
  failed: 0,
}

export const BRIDGE_FEE_BPS = 30

export const MAX_BRIDGE_HISTORY = 50

export function getRoute(
  source: BridgeChainId,
  dest: BridgeChainId,
): BridgeRoute | undefined {
  return BRIDGE_ROUTES.find(
    (r) => r.sourceChain === source && r.destChain === dest,
  )
}

export function getRoutesForSource(source: BridgeChainId): BridgeRoute[] {
  return BRIDGE_ROUTES.filter((r) => r.sourceChain === source && r.available)
}

export function getAvailableDestChains(source: BridgeChainId): BridgeChainId[] {
  return getRoutesForSource(source).map((r) => r.destChain)
}

export function getTokensForRoute(
  source: BridgeChainId,
  dest: BridgeChainId,
): string[] {
  return getRoute(source, dest)?.tokens ?? []
}
