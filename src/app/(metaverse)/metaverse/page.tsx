import type { Metadata } from "next"
import { MetaversePageClient } from "./client"

export const metadata: Metadata = {
  title: "Privacy Metaverse",
  description:
    "Stealth avatars, private teleportation, anonymous world exploration. Metaverse privacy powered by real cryptography via Portals.",
}

export default function MetaversePage() {
  return <MetaversePageClient />
}
