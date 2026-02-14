"use client"

import { cn } from "@/lib/utils"
import { useFeed, type FeedFilter } from "@/hooks/use-feed"
import { PostCard } from "./post-card"

interface FeedListProps {
  onViewPost?: (postId: string) => void
}

const FILTER_TABS: { value: FeedFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "encrypted", label: "Encrypted" },
  { value: "public", label: "Public" },
]

export function FeedList({ onViewPost }: FeedListProps) {
  const { posts, isLoading, filter, setFilter, profiles } = useFeed()

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-[var(--text-secondary)]">Loading feed...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
              filter === tab.value
                ? "bg-pink-600 text-white"
                : "bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile filter chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {profiles.slice(0, 5).map((profile) => (
          <span
            key={profile.id}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--surface-secondary)] text-[var(--text-tertiary)] whitespace-nowrap"
          >
            {profile.username}
          </span>
        ))}
      </div>

      {/* Post grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl">
          <p className="text-4xl mb-4">{"\u{1F4AC}"}</p>
          <p className="text-sm text-[var(--text-secondary)]">
            No posts match your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onViewPost={onViewPost} />
          ))}
        </div>
      )}
    </div>
  )
}
