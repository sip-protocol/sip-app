import type { Metadata } from "next"
import { ProfilePageClient } from "./client"

export const metadata: Metadata = {
  title: "Stealth Profile",
  description: "Manage your anonymous on-chain social identity.",
}

export default function SocialProfilePage() {
  return <ProfilePageClient />
}
