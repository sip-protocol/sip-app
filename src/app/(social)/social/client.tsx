"use client"

import { useState, useCallback } from "react"
import { SocialStats } from "@/components/social/social-stats"
import { FeedList } from "@/components/social/feed-list"
import { CreatePostForm } from "@/components/social/create-post-form"
import { CreateProfileForm } from "@/components/social/create-profile-form"

type View = "dashboard" | "create-profile" | "create-post"

export function SocialPageClient() {
  const [view, setView] = useState<View>("dashboard")

  const handleCreateProfile = useCallback(() => {
    setView("create-profile")
  }, [])

  const handleCreatePost = useCallback(() => {
    setView("create-post")
  }, [])

  const handleBack = useCallback(() => {
    setView("dashboard")
  }, [])

  // Create profile view
  if (view === "create-profile") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          &larr; Back to feed
        </button>
        <CreateProfileForm onCreated={handleBack} />
      </div>
    )
  }

  // Create post view
  if (view === "create-post") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          &larr; Back to feed
        </button>
        <CreatePostForm
          onPublished={handleBack}
          onCreateIdentity={handleCreateProfile}
        />
      </div>
    )
  }

  // Dashboard view
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Anonymous Social
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          The first privacy layer for on-chain social. Post, follow, and connect
          without revealing your wallet address.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10">
        <SocialStats />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <button
          type="button"
          onClick={handleCreatePost}
          className="px-6 py-3 text-sm font-medium rounded-xl bg-gradient-to-r from-pink-500 to-pink-700 text-white hover:from-pink-400 hover:to-pink-600 transition-colors"
        >
          Post Anonymously
        </button>
        <button
          type="button"
          onClick={handleCreateProfile}
          className="px-6 py-3 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          New Identity
        </button>
      </div>

      {/* Feed */}
      <FeedList />

      {/* Info Banner */}
      <div className="mt-10 p-4 rounded-xl bg-pink-900/20 border border-pink-800">
        <div className="flex gap-3">
          <span className="text-xl">{"\u{1F3AD}"}</span>
          <div>
            <p className="font-medium text-pink-100">
              Powered by Tapestry Protocol
            </p>
            <p className="text-sm text-pink-300 mt-1">
              Stealth identities let you participate in on-chain social without
              linking your activity to your wallet. Create multiple personas,
              each with its own stealth address.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
