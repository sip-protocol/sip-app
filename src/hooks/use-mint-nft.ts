"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { ArtService } from "@/lib/art/art-service"
import { useArtGalleryStore } from "@/stores/art-gallery"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type { ArtStep, MintArtParams, ArtActionRecord } from "@/lib/art/types"

export type MintNFTStatus = ArtStep | "idle" | "error"

export interface UseMintNFTReturn {
  status: MintNFTStatus
  activeRecord: ArtActionRecord | null
  error: string | null
  mintNFT: (params: MintArtParams) => Promise<ArtActionRecord | undefined>
  reset: () => void
}

export function useMintNFT(): UseMintNFTReturn {
  const { publicKey } = useWallet()
  const { addAction, addMintedNFT } = useArtGalleryStore()
  const { trackArt } = useTrackEvent()

  const [status, setStatus] = useState<MintNFTStatus>("idle")
  const [activeRecord, setActiveRecord] = useState<ArtActionRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const mintNFTFn = useCallback(
    async (params: MintArtParams): Promise<ArtActionRecord | undefined> => {
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

        const validationError = service.validate("mint", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("preparing_nft")

        const { record, nft } = await service.mintNFT(params)

        setActiveRecord(record)
        addAction(record)
        addMintedNFT(nft)

        trackArt({
          action: "mint",
          nftName: params.name,
          privacyLevel: params.privacyLevel,
        })

        return record
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "NFT minting failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, addAction, addMintedNFT, trackArt],
  )

  return { status, activeRecord, error, mintNFT: mintNFTFn, reset }
}
