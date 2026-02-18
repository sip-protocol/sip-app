"use client"

import Link from "next/link"
import { MigrationWizard } from "@/components/migrations/migration-wizard"
import { DeathRevivalCard } from "@/components/shared/death-revival-card"

export function MigrationsPageClient() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Private Green Migration
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Leave dead protocols with a clean slate. Migrate SOL to Sunrise Stake
          for gSOL and carbon offsets — privately via stealth addresses.
        </p>
      </div>

      {/* Migration Wizard */}
      <MigrationWizard />

      {/* History Link */}
      <div className="mt-6 text-center">
        <Link
          href="/migrations/history"
          className="text-sm text-green-400 hover:text-green-300 transition-colors"
        >
          View Migration History →
        </Link>
      </div>

      {/* Death/Revival Card */}
      <div className="mt-8">
        <DeathRevivalCard
          category="Protocol Migration"
          whyItDied="Moving assets between protocols was fully visible. Watchers could front-run migrations or exploit timing."
          howWeRevive="Private protocol migration with stealth addresses. Consolidate stranded tokens without revealing your portfolio."
          sponsor="Sunrise Stake"
          sponsorRole="Climate-positive staking with carbon offset integration"
          gradient="from-green-500 to-green-700"
        />
      </div>

      {/* Info Banner */}
      <div className="mt-8 p-4 rounded-xl bg-green-900/20 border border-green-800">
        <div className="flex gap-3">
          <span className="text-xl">{"\uD83C\uDF31"}</span>
          <div>
            <p className="font-medium text-green-100">
              Powered by Sunrise Stake
            </p>
            <p className="text-sm text-green-300 mt-1">
              Sunrise Stake converts your SOL staking yield into verified carbon
              offsets. Your migration is private — the stealth address ensures
              your Sunrise deposit cannot be linked to your source wallet.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
