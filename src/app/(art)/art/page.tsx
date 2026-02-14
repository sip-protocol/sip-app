import type { Metadata } from "next"
import { ArtPageClient } from "./client"

export const metadata: Metadata = {
  title: "Privacy Art",
  description:
    "Generate unique privacy-themed art from your transactions. Mint as compressed NFTs.",
}

export default function ArtPage() {
  return <ArtPageClient />
}
