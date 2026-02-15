"use client"

import { ClaimForm } from "@/components/gaming/claim-form"

export function PlayClient() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Claim Reward</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Claim your game winnings privately. Rewards are sent to a one-time
          stealth address — unlinkable to your wallet.
        </p>
      </div>

      <ClaimForm />
    </div>
  )
}
