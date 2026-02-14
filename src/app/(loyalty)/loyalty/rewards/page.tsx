import type { Metadata } from "next"
import { RewardsPageClient } from "./client"

export const metadata: Metadata = {
  title: "Claim Rewards",
  description: "Claim earned privacy rewards to your stealth address.",
}

export default function LoyaltyRewardsPage() {
  return <RewardsPageClient />
}
