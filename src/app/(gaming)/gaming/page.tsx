import type { Metadata } from "next"
import { GamingPageClient } from "./client"

export const metadata: Metadata = {
  title: "Privacy Arena",
  description:
    "Commit-reveal games with cryptographic commitments. Hidden moves, sealed bids, private rewards — game theory powered by real cryptography.",
}

export default function GamingPage() {
  return <GamingPageClient />
}
