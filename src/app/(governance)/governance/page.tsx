import type { Metadata } from "next"
import { GovernancePageClient } from "./client"

export const metadata: Metadata = {
  title: "Private Governance",
  description:
    "Vote on DAO proposals with cryptographic privacy using Pedersen commit-reveal.",
}

export default function GovernancePage() {
  return <GovernancePageClient />
}
