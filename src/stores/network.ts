import { create } from "zustand"
import { persist } from "zustand/middleware"
import { clusterApiUrl } from "@solana/web3.js"

type Cluster = "devnet" | "mainnet-beta"

interface NetworkState {
  cluster: Cluster
  customRpc: string | null
  rpcUrl: string
  isMainnet: boolean
  setCluster: (cluster: Cluster) => void
  setCustomRpc: (url: string | null) => void
  getExplorerUrl: (txOrAddress: string) => string
  reset: () => void
}

const HELIUS_MAINNET =
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://mainnet.helius-rpc.com/?api-key=142fb48a-aa24-4083-99c8-249df5400b30"

function getRpcUrl(cluster: Cluster, customRpc: string | null): string {
  if (customRpc) return customRpc
  if (cluster === "mainnet-beta") return HELIUS_MAINNET
  return clusterApiUrl("devnet")
}

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      cluster: "mainnet-beta" as Cluster,
      customRpc: null,
      rpcUrl: HELIUS_MAINNET,
      isMainnet: true,

      setCluster: (cluster) =>
        set({
          cluster,
          rpcUrl: getRpcUrl(cluster, get().customRpc),
          isMainnet: cluster === "mainnet-beta",
        }),

      setCustomRpc: (url) =>
        set({
          customRpc: url,
          rpcUrl: url || getRpcUrl(get().cluster, null),
        }),

      getExplorerUrl: (txOrAddress) => {
        const base = `https://solscan.io/tx/${txOrAddress}`
        return get().cluster === "devnet" ? `${base}?cluster=devnet` : base
      },

      reset: () =>
        set({
          cluster: "mainnet-beta",
          customRpc: null,
          rpcUrl: HELIUS_MAINNET,
          isMainnet: true,
        }),
    }),
    { name: "sip-network" }
  )
)
