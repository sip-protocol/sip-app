import type { Metadata } from "next"
import { MigrationsPageClient } from "./client"

export const metadata: Metadata = {
  title: "Private Green Migration",
  description:
    "Migrate SOL from dead Solana protocols to Sunrise Stake with stealth addresses for privacy and carbon offsets.",
}

export default function MigrationsPage() {
  return <MigrationsPageClient />
}
