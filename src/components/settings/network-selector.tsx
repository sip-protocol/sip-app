"use client"

import { useNetworkStore } from "@/stores/network"
import { useState } from "react"

export function NetworkSelector() {
  const { cluster, setCluster, isMainnet } = useNetworkStore()
  const [showWarning, setShowWarning] = useState(false)

  const handleSwitch = (target: "devnet" | "mainnet-beta") => {
    if (target === "mainnet-beta" && !isMainnet) {
      setShowWarning(true)
      return
    }
    setCluster(target)
    setShowWarning(false)
  }

  const confirmMainnet = () => {
    setCluster("mainnet-beta")
    setShowWarning(false)
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-zinc-400">Network</label>
      <div className="flex gap-2">
        <button
          onClick={() => handleSwitch("devnet")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            cluster === "devnet"
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Devnet
        </button>
        <button
          onClick={() => handleSwitch("mainnet-beta")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            cluster === "mainnet-beta"
              ? "bg-green-500/20 text-green-400 border border-green-500/40"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Mainnet
        </button>
      </div>

      <div
        data-testid="network-badge"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          isMainnet
            ? "bg-green-500/10 text-green-400"
            : "bg-purple-500/10 text-purple-400"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${isMainnet ? "bg-green-400" : "bg-purple-400"}`}
        />
        {isMainnet ? "Mainnet-Beta" : "Devnet"}
      </div>

      {showWarning && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <p className="text-sm text-amber-400 font-medium">
            Switching to Mainnet uses real SOL. Proceed with caution.
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={confirmMainnet}
              className="px-3 py-1.5 text-xs rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowWarning(false)}
              className="px-3 py-1.5 text-xs rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
