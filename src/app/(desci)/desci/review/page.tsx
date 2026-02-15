import type { Metadata } from "next"
import { ReviewClient } from "./client"

export const metadata: Metadata = {
  title: "Anonymous Peer Review",
  description:
    "Submit anonymous peer reviews via stealth identity. Reviewers remain unlinkable to prevent retaliation or bias.",
}

export default function ReviewPage() {
  return <ReviewClient />
}
