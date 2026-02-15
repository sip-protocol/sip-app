"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { usePublishDrop } from "@/hooks/use-publish-drop"
import { ChannelPrivacyToggle } from "./channel-privacy-toggle"
import { ChannelStatus } from "./channel-status"
import { StealthDropDisplay } from "./stealth-drop-display"
import type { ContentType, AccessTier } from "@/lib/channel/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "article", label: "Article" },
  { value: "tutorial", label: "Tutorial" },
  { value: "deep_dive", label: "Deep Dive" },
  { value: "alpha", label: "Alpha" },
]

const ACCESS_TIERS: { value: AccessTier; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "subscriber", label: "Subscriber" },
  { value: "premium", label: "Premium" },
]

interface CreateDropFormProps {
  onPublished?: () => void
}

export function CreateDropForm({ onPublished }: CreateDropFormProps) {
  const { connected } = useWallet()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [contentType, setContentType] = useState<ContentType>("article")
  const [accessTier, setAccessTier] = useState<AccessTier>("free")
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const {
    status,
    activeRecord,
    error,
    publishDrop,
    reset: resetPublish,
  } = usePublishDrop()

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = {
    shielded: PrivacyLevel.SHIELDED,
    compliant: PrivacyLevel.COMPLIANT,
    transparent: PrivacyLevel.TRANSPARENT,
  }

  const isFormReady =
    connected && status === "idle" && title.trim() && content.trim()
  const isPublishing =
    status === "encrypting_content" ||
    status === "generating_stealth" ||
    status === "publishing"
  const isPublished = status === "published"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady) return

      await publishDrop({
        title: title.trim(),
        content: content.trim(),
        contentType,
        accessTier,
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [
      isFormReady,
      title,
      content,
      contentType,
      accessTier,
      privacyLevel,
      publishDrop,
      privacyMap,
    ]
  )

  const handleReset = useCallback(() => {
    resetPublish()
    setTitle("")
    setContent("")
    setContentType("article")
    setAccessTier("free")
    onPublished?.()
  }, [resetPublish, onPublished])

  // Published state
  if (isPublished && activeRecord) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <ChannelStatus currentStep="published" mode="publish" />
        <StealthDropDisplay
          stealthAddress={activeRecord.stealthAddress ?? ""}
          metaAddress={activeRecord.stealthMetaAddress ?? ""}
          title={activeRecord.title ?? ""}
          contentType={activeRecord.contentType ?? "article"}
        />

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Create Another Drop
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
        <h2 className="text-lg font-semibold mb-1">Create Drop</h2>
        <p className="text-sm text-[var(--text-tertiary)]">
          Publish encrypted content for your channel subscribers
        </p>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter drop title..."
          disabled={isPublishing}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Content */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your privacy education content..."
          rows={5}
          disabled={isPublishing}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors resize-none"
        />
      </div>

      {/* Type & Tier */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Content Type
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            disabled={isPublishing}
            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-purple-500 transition-colors"
          >
            {CONTENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Access Tier
          </label>
          <select
            value={accessTier}
            onChange={(e) => setAccessTier(e.target.value as AccessTier)}
            disabled={isPublishing}
            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-purple-500 transition-colors"
          >
            {ACCESS_TIERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <ChannelPrivacyToggle
          value={privacyLevel}
          onChange={setPrivacyLevel}
          disabled={isPublishing}
        />
      </div>

      {/* Status (during publish) */}
      {isPublishing && (
        <div className="mb-6">
          <ChannelStatus
            currentStep={
              status as
                | "encrypting_content"
                | "generating_stealth"
                | "publishing"
            }
            mode="publish"
          />
        </div>
      )}

      {/* Error state */}
      {status === "failed" && (
        <div className="mb-6">
          <ChannelStatus currentStep="failed" mode="publish" error={error} />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormReady}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-colors",
          isFormReady
            ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-400 hover:to-purple-600"
            : "bg-purple-600/30 text-white/50 cursor-not-allowed"
        )}
      >
        {!connected
          ? "Connect Wallet"
          : isPublishing
            ? "Publishing..."
            : "Publish Drop"}
      </button>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Encryption</span>
          <span className="text-purple-400 font-medium">Viewing Key-Gated</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-[var(--text-secondary)]">Powered by</span>
          <span className="text-[var(--text-primary)]">DRiP Protocol</span>
        </div>
      </div>
    </form>
  )
}
