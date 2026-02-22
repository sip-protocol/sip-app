"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletStore } from "@/stores/wallet"
import { usePaymentHistoryStore } from "@/stores/payment-history"
import { useSwapHistoryStore } from "@/stores/swap-history"
import { useGovernanceHistoryStore } from "@/stores/governance-history"
import { useViewingKeyDisclosure } from "@/hooks/use-viewing-key-disclosure"
import { ComplianceStats } from "./compliance-stats"
import { AuditTrail } from "./audit-trail"
import { ShareKeyPanel } from "@/components/disclosure/share-key-panel"
import { ExportReportPanel } from "@/components/disclosure/export-report-panel"

type Tab = "audit" | "keys" | "export"

export function ComplianceDashboard() {
  const { publicKey } = useWallet()
  const { address, isConnected } = useWalletStore()
  const [activeTab, setActiveTab] = useState<Tab>("audit")

  const walletAddress = address || publicKey?.toBase58() || null

  // Get counts for stats
  const paymentCount = usePaymentHistoryStore((s) =>
    walletAddress ? s.getAll(walletAddress).length : 0
  )
  const swapCount = useSwapHistoryStore((s) => s.swaps.length)
  const voteCount = useGovernanceHistoryStore((s) => s.votes.length)
  const { keys: viewingKeys } = useViewingKeyDisclosure()

  // Not connected state
  if (!isConnected && !publicKey) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--surface-tertiary)] flex items-center justify-center">
          <span className="text-4xl">🔗</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Connect Wallet</h2>
        <p className="text-[var(--text-secondary)] max-w-md mx-auto">
          Connect your wallet to view your compliance dashboard, audit trail,
          and manage viewing keys.
        </p>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "audit", label: "Audit Trail", icon: "📋" },
    { id: "keys", label: "Viewing Keys", icon: "🔑" },
    { id: "export", label: "Export", icon: "📥" },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <ComplianceStats
        payments={paymentCount}
        swaps={swapCount}
        votes={voteCount}
        viewingKeys={viewingKeys.length}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-default)] pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? "border-sip-purple-500 text-sip-purple-400"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "audit" && <AuditTrail walletAddress={walletAddress} />}
        {activeTab === "keys" && <ShareKeyPanel />}
        {activeTab === "export" && <ExportReportPanel />}
      </div>
    </div>
  )
}
