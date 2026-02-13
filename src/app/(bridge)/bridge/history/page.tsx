import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bridge History",
  description: "Track your cross-chain privacy transfers and claim pending bridged tokens.",
}

export default function BridgeHistoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Bridge History</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Track your cross-chain transfers. Claim pending tokens sent to your
          stealth addresses.
        </p>
      </div>

      {/* Empty State */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
        <p className="text-4xl mb-4">🌉</p>
        <h2 className="text-lg font-semibold mb-2">No bridge transfers yet</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          When you bridge tokens with privacy, your transfer history will appear
          here. Only you can see your transfers using your viewing keys.
        </p>
      </div>
    </div>
  )
}
