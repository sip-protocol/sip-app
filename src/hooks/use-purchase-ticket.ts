"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { useDemoModeStore } from "@/stores/demo-mode"
import { TicketingService } from "@/lib/ticketing/ticketing-service"
import type { BuildCNFTMintFn } from "@/lib/ticketing/ticketing-service"
import { buildMintCNFTTransaction } from "@/lib/solana/bubblegum-client"
import { useTicketingHistoryStore } from "@/stores/ticketing-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"
import type {
  TicketingStep,
  PurchaseTicketParams,
  TicketingActionRecord,
  Ticket,
} from "@/lib/ticketing/types"

export type PurchaseTicketStatus = TicketingStep | "idle" | "error"

export interface UsePurchaseTicketReturn {
  status: PurchaseTicketStatus
  activeRecord: TicketingActionRecord | null
  error: string | null
  purchaseTicket: (
    params: PurchaseTicketParams
  ) => Promise<TicketingActionRecord | undefined>
  reset: () => void
  /** Solana transaction state for cNFT ticket mint */
  ticketTx: ReturnType<typeof useSolanaTransaction>
}

export interface UsePurchaseTicketOptions {
  onCommitTransaction?: (
    eventId: string,
    tier: string
  ) => Promise<string | null>
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

export function usePurchaseTicket(
  options: UsePurchaseTicketOptions = {}
): UsePurchaseTicketReturn {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const isDemoMode = useDemoModeStore((s) => s.isDemoMode)
  const { addAction, addTicket } = useTicketingHistoryStore()
  const { trackTicketing } = useTrackEvent()
  const ticketTx = useSolanaTransaction()

  const [status, setStatus] = useState<PurchaseTicketStatus>("idle")
  const [activeRecord, setActiveRecord] =
    useState<TicketingActionRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const purchaseTicket = useCallback(
    async (
      params: PurchaseTicketParams
    ): Promise<TicketingActionRecord | undefined> => {
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
                      symbol: "SIPTIX",
                      uri: metadataUri,
                      sellerFeeBasisPoints: 0,
                    },
                  })
                  return transaction
                } catch (err) {
                  console.warn(
                    "[SIP] cNFT ticket mint tx build failed, falling back:",
                    err instanceof Error ? err.message : err
                  )
                  return null
                }
              }
            : undefined

        const service = new TicketingService({
          mode: "simulation",
          onStepChange: (step, record) => {
            setStatus(step)
            setActiveRecord({ ...record })
          },
          onCommitTransaction: options.onCommitTransaction,
          buildCNFTMint,
          onSendTransaction: (tx) => ticketTx.sendTransaction(tx),
        })

        const validationError = service.validate("purchase", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("selecting_event")

        const result = await service.purchaseTicket(params)

        setActiveRecord(result)
        addAction(result)

        if (result.commitmentHash) {
          const ticket: Ticket = {
            eventId: params.eventId,
            tier: params.tier,
            commitmentHash: result.commitmentHash,
            purchasedAt: Date.now(),
          }
          addTicket(ticket)
        }

        trackTicketing({
          action: "ticket_purchase",
          eventId: params.eventId,
          tier: params.tier,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Purchase failed"
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
      addTicket,
      trackTicketing,
      options.onCommitTransaction,
      ticketTx,
    ]
  )

  return { status, activeRecord, error, purchaseTicket, reset, ticketTx }
}
