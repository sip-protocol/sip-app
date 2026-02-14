import type { Metadata } from "next"
import { ConnectionsPageClient } from "./client"

export const metadata: Metadata = {
  title: "Private Connections",
  description: "Follow and connect with others without revealing your identity.",
}

export default function SocialConnectionsPage() {
  return <ConnectionsPageClient />
}
