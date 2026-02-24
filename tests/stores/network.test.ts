import { describe, it, expect, beforeEach } from "vitest"
import { useNetworkStore } from "@/stores/network"

describe("NetworkStore", () => {
  beforeEach(() => {
    useNetworkStore.getState().reset()
  })

  it("defaults to mainnet-beta", () => {
    const { cluster } = useNetworkStore.getState()
    expect(cluster).toBe("mainnet-beta")
  })

  it("switches to mainnet-beta", () => {
    useNetworkStore.getState().setCluster("mainnet-beta")
    const { cluster, rpcUrl } = useNetworkStore.getState()
    expect(cluster).toBe("mainnet-beta")
    expect(rpcUrl).toContain("mainnet")
  })

  it("uses custom RPC when set", () => {
    useNetworkStore.getState().setCustomRpc("https://my-rpc.com")
    const { rpcUrl } = useNetworkStore.getState()
    expect(rpcUrl).toBe("https://my-rpc.com")
  })

  it("returns correct explorer URL for devnet", () => {
    useNetworkStore.getState().setCluster("devnet")
    const { getExplorerUrl } = useNetworkStore.getState()
    expect(getExplorerUrl("abc123")).toContain("?cluster=devnet")
  })

  it("persists cluster selection", () => {
    useNetworkStore.getState().setCluster("mainnet-beta")
    const { cluster } = useNetworkStore.getState()
    expect(cluster).toBe("mainnet-beta")
  })

  it("returns isMainnet flag", () => {
    useNetworkStore.getState().setCluster("devnet")
    expect(useNetworkStore.getState().isMainnet).toBe(false)
    useNetworkStore.getState().setCluster("mainnet-beta")
    expect(useNetworkStore.getState().isMainnet).toBe(true)
  })
})
