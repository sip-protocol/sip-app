import type { Metadata } from "next"
import { TeleportClient } from "./client"

export const metadata: Metadata = {
  title: "Private Teleport",
  description:
    "Teleport between metaverse worlds privately. Stealth identity proofs ensure your destination and origin remain unlinkable.",
}

export default function TeleportPage() {
  return <TeleportClient />
}
