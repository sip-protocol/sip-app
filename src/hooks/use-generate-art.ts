"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { ArtService } from "@/lib/art/art-service"
import { useArtGalleryStore } from "@/stores/art-gallery"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type { ArtStep, GenerateArtParams, ArtActionRecord, GeneratedArt } from "@/lib/art/types"

export type GenerateArtStatus = ArtStep | "idle" | "error"

export interface UseGenerateArtReturn {
  status: GenerateArtStatus
  activeRecord: ArtActionRecord | null
  generatedArt: GeneratedArt | null
  error: string | null
  generateArt: (params: GenerateArtParams) => Promise<ArtActionRecord | undefined>
  reset: () => void
}

export function useGenerateArt(): UseGenerateArtReturn {
  const { publicKey } = useWallet()
  const { addAction, addGeneratedArt } = useArtGalleryStore()
  const { trackArt } = useTrackEvent()

  const [status, setStatus] = useState<GenerateArtStatus>("idle")
  const [activeRecord, setActiveRecord] = useState<ArtActionRecord | null>(null)
  const [generatedArt, setGeneratedArt] = useState<GeneratedArt | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setGeneratedArt(null)
    setError(null)
  }, [])

  const generateArtFn = useCallback(
    async (params: GenerateArtParams): Promise<ArtActionRecord | undefined> => {
      if (!publicKey) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new ArtService({
          mode: "simulation",
          onStepChange: (step, record) => {
            setStatus(step)
            setActiveRecord({ ...record })
          },
        })

        const validationError = service.validate("generate", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("selecting_style")

        const { record, art } = await service.generateArt(params)

        setActiveRecord(record)
        setGeneratedArt(art)
        addAction(record)
        addGeneratedArt(art)

        trackArt({
          action: "generate",
          styleId: params.styleId,
          privacyLevel: params.privacyLevel,
        })

        return record
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Art generation failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, addAction, addGeneratedArt, trackArt],
  )

  return { status, activeRecord, generatedArt, error, generateArt: generateArtFn, reset }
}
