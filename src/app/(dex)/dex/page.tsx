"use client"

// Disable static generation - this page uses context-dependent hooks
export const dynamic = "force-dynamic"

import { useState } from "react"
import { PrivacyLevel } from "@sip-protocol/types"
import { SwapCard, PrivacyToggle } from "@/components/dex"

export default function DexPage() {
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>(
    PrivacyLevel.SHIELDED
  )

  return (
    <div className="mx-auto max-w-2xl px-3 py-4 pb-safe sm:px-4 sm:py-12">
      {/* Privacy Level Toggle - sticky on mobile for better UX */}
      <div className="sticky top-0 z-10 -mx-3 mb-6 bg-[var(--background)]/95 px-3 py-3 backdrop-blur-sm sm:static sm:mx-0 sm:mb-8 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <div className="flex justify-center">
          <PrivacyToggle value={privacyLevel} onChange={setPrivacyLevel} />
        </div>
      </div>

      {/* Swap Card */}
      <SwapCard privacyLevel={privacyLevel} />
    </div>
  )
}
