import type { Metadata } from "next"
import { DeSciPageClient } from "./client"

export const metadata: Metadata = {
  title: "Privacy DeSci",
  description:
    "Anonymous research funding, private peer review, stealth contributions. Science privacy powered by real cryptography via BIO Protocol.",
}

export default function DeSciPage() {
  return <DeSciPageClient />
}
