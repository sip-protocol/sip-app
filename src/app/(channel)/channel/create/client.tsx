"use client"

import { CreateDropForm } from "@/components/channel/create-drop-form"

export function CreateDropClient() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Create Drop</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Publish encrypted content for your subscribers. Choose content type,
          set access tier, and distribute via DRiP.
        </p>
      </div>

      <CreateDropForm />
    </div>
  )
}
