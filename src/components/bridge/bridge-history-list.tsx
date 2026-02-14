"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { useBridgeHistoryStore } from "@/stores/bridge-history"
import { BridgeHistoryCard } from "./bridge-history-card"
import type { BridgeStep } from "@/lib/bridge/types"

type FilterTab = "all" | "pending" | "complete" | "failed"

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "complete", label: "Complete" },
  { id: "failed", label: "Failed" },
]

const PENDING_STEPS: BridgeStep[] = [
  "generating_stealth",
  "initiating_transfer",
  "awaiting_attestation",
  "relaying",
]

export function BridgeHistoryList() {
  const { transfers } = useBridgeHistoryStore()
  const [activeTab, setActiveTab] = useState<FilterTab>("all")

  const filtered = useMemo(() => {
    switch (activeTab) {
      case "pending":
        return transfers.filter((t) =>
          PENDING_STEPS.includes(t.status),
        )
      case "complete":
        return transfers.filter((t) => t.status === "complete")
      case "failed":
        return transfers.filter((t) => t.status === "failed")
      default:
        return transfers
    }
  }, [transfers, activeTab])

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 p-1 mb-6 bg-[var(--surface-secondary)] rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all",
              activeTab === tab.id
                ? "bg-[var(--surface-primary)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
          <p className="text-4xl mb-4">{"\uD83C\uDF09"}</p>
          <h2 className="text-lg font-semibold mb-2">
            {activeTab === "all"
              ? "No bridge transfers yet"
              : `No ${activeTab} transfers`}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {activeTab === "all"
              ? "Bridge tokens cross-chain with privacy. Your transfer history will appear here."
              : `You don't have any ${activeTab} bridge transfers.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((transfer) => (
            <BridgeHistoryCard key={transfer.id} transfer={transfer} />
          ))}
        </div>
      )}
    </div>
  )
}
