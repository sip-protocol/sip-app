import type { Metadata } from "next"
import { TicketingPageClient } from "./client"

export const metadata: Metadata = {
  title: "Privacy Ticketing",
  description:
    "Anti-scalping stealth tickets with private event attendance. Stealth addresses for tickets, Pedersen commitments for ticket IDs, viewing keys for organizer verification.",
}

export default function TicketingPage() {
  return <TicketingPageClient />
}
