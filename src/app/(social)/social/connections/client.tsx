"use client"

import { useSocialHistoryStore } from "@/stores/social-history"
import { ConnectionList } from "@/components/social/connection-list"

export function ConnectionsPageClient() {
  const { profiles } = useSocialHistoryStore()
  const activeProfile = profiles[0] ?? null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Private Connections
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Your encrypted social graph. Follow and connect without anyone knowing
          who you follow.
        </p>
      </div>

      {/* Connection List */}
      <ConnectionList profileId={activeProfile?.id ?? "profile-dolphin"} />
    </div>
  )
}
