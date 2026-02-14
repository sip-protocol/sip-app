import type { Metadata } from "next"
import { LoyaltyPageClient } from "./client"

export const metadata: Metadata = {
  title: "Privacy Loyalty",
  description:
    "Earn rewards for privacy actions. Complete campaigns without surveillance.",
}

export default function LoyaltyPage() {
  return <LoyaltyPageClient />
}
