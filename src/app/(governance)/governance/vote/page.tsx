import type { Metadata } from "next"
import { VotePageClient } from "./client"

export const metadata: Metadata = {
  title: "Private Vote",
  description: "Cast hidden votes using Pedersen commit-reveal on Realms DAOs.",
}

export default function GovernanceVotePage() {
  return <VotePageClient />
}
