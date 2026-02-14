"use client"

import Link from "next/link"
import { BridgeHistoryList } from "@/components/bridge/bridge-history-list"

export function BridgeHistoryPageClient() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Bridge History
          </h1>
          <p className="text-[var(--text-secondary)]">
            Track your cross-chain transfers. Only you can see your transfers
            using your viewing keys.
          </p>
        </div>
        <Link
          href="/bridge"
          className="px-4 py-2 text-sm font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors"
        >
          New Bridge
        </Link>
      </div>

      <BridgeHistoryList />
    </div>
  )
}
