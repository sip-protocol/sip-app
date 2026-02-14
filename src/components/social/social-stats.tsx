"use client"

import { useFeed } from "@/hooks/use-feed"
import { useSocialHistoryStore } from "@/stores/social-history"

export function SocialStats() {
  const { posts, isLoading } = useFeed()
  const { profiles, actions } = useSocialHistoryStore()

  const identities = profiles.length
  const totalPosts = actions.filter((a) => a.type === "post").length
  const connections = actions.filter((a) => a.type === "follow").length
  const encrypted = posts.filter((p) => p.isEncrypted).length

  const stats = [
    { label: "Identities", value: identities.toString() },
    { label: "Posts", value: totalPosts.toString() },
    { label: "Connections", value: connections.toString() },
    { label: "Encrypted", value: isLoading ? "..." : encrypted.toString() },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-4 text-center"
        >
          <p className="text-2xl font-bold mb-1">{stat.value}</p>
          <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
