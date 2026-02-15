"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { TicketingService } from "@/lib/ticketing/ticketing-service"
import { useTicketingHistoryStore } from "@/stores/ticketing-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
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
}

export function usePurchaseTicket(): UsePurchaseTicketReturn {
  const { publicKey } = useWallet()
  const { addAction, addTicket } = useTicketingHistoryStore()
  const { trackTicketing } = useTrackEvent()

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
    [publicKey, addAction, addTicket, trackTicketing]
  )

  return { status, activeRecord, error, purchaseTicket, reset }
}
