"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { useMigrationHistoryStore } from "@/stores/migration-history"
import { MigrationHistoryCard } from "./migration-history-card"
import type { MigrationStep } from "@/lib/migrations/types"

type FilterTab = "all" | "pending" | "complete" | "failed"

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "complete", label: "Complete" },
  { id: "failed", label: "Failed" },
]

const PENDING_STEPS: MigrationStep[] = [
  "scanning_wallet",
  "generating_stealth",
  "withdrawing_from_source",
  "depositing_to_sunrise",
]

export function MigrationHistoryList() {
  const { migrations } = useMigrationHistoryStore()
  const [activeTab, setActiveTab] = useState<FilterTab>("all")

  const filtered = useMemo(() => {
    switch (activeTab) {
      case "pending":
        return migrations.filter((m) => PENDING_STEPS.includes(m.status))
      case "complete":
        return migrations.filter((m) => m.status === "complete")
      case "failed":
        return migrations.filter((m) => m.status === "failed")
      default:
        return migrations
    }
  }, [migrations, activeTab])

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
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
          <p className="text-4xl mb-4">{"\uD83C\uDF31"}</p>
          <h2 className="text-lg font-semibold mb-2">
            {activeTab === "all"
              ? "No migrations yet"
              : `No ${activeTab} migrations`}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {activeTab === "all"
              ? "Migrate SOL from dead protocols to Sunrise Stake with privacy. Your migration history will appear here."
              : `You don't have any ${activeTab} migrations.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((migration) => (
            <MigrationHistoryCard key={migration.id} migration={migration} />
          ))}
        </div>
      )}
    </div>
  )
}
