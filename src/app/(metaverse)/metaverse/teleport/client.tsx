"use client"

import { TeleportForm } from "@/components/metaverse/teleport-form"

export function TeleportClient() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Private Teleport
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Teleport between worlds privately. Stealth identity proofs preserve
          your anonymity across every destination.
        </p>
      </div>

      <TeleportForm />
    </div>
  )
}
