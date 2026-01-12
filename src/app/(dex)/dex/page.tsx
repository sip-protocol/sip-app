"use client"

import { useState } from "react"
import { PrivacyLevel } from "@sip-protocol/types"
import { SwapCard, PrivacyToggle } from "@/components/dex"

export default function DexPage() {
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>(
    PrivacyLevel.SHIELDED
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Privacy Level Toggle */}
      <div className="mb-8 flex justify-center">
        <PrivacyToggle value={privacyLevel} onChange={setPrivacyLevel} />
      </div>

      {/* Swap Card */}
      <SwapCard privacyLevel={privacyLevel} />
    </div>
  )
}
