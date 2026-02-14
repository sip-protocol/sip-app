import type { Metadata } from "next"
import { CreateDropClient } from "./client"

export const metadata: Metadata = {
  title: "Create Drop",
  description: "Publish encrypted content drops for your channel subscribers.",
}

export default function ChannelCreatePage() {
  return <CreateDropClient />
}
