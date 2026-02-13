import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Privacy Art",
  description: "Generate deterministic art from transaction parameters.",
}

export default function ArtCreatePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Create Art</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Generate unique privacy art from transaction parameters. Choose from
          three styles and preview in real-time.
        </p>
      </div>

      {/* Art Styles Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { name: "Cipher Bloom", description: "Fractal patterns", emoji: "🌸" },
          { name: "Stealth Grid", description: "Geometric precision", emoji: "📐" },
          { name: "Commitment Flow", description: "Particle fields", emoji: "🌊" },
        ].map((style) => (
          <div
            key={style.name}
            className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-6 text-center opacity-60"
          >
            <p className="text-4xl mb-3">{style.emoji}</p>
            <h3 className="font-semibold mb-1">{style.name}</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {style.description}
            </p>
          </div>
        ))}
      </div>

      {/* Placeholder */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
        <p className="text-4xl mb-4">🎨</p>
        <h2 className="text-lg font-semibold mb-2">Art generator coming soon</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          The real-time art preview and parameter controls will be built here.
        </p>
      </div>
    </div>
  )
}
