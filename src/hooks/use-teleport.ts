"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useDemoModeStore } from "@/stores/demo-mode"
import { MetaverseService } from "@/lib/metaverse/metaverse-service"
import { useMetaverseHistoryStore } from "@/stores/metaverse-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import { useSolanaTransaction } from "@/hooks/use-solana-transaction"
import { createStealthTransfer } from "@/lib/solana/stealth-transfer"
import type {
  MetaverseStep,
  TeleportParams,
  MetaverseActionRecord,
} from "@/lib/metaverse/types"

export type TeleportStatus = MetaverseStep | "idle" | "error"

export interface UseTeleportOptions {
  onCommitTransaction?: (id: string, data: string) => Promise<string | null>
  onShieldedTransfer?: (
    amountLamports: number,
    memo: string
  ) => Promise<string | null>
}

export interface UseTeleportReturn {
  status: TeleportStatus
  activeRecord: MetaverseActionRecord | null
  error: string | null
  teleport: (
    params: TeleportParams
  ) => Promise<MetaverseActionRecord | undefined>
  reset: () => void
  shieldedTx: ReturnType<typeof useSolanaTransaction>
}

export function useTeleport(
  options: UseTeleportOptions = {}
): UseTeleportReturn {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const isDemoMode = useDemoModeStore((s) => s.isDemoMode)
  const { addAction } = useMetaverseHistoryStore()
  const { trackMetaverse } = useTrackEvent()
  const shieldedTx = useSolanaTransaction()

  const [status, setStatus] = useState<TeleportStatus>("idle")
  const [activeRecord, setActiveRecord] =
    useState<MetaverseActionRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const defaultShieldedTransfer = useCallback(
    async (amountLamports: number, memo: string): Promise<string | null> => {
      if (!publicKey) return null
      try {
        const viewingKey =
          process.env.NEXT_PUBLIC_RECIPIENT_VIEWING_PUBKEY ??
          "11111111111111111111111111111111"
        const spendingKey =
          process.env.NEXT_PUBLIC_RECIPIENT_SPENDING_PUBKEY ??
          "11111111111111111111111111111111"

        const transfer = await createStealthTransfer({
          amountLamports,
          memo,
          recipientViewingPublicKey: viewingKey,
          recipientSpendingPublicKey: spendingKey,
        })

        const transaction = await transfer.buildTransaction(
          publicKey,
          connection.rpcEndpoint
        )

        return shieldedTx.sendTransaction(transaction)
      } catch {
        return null
      }
    },
    [publicKey, connection, shieldedTx]
  )

  const teleport = useCallback(
    async (
      params: TeleportParams
    ): Promise<MetaverseActionRecord | undefined> => {
      if (!publicKey && !isDemoMode) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new MetaverseService({
          mode: "simulation",
          onStepChange: (step, record) => {
            setStatus(step)
            setActiveRecord({ ...record })
          },
          onCommitTransaction: options.onCommitTransaction,
          onShieldedTransfer:
            options.onShieldedTransfer ?? defaultShieldedTransfer,
        })

        const validationError = service.validate("teleport", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("generating_proof")

        const result = await service.teleport(params)

        setActiveRecord(result)
        addAction(result)

        trackMetaverse({
          action: "world_teleport",
          worldId: params.worldId,
          tier: params.tier,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Teleport failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [
      publicKey,
      isDemoMode,
      addAction,
      trackMetaverse,
      options.onCommitTransaction,
      options.onShieldedTransfer,
      defaultShieldedTransfer,
    ]
  )

  return { status, activeRecord, error, teleport, reset, shieldedTx }
}
