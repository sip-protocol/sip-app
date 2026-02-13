import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Claim Rewards",
  description: "Claim earned privacy rewards to your stealth address.",
}

export default function LoyaltyRewardsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Claim Rewards</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Claim your earned rewards to a stealth address. Batch multiple rewards
          in a single transaction.
        </p>
      </div>

      {/* Empty State */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
        <p className="text-4xl mb-4">🎁</p>
        <h2 className="text-lg font-semibold mb-2">No rewards to claim</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          Complete privacy campaigns to earn rewards. Rewards are sent to stealth
          addresses — only you know they are yours.
        </p>
      </div>
    </div>
  )
}
