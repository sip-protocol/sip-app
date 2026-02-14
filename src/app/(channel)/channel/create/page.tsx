import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Drop",
  description: "Publish encrypted content drops for your channel subscribers.",
}

export default function ChannelCreatePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Create Drop</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Publish encrypted content for your subscribers. Choose content type,
          set access tier, and schedule distribution.
        </p>
      </div>

      {/* Empty State */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
        <p className="text-4xl mb-4">✍️</p>
        <h2 className="text-lg font-semibold mb-2">
          Content creator coming soon
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          The encrypted content creation interface with DRiP integration will be
          built here.
        </p>
      </div>
    </div>
  )
}
