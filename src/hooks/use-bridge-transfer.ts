"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { BridgeService } from "@/lib/bridge/bridge-service"
import { useBridgeHistoryStore } from "@/stores/bridge-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  BridgeStep,
  BridgeTransfer,
  BridgeChainId,
} from "@/lib/bridge/types"
import type { PrivacyLevel } from "@sip-protocol/types"

export type BridgeTransferStatus = BridgeStep | "idle" | "error"

interface BridgeTransferParams {
  sourceChain: BridgeChainId
  destChain: BridgeChainId
  token: string
  amount: string
  privacyLevel: PrivacyLevel
}

export interface UseBridgeTransferReturn {
  status: BridgeTransferStatus
  activeTransfer: BridgeTransfer | null
  error: string | null
  bridge: (params: BridgeTransferParams) => Promise<BridgeTransfer | undefined>
  reset: () => void
}

export function useBridgeTransfer(): UseBridgeTransferReturn {
  const { publicKey } = useWallet()
  const { addTransfer, updateTransfer } = useBridgeHistoryStore()
  const { trackBridge } = useTrackEvent()

  const [status, setStatus] = useState<BridgeTransferStatus>("idle")
  const [activeTransfer, setActiveTransfer] = useState<BridgeTransfer | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveTransfer(null)
    setError(null)
  }, [])

  const bridge = useCallback(
    async (
      params: BridgeTransferParams
    ): Promise<BridgeTransfer | undefined> => {
      if (!publicKey) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new BridgeService({
          mode: "simulation",
          onStepChange: (step, transfer) => {
            setStatus(step)
            setActiveTransfer({ ...transfer })
          },
        })

        const validationError = service.validate(params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("generating_stealth")

        const result = await service.executeBridge(params)

        setActiveTransfer(result)
        addTransfer(result)

        trackBridge({
          sourceChain: params.sourceChain,
          destChain: params.destChain,
          token: params.token,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Bridge transfer failed"
        setError(message)
        setStatus("error")

        if (activeTransfer) {
          updateTransfer(activeTransfer.id, {
            status: "failed",
            error: message,
          })
        }

        return undefined
      }
    },
    [publicKey, addTransfer, updateTransfer, trackBridge, activeTransfer]
  )

  return { status, activeTransfer, error, bridge, reset }
}
