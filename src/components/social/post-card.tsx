"use client"

import { cn } from "@/lib/utils"
import { ProfileBadge } from "./profile-badge"
import type { SocialPost } from "@/lib/social/types"
import { SAMPLE_PROFILES } from "@/lib/social/constants"

interface PostCardProps {
  post: SocialPost
  onViewPost?: (postId: string) => void
  onLike?: (postId: string) => void
  className?: string
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

export function PostCard({
  post,
  onViewPost,
  onLike,
  className,
}: PostCardProps) {
  const profile = SAMPLE_PROFILES.find((p) => p.id === post.authorProfileId)
  const stealthAddress = profile?.stealthAddress ?? "sip:solana:0x0000"

  return (
    <div
      className={cn(
        "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-5",
        "hover:border-[var(--border-hover)] hover:shadow-md transition-all",
        onViewPost && "cursor-pointer",
        className,
      )}
      onClick={() => onViewPost?.(post.id)}
    >
      {/* Header: profile badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <ProfileBadge
          username={post.authorUsername}
          stealthAddress={stealthAddress}
          size="sm"
        />
        <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">
          {timeAgo(post.timestamp)}
        </span>
      </div>

      {/* Content */}
      {post.isEncrypted ? (
        <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-amber-500/5 border border-amber-500/20 mb-4">
          <span className="text-amber-400 text-sm">&#x1F512;</span>
          <p className="text-xs text-amber-300/80">
            Encrypted — viewing key required
          </p>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-3">
          {post.content}
        </p>
      )}

      {/* Footer: engagement */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onLike?.(post.id)
          }}
          className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-pink-400 transition-colors"
        >
          <span>&#x2764;</span>
          <span>{post.likeCount}</span>
        </button>
        <span className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
          <span>&#x1F4AC;</span>
          <span>{post.commentCount}</span>
        </span>
        {post.isEncrypted && (
          <span className="ml-auto text-[10px] text-amber-400/60 font-medium uppercase tracking-wider">
            Shielded
          </span>
        )}
      </div>
    </div>
  )
}
