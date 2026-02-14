import type { Metadata } from "next"
import { BridgeHistoryPageClient } from "./client"

export const metadata: Metadata = {
  title: "Bridge History",
  description:
    "Track your cross-chain privacy transfers and claim pending bridged tokens.",
}

export default function BridgeHistoryPage() {
  return <BridgeHistoryPageClient />
}
