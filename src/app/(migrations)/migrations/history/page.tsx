import type { Metadata } from "next"
import { MigrationHistoryPageClient } from "./client"

export const metadata: Metadata = {
  title: "Migration History",
  description:
    "Track your private green migrations from dead protocols to Sunrise Stake.",
}

export default function MigrationHistoryPage() {
  return <MigrationHistoryPageClient />
}
