"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { TicketingService } from "@/lib/ticketing/ticketing-service"
import { useTicketingHistoryStore } from "@/stores/ticketing-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  TicketingStep,
  VerifyTicketParams,
  TicketingActionRecord,
} from "@/lib/ticketing/types"

export type VerifyTicketStatus = TicketingStep | "idle" | "error"

export interface UseVerifyTicketReturn {
  status: VerifyTicketStatus
  activeRecord: TicketingActionRecord | null
  error: string | null
  verifyTicket: (
    params: VerifyTicketParams
  ) => Promise<TicketingActionRecord | undefined>
  reset: () => void
}

export function useVerifyTicket(): UseVerifyTicketReturn {
  const { publicKey } = useWallet()
  const { addAction } = useTicketingHistoryStore()
  const { trackTicketing } = useTrackEvent()

  const [status, setStatus] = useState<VerifyTicketStatus>("idle")
  const [activeRecord, setActiveRecord] =
    useState<TicketingActionRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const verifyTicket = useCallback(
    async (
      params: VerifyTicketParams
    ): Promise<TicketingActionRecord | undefined> => {
      if (!publicKey) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new TicketingService({
          mode: "simulation",
          onStepChange: (step, record) => {
            setStatus(step)
            setActiveRecord({ ...record })
          },
        })

        const validationError = service.validate("verify", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("generating_proof")

        const result = await service.verifyTicket(params)

        setActiveRecord(result)
        addAction(result)

        trackTicketing({
          action: "ticket_verify",
          eventId: params.eventId,
          tier: params.tier,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Verify failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, addAction, trackTicketing]
  )

  return { status, activeRecord, error, verifyTicket, reset }
}
