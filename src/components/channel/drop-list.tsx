"use client"

import { useState, useEffect } from "react"
import { Broadcast } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { DropCard } from "./drop-card"
import { SAMPLE_SUBSCRIPTIONS } from "@/lib/channel/constants"
import { DripReader } from "@/lib/channel/drip-reader"
import type { Drop, AccessTier } from "@/lib/channel/types"

type DropFilter = "all" | AccessTier

const FILTER_TABS: { value: DropFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "subscriber", label: "Subscriber" },
  { value: "premium", label: "Premium" },
]

interface DropListProps {
  onSubscribe?: (drop: Drop) => void
}

export function DropList({ onSubscribe }: DropListProps) {
  const [filter, setFilter] = useState<DropFilter>("all")
  const [allDrops, setAllDrops] = useState<Drop[]>([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadDrops() {
      setLoading(true)
      const reader = new DripReader("drip")
      const drops = await reader.getDrops()
      if (!cancelled) {
        setAllDrops(drops)
        // If any drop id looks like a Solana address (44 chars), it's live data
        setIsLive(drops.some((d) => d.id.length >= 32))
        setLoading(false)
      }
    }
    loadDrops()
    return () => {
      cancelled = true
    }
  }, [])

  const drops =
    filter === "all"
      ? allDrops
      : allDrops.filter((d) => d.accessTier === filter)

  return (
    <div>
      {/* Mode indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            isLive ? "bg-emerald-400 animate-pulse" : "bg-gray-500"
          )}
        />
        <span className="text-xs text-[var(--text-tertiary)]">
          {isLive ? "Live from Helius DAS" : "Simulation"}
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              "flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              filter === tab.value
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-6 animate-pulse"
            >
              <div className="h-4 bg-[var(--surface-secondary)] rounded w-3/4 mb-3" />
              <div className="h-3 bg-[var(--surface-secondary)] rounded w-full mb-2" />
              <div className="h-3 bg-[var(--surface-secondary)] rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : drops.length === 0 ? (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
          <div className="text-purple-400 mb-4 flex justify-center">
            <Broadcast size={48} weight="duotone" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No drops found</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {filter === "all"
              ? "No drops available yet. Check back soon for new privacy content."
              : `No ${filter} drops. Try a different filter.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {drops.map((drop) => {
            const isSubscribed = SAMPLE_SUBSCRIPTIONS.some(
              (s) => s.dropId === drop.id
            )
            return (
              <DropCard
                key={drop.id}
                drop={drop}
                isSubscribed={isSubscribed}
                onSubscribe={onSubscribe}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
