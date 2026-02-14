import type { Metadata } from "next"
import { ChannelPageClient } from "./client"

export const metadata: Metadata = {
  title: "Privacy Channel",
  description:
    "Encrypted content distribution. Subscribe with viewing keys, receive privacy education drops via DRiP.",
}

export default function ChannelPage() {
  return <ChannelPageClient />
}
