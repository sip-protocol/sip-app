"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { GenerateArtForm } from "@/components/art/generate-art-form"

export function CreateArtClient() {
  const router = useRouter()

  const handleMint = useCallback(
    (artId: string) => {
      void artId
      router.push("/art")
    },
    [router]
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <GenerateArtForm onMintRequest={handleMint} />
    </div>
  )
}
