"use client"

import { useState, useCallback } from "react"
import { useWalletStore } from "@/stores/wallet"
import { useToastStore } from "@/stores/toast"

export type PrivacyActionType =
  | "bridge"
  | "vote"
  | "social_post"
  | "social_follow"
  | "loyalty_claim"
  | "art_mint"
  | "channel_subscribe"
  | "channel_publish"
  | "migration"
  | "game_play"
  | "game_claim"
  | "ticket_purchase"
  | "ticket_verify"

export type PrivacyActionStatus =
  | "idle"
  | "preparing"
  | "confirming"
  | "executing"
  | "success"
  | "error"

export interface PrivacyActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  txSignature?: string
}

export interface UsePrivacyActionOptions {
  actionType: PrivacyActionType
  onSuccess?: (result: PrivacyActionResult) => void
  onError?: (error: string) => void
}

export interface UsePrivacyActionReturn<T = unknown> {
  status: PrivacyActionStatus
  error: string | null
  result: PrivacyActionResult<T> | null
  execute: (fn: () => Promise<PrivacyActionResult<T>>) => Promise<void>
  reset: () => void
}

export function usePrivacyAction<T = unknown>(
  options: UsePrivacyActionOptions
): UsePrivacyActionReturn<T> {
  const { isConnected } = useWalletStore()
  const addToast = useToastStore((s) => s.addToast)
  const [status, setStatus] = useState<PrivacyActionStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PrivacyActionResult<T> | null>(null)

  const execute = useCallback(
    async (fn: () => Promise<PrivacyActionResult<T>>) => {
      if (!isConnected) {
        const msg = "Wallet not connected"
        setError(msg)
        addToast({ title: msg, type: "error" })
        return
      }

      try {
        setStatus("preparing")
        setError(null)
        setResult(null)

        setStatus("executing")
        const actionResult = await fn()

        if (actionResult.success) {
          setStatus("success")
          setResult(actionResult)
          options.onSuccess?.(actionResult as PrivacyActionResult)
        } else {
          const errMsg = actionResult.error ?? "Action failed"
          setStatus("error")
          setError(errMsg)
          options.onError?.(errMsg)
          addToast({ title: errMsg, type: "error" })
        }
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Unknown error occurred"
        setStatus("error")
        setError(errMsg)
        options.onError?.(errMsg)
        addToast({ title: errMsg, type: "error" })
      }
    },
    [isConnected, options, addToast]
  )

  const reset = useCallback(() => {
    setStatus("idle")
    setError(null)
    setResult(null)
  }, [])

  return { status, error, result, execute, reset }
}
