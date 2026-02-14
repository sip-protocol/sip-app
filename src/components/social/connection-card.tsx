"use client"

import { cn } from "@/lib/utils"
import { ProfileBadge } from "./profile-badge"
import { SAMPLE_PROFILES } from "@/lib/social/constants"
import type { SocialConnection } from "@/lib/social/types"

interface ConnectionCardProps {
  connection: SocialConnection
  perspective: "following" | "follower"
  className?: string
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function ConnectionCard({
  connection,
  perspective,
  className,
}: ConnectionCardProps) {
  const profileId =
    perspective === "following"
      ? connection.toProfileId
      : connection.fromProfileId
  const username =
    perspective === "following"
      ? connection.toUsername
      : connection.fromUsername

  const profile = SAMPLE_PROFILES.find((p) => p.id === profileId)
  const stealthAddress = profile?.stealthAddress ?? "sip:solana:0x0000"

  return (
    <div
      className={cn(
        "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-4",
        "hover:border-[var(--border-hover)] transition-all",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <ProfileBadge
          username={username}
          stealthAddress={stealthAddress}
          size="md"
        />
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-xs text-[var(--text-tertiary)]">
            {formatDate(connection.createdAt)}
          </span>
          {connection.isEncrypted && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-amber-500/20 border-amber-500/30 text-amber-300">
              {"\u{1F512}"} Encrypted
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
