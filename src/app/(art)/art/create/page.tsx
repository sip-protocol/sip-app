import type { Metadata } from "next"
import { CreateArtClient } from "./client"

export const metadata: Metadata = {
  title: "Create Privacy Art",
  description: "Generate deterministic art from transaction parameters.",
}

export default function ArtCreatePage() {
  return <CreateArtClient />
}
