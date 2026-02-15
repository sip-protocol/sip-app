import type { Metadata } from "next"
import { VerifyClient } from "./client"

export const metadata: Metadata = {
  title: "Verify Ticket",
  description:
    "Verify event attendance privately via viewing key proofs. Prove you attended without revealing your identity.",
}

export default function VerifyTicketPage() {
  return <VerifyClient />
}
