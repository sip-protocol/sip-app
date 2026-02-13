import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Stealth Profile",
  description: "Manage your anonymous on-chain social identity.",
}

export default function SocialProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Stealth Profile</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Manage your anonymous on-chain identity. Create and switch between
          stealth personas.
        </p>
      </div>

      {/* Empty State */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
        <p className="text-4xl mb-4">👤</p>
        <h2 className="text-lg font-semibold mb-2">No stealth profiles yet</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          Create a stealth identity to start interacting socially on-chain
          without revealing your wallet address.
        </p>
      </div>
    </div>
  )
}
