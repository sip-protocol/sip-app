import type { Metadata } from "next"
import { BridgePageClient } from "./client"

export const metadata: Metadata = {
  title: "Private Bridge",
  description:
    "Bridge tokens across chains with cryptographic privacy via Wormhole NTT and stealth addresses.",
}

export default function BridgePage() {
  return <BridgePageClient />
}
