"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { useSocialHistoryStore } from "@/stores/social-history"
import { SocialService } from "@/lib/social/social-service"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import { IdentitySelector } from "./identity-selector"
import { SocialPrivacyToggle } from "./social-privacy-toggle"
import { SocialStatus } from "./social-status"
import type { SocialStep } from "@/lib/social/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

interface CreatePostFormProps {
  onPublished?: () => void
  onCreateIdentity?: () => void
}

const MAX_CONTENT_LENGTH = 500

export function CreatePostForm({ onPublished, onCreateIdentity }: CreatePostFormProps) {
  const { connected } = useWallet()

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [content, setContent] = useState("")
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")
  const [status, setStatus] = useState<SocialStep | "idle" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const { profiles, addAction } = useSocialHistoryStore()
  const { trackSocial } = useTrackEvent()

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = {
    shielded: PrivacyLevel.SHIELDED,
    compliant: PrivacyLevel.COMPLIANT,
    transparent: PrivacyLevel.TRANSPARENT,
  }

  const isFormReady =
    connected &&
    selectedProfileId !== null &&
    content.trim().length > 0 &&
    content.length <= MAX_CONTENT_LENGTH &&
    status === "idle"

  const isPublishing =
    status === "encrypting_content" || status === "publishing"

  const isPublished = status === "published"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady || !selectedProfileId) return

      try {
        setError(null)

        const service = new SocialService({
          mode: "simulation",
          onStepChange: (step) => setStatus(step),
        })

        const validationError = service.validate("post", {
          profileId: selectedProfileId,
          content: content.trim(),
          privacyLevel: privacyMap[privacyLevel],
        })
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return
        }

        setStatus("encrypting_content")

        const result = await service.createPost({
          profileId: selectedProfileId,
          content: content.trim(),
          privacyLevel: privacyMap[privacyLevel],
        })

        addAction(result)

        trackSocial({
          action: "post",
          targetProfileId: selectedProfileId,
          privacyLevel: privacyMap[privacyLevel],
        })
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Post failed"
        setError(message)
        setStatus("error")
      }
    },
    [isFormReady, selectedProfileId, content, privacyLevel, addAction, trackSocial, privacyMap],
  )

  const handleReset = useCallback(() => {
    setStatus("idle")
    setError(null)
    setContent("")
    onPublished?.()
  }, [onPublished])

  // Published state
  if (isPublished) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <SocialStatus currentStep="published" mode="post" />

        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-secondary)] line-clamp-3">
            {privacyLevel === "shielded"
              ? "\u{1F512} Content encrypted — only viewing key holders can read"
              : content}
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Post Again
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Post Anonymously</h2>
        <p className="text-sm text-[var(--text-tertiary)]">
          Share your thoughts without revealing your wallet
        </p>
      </div>

      {/* Identity Selector */}
      {profiles.length > 0 ? (
        <div className="mb-6">
          <IdentitySelector
            profiles={profiles}
            selected={selectedProfileId}
            onSelect={setSelectedProfileId}
            onCreate={onCreateIdentity}
            disabled={isPublishing}
          />
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-xl border border-dashed border-[var(--border-default)] text-center">
          <p className="text-sm text-[var(--text-tertiary)] mb-2">
            No stealth identities yet
          </p>
          {onCreateIdentity && (
            <button
              type="button"
              onClick={onCreateIdentity}
              className="text-sm text-pink-400 hover:text-pink-300 font-medium transition-colors"
            >
              Create your first identity
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Privacy is a right..."
          rows={4}
          disabled={isPublishing}
          className={cn(
            "w-full px-4 py-3 rounded-xl border bg-[var(--bg-secondary)] text-sm resize-none",
            "border-[var(--border-default)] focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30",
            "placeholder:text-[var(--text-tertiary)] outline-none transition-colors",
            isPublishing && "opacity-50 cursor-not-allowed",
          )}
        />
        <div className="flex justify-end mt-1">
          <span
            className={cn(
              "text-xs",
              content.length > MAX_CONTENT_LENGTH
                ? "text-red-400"
                : "text-[var(--text-tertiary)]",
            )}
          >
            {content.length}/{MAX_CONTENT_LENGTH}
          </span>
        </div>
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <SocialPrivacyToggle
          value={privacyLevel}
          onChange={setPrivacyLevel}
          disabled={isPublishing}
        />
      </div>

      {/* Status (during publishing) */}
      {isPublishing && (
        <div className="mb-6">
          <SocialStatus
            currentStep={status as "encrypting_content" | "publishing"}
            mode="post"
          />
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="mb-6">
          <SocialStatus currentStep="failed" mode="post" error={error} />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormReady}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-colors",
          isFormReady
            ? "bg-gradient-to-r from-pink-500 to-pink-700 text-white hover:from-pink-400 hover:to-pink-600"
            : "bg-pink-600/30 text-white/50 cursor-not-allowed",
        )}
      >
        {!connected
          ? "Connect Wallet"
          : isPublishing
            ? "Publishing..."
            : !selectedProfileId
              ? "Select Identity"
              : content.trim().length === 0
                ? "Write Something"
                : "Post Anonymously"}
      </button>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Powered by</span>
          <span className="text-[var(--text-primary)]">
            SIP + Tapestry Protocol
          </span>
        </div>
      </div>
    </form>
  )
}
