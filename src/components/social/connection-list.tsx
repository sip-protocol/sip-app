"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useConnections } from "@/hooks/use-connections"
import { ConnectionCard } from "./connection-card"
import { getFollowers, getFollowing } from "@/lib/social/constants"

type ConnectionTab = "following" | "followers"

interface ConnectionListProps {
  profileId: string | null
  onFollow?: () => void
}

export function ConnectionList({ profileId, onFollow }: ConnectionListProps) {
  const { isLoading } = useConnections(profileId)
  const [tab, setTab] = useState<ConnectionTab>("following")

  const following = profileId ? getFollowing(profileId) : []
  const followers = profileId ? getFollowers(profileId) : []

  const tabs: { value: ConnectionTab; label: string; count: number }[] = [
    { value: "following", label: "Following", count: following.length },
    { value: "followers", label: "Followers", count: followers.length },
  ]

  const displayedConnections = tab === "following" ? following : followers

  if (!profileId) {
    return (
      <div className="text-center py-12 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl">
        <p className="text-4xl mb-4">{"\u{1F91D}"}</p>
        <h3 className="text-lg font-semibold mb-2">No identity selected</h3>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          Select a stealth identity to view your encrypted follow graph.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-[var(--text-secondary)]">
          Loading connections...
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              tab === t.value
                ? "bg-pink-600 text-white"
                : "bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            )}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({t.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Connection grid */}
      {displayedConnections.length === 0 ? (
        <div className="text-center py-12 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl">
          <p className="text-4xl mb-4">{"\u{1F91D}"}</p>
          <h3 className="text-lg font-semibold mb-2">
            {tab === "following" ? "Not following anyone" : "No followers yet"}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-4">
            {tab === "following"
              ? "Follow profiles to build your encrypted social graph."
              : "Others will appear here when they follow this identity."}
          </p>
          {tab === "following" && onFollow && (
            <button
              type="button"
              onClick={onFollow}
              className="px-6 py-2 text-sm font-medium rounded-lg bg-pink-600 text-white hover:bg-pink-500 transition-colors"
            >
              Follow Someone
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayedConnections.map((conn) => (
            <ConnectionCard
              key={conn.id}
              connection={conn}
              perspective={tab === "following" ? "following" : "follower"}
            />
          ))}
        </div>
      )}
    </div>
  )
}
