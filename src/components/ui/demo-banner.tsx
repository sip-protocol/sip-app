"use client"

import { useDemoModeStore } from "@/stores/demo-mode"

export function DemoBanner() {
  const { disableDemo } = useDemoModeStore()

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-amber-400 font-medium">Demo Mode</span>
        <span className="text-[var(--text-tertiary)]">
          Connect wallet for real transactions
        </span>
      </div>
      <button
        type="button"
        onClick={disableDemo}
        className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
      >
        Exit
      </button>
    </div>
  )
}
