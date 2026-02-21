"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { useDemoModeStore } from "@/stores/demo-mode"
import { ChannelService } from "@/lib/channel/channel-service"
import type { BuildCNFTMintFn } from "@/lib/channel/channel-service"
import { buildMintCNFTTransaction } from "@/lib/solana/bubblegum-client"
import { useChannelHistoryStore } from "@/stores/channel-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"
import type {
  ChannelStep,
  PublishDropParams,
  ChannelActionRecord,
} from "@/lib/channel/types"

export type PublishDropStatus = ChannelStep | "idle" | "error"

export interface UsePublishDropOptions {
  onCommitTransaction?: (id: string, data: string) => Promise<string | null>
}

export interface UsePublishDropReturn {
  status: PublishDropStatus
  activeRecord: ChannelActionRecord | null
  error: string | null
  publishDrop: (
    params: PublishDropParams
  ) => Promise<ChannelActionRecord | undefined>
  reset: () => void
  /** Solana transaction state for cNFT drop mint */
  dropTx: ReturnType<typeof useSolanaTransaction>
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

export function usePublishDrop(
  options: UsePublishDropOptions = {}
): UsePublishDropReturn {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const isDemoMode = useDemoModeStore((s) => s.isDemoMode)
  const { addAction } = useChannelHistoryStore()
  const { trackChannel } = useTrackEvent()
  const dropTx = useSolanaTransaction()

  const [status, setStatus] = useState<PublishDropStatus>("idle")
  const [activeRecord, setActiveRecord] = useState<ChannelActionRecord | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const publishDrop = useCallback(
    async (
      params: PublishDropParams
    ): Promise<ChannelActionRecord | undefined> => {
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
                      symbol: "SIPDROP",
                      uri: metadataUri,
                      sellerFeeBasisPoints: 0,
                    },
                  })
                  return transaction
                } catch (err) {
                  console.warn(
                    "[SIP] cNFT drop mint tx build failed, falling back:",
                    err instanceof Error ? err.message : err
                  )
                  return null
                }
              }
            : undefined

        const service = new ChannelService({
          mode: "simulation",
          onStepChange: (step, record) => {
            setStatus(step)
            setActiveRecord({ ...record })
          },
          onCommitTransaction: options.onCommitTransaction,
          buildCNFTMint,
          onSendTransaction: (tx) => dropTx.sendTransaction(tx),
        })

        const validationError = service.validate("publish", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("encrypting_content")

        const result = await service.publishDrop(params)

        setActiveRecord(result)
        addAction(result)

        trackChannel({
          action: "channel_publish",
          contentType: params.contentType,
          accessTier: params.accessTier,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Publish failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [
      publicKey,
      isDemoMode,
      connection,
      addAction,
      trackChannel,
      options.onCommitTransaction,
      dropTx,
    ]
  )

  return { status, activeRecord, error, publishDrop, reset, dropTx }
}
