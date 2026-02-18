"use client"

import { useState } from "react"

interface ApiFallbackBannerProps {
  sponsor: string
  isSimulation: boolean
}

export function ApiFallbackBanner({ sponsor, isSimulation }: ApiFallbackBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (!isSimulation || dismissed) return null

  return (
    <div className="mb-4 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-amber-400 text-sm flex-shrink-0">&#x26A1;</span>
        <p className="text-xs text-amber-300/80 truncate">
          Running in demo mode &mdash; {sponsor} API unavailable. Data is simulated.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400/50 hover:text-amber-400 text-xs flex-shrink-0"
      >
        &#x2715;
      </button>
    </div>
  )
}
