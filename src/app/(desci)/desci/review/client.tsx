"use client"

import { ReviewForm } from "@/components/desci/review-form"

export function ReviewClient() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Anonymous Peer Review
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Submit anonymous peer reviews via stealth identity. Reviewers remain
          unlinkable to prevent retaliation or bias.
        </p>
      </div>

      <ReviewForm />
    </div>
  )
}
