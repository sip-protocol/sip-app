import type { Metadata } from "next"
import { NetworkSelector } from "@/components/settings/network-selector"

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Configure network, privacy preferences, and application settings.",
}

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-[var(--text-secondary)]">
          Configure your network and application preferences.
        </p>
      </div>

      <div className="space-y-8">
        {/* Network Configuration */}
        <section className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)]">
          <h2 className="text-lg font-semibold mb-4">Network Configuration</h2>
          <NetworkSelector />
        </section>
      </div>
    </div>
  )
}
