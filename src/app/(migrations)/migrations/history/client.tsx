"use client"

import Link from "next/link"
import { MigrationHistoryList } from "@/components/migrations/migration-history-list"

export function MigrationHistoryPageClient() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Migration History
          </h1>
          <p className="text-[var(--text-secondary)]">
            Track your green migrations. Only you can see your transfers using
            your viewing keys.
          </p>
        </div>
        <Link
          href="/migrations"
          className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors"
        >
          New Migration
        </Link>
      </div>

      <MigrationHistoryList />
    </div>
  )
}
