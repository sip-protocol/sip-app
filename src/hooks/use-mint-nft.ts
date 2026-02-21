"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { useDemoModeStore } from "@/stores/demo-mode"
import { ArtService } from "@/lib/art/art-service"
import type { BuildCNFTMintFn } from "@/lib/art/art-service"
import { buildMintCNFTTransaction } from "@/lib/solana/bubblegum-client"
import { useArtGalleryStore } from "@/stores/art-gallery"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"
import type { ArtStep, MintArtParams, ArtActionRecord } from "@/lib/art/types"

export type MintNFTStatus = ArtStep | "idle" | "error"

export interface UseMintNFTReturn {
  status: MintNFTStatus
  activeRecord: ArtActionRecord | null
  error: string | null
  mintNFT: (params: MintArtParams) => Promise<ArtActionRecord | undefined>
  reset: () => void
  /** Solana transaction state for cNFT mint */
  mintTx: ReturnType<typeof useSolanaTransaction>
}

/**
 * Read Bubblegum tree configuration from env vars.
 * Returns null if either tree or collection is not configured.
 */
function getBubblegumConfig(): {
  merkleTree: PublicKey
  collectionMint: PublicKey
} | null {
  const treeStr =
    typeof process !== "undefined"
      ? process.env?.NEXT_PUBLIC_MERKLE_TREE
      : undefined
  const collStr =
    typeof process !== "undefined"
      ? process.env?.NEXT_PUBLIC_COLLECTION_MINT
      : undefined

  if (!treeStr || !collStr) return null

  try {
    return {
      merkleTree: new PublicKey(treeStr),
      collectionMint: new PublicKey(collStr),
    }
  } catch {
    console.warn("[SIP] Invalid Bubblegum config — falling back to simulation")
    return null
  }
}

export function useMintNFT(): UseMintNFTReturn {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const isDemoMode = useDemoModeStore((s) => s.isDemoMode)
  const { addAction, addMintedNFT } = useArtGalleryStore()
  const { trackArt } = useTrackEvent()
  const mintTx = useSolanaTransaction()

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
      if (!publicKey && !isDemoMode) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        // Build the cNFT mint callback when Bubblegum is configured
        const bgConfig = getBubblegumConfig()
        const buildCNFTMint: BuildCNFTMintFn | undefined =
          bgConfig && publicKey
            ? async ({ recipient, name, metadataUri }) => {
                try {
                  const recipientPubkey = new PublicKey(recipient)
                  const { transaction } = await buildMintCNFTTransaction({
                    connection,
                    payer: publicKey,
                    recipient: recipientPubkey,
                    merkleTree: bgConfig.merkleTree,
                    collectionMint: bgConfig.collectionMint,
                    metadata: {
                      name,
                      symbol: "SIPART",
                      uri: metadataUri,
                      sellerFeeBasisPoints: 0,
                    },
                  })
                  return transaction
                } catch (err) {
                  console.warn(
                    "[SIP] cNFT mint tx build failed, falling back:",
                    err instanceof Error ? err.message : err
                  )
                  return null
                }
              }
            : undefined

        const service = new ArtService({
          mode: "simulation",
          onStepChange: (step, record) => {
            setStatus(step)
            setActiveRecord({ ...record })
          },
          buildCNFTMint,
          onSendTransaction: (tx) => mintTx.sendTransaction(tx),
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
    [publicKey, isDemoMode, connection, addAction, addMintedNFT, trackArt, mintTx]
  )

  return { status, activeRecord, error, mintNFT: mintNFTFn, reset, mintTx }
}
