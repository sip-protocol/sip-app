"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ShareKeyPanel,
  ViewWithKeyPanel,
  ExportReportPanel,
} from "@/components/disclosure"

type TabId = "share" | "view" | "export"

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: "share", label: "Share Key", icon: "🔑" },
  { id: "view", label: "View with Key", icon: "🔓" },
  { id: "export", label: "Export Report", icon: "📊" },
]

export default function DisclosePage() {
  const [activeTab, setActiveTab] = useState<TabId>("share")

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/payments"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4"
        >
          <span>←</span> Back to Payments
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Viewing Key Disclosure
        </h1>
        <p className="text-[var(--text-secondary)]">
          Share viewing keys for compliance audits or decrypt transactions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-[var(--surface-secondary)] rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[var(--surface-primary)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6">
        {activeTab === "share" && <ShareKeyPanel />}
        {activeTab === "view" && <ViewWithKeyPanel />}
        {activeTab === "export" && <ExportReportPanel />}
      </div>

      {/* Footer Info */}
      <div className="mt-6 p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-default)]">
        <div className="flex gap-3">
          <span className="text-xl">🔐</span>
          <div>
            <p className="font-medium">What are viewing keys?</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Viewing keys enable selective disclosure of private transactions
              without giving spending access. Share them with auditors,
              accountants, or compliance officers who need to verify your
              transaction history.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
