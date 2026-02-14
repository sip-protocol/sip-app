"use client"

import Link from "next/link"
import { BridgeForm } from "@/components/bridge/bridge-form"

export function BridgePageClient() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Private Bridge</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Bridge tokens cross-chain to a stealth address. The bridge relayer
          cannot link sender to receiver.
        </p>
      </div>

      {/* Bridge Form */}
      <BridgeForm />

      {/* History Link */}
      <div className="mt-6 text-center">
        <Link
          href="/bridge/history"
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          View Bridge History →
        </Link>
      </div>

      {/* Info Banner */}
      <div className="mt-8 p-4 rounded-xl bg-cyan-900/20 border border-cyan-800">
        <div className="flex gap-3">
          <span className="text-xl">{"\uD83C\uDF09"}</span>
          <div>
            <p className="font-medium text-cyan-100">Powered by Wormhole NTT</p>
            <p className="text-sm text-cyan-300 mt-1">
              Native Token Transfers enable cross-chain bridging directly to
              stealth addresses. Your destination address stays private — even
              the bridge relayer cannot link sender to receiver.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
