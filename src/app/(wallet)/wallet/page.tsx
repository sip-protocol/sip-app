import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Wallet",
  description: "Manage your stealth addresses and viewing keys.",
}

export default function WalletPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--surface-tertiary)] flex items-center justify-center">
          <span className="text-4xl">👛</span>
        </div>
        <h1 className="text-3xl font-bold mb-4">Wallet</h1>
        <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8">
          Manage your stealth addresses, viewing keys, and privacy settings.
        </p>
        <span className="inline-block px-4 py-2 rounded-full bg-[var(--surface-tertiary)] text-[var(--text-secondary)] text-sm">
          Coming Soon
        </span>
      </div>
    </div>
  )
}
