import type { Metadata } from "next"
import { PlayClient } from "./client"

export const metadata: Metadata = {
  title: "Claim Reward",
  description: "Claim your game winnings privately via stealth addresses.",
}

export default function GamingPlayPage() {
  return <PlayClient />
}
