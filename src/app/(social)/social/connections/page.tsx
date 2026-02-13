import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Private Connections",
  description: "Follow and connect with others without revealing your identity.",
}

export default function SocialConnectionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Private Connections
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Your encrypted social graph. Follow and connect without anyone knowing
          who you follow.
        </p>
      </div>

      {/* Empty State */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
        <p className="text-4xl mb-4">🤝</p>
        <h2 className="text-lg font-semibold mb-2">No connections yet</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          Your follow graph is encrypted. Only you can see who you follow using
          your viewing keys.
        </p>
      </div>
    </div>
  )
}
