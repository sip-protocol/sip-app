import type { Metadata } from "next"
import { SocialPageClient } from "./client"

export const metadata: Metadata = {
  title: "Anonymous Social",
  description:
    "Privacy-first social interactions powered by stealth identities and Tapestry Protocol.",
}

export default function SocialPage() {
  return <SocialPageClient />
}
