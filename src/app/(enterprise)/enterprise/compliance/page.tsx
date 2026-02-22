import type { Metadata } from "next"
import { ComplianceDashboard } from "@/components/enterprise/compliance-dashboard"

export const metadata: Metadata = {
  title: "Compliance Dashboard",
  description: "Audit trail, viewing key management, and compliance reporting.",
}

export default function CompliancePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Compliance Dashboard</h1>
        <p className="text-[var(--text-secondary)]">
          Audit trail, viewing key management, and compliance reporting
          for your private transactions.
        </p>
      </div>
      <ComplianceDashboard />
    </div>
  )
}
