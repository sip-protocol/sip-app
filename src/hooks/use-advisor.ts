/**
 * useAdvisor Hook
 *
 * Hook for interacting with the Privacy Advisor.
 * Combines store state with API calls.
 */

"use client"

import { useCallback } from "react"
import { useAdvisorStore } from "@/stores/advisor"
import {
  AdvisorMessage,
  AdvisorContext,
  AdvisorRecommendation,
  createUserMessage,
  createAdvisorMessage,
} from "@/lib/advisor"

/** Response from the advisor API */
interface AdvisorAPIResponse {
  success: boolean
  provider: string
  message: AdvisorMessage
  recommendations?: AdvisorMessage["metadata"]
  error?: string
}

/** Hook return type */
interface UseAdvisorReturn {
  /** Chat message history */
  messages: AdvisorMessage[]

  /** Current recommendations */
  recommendations: AdvisorRecommendation[]

  /** Whether the advisor is responding */
  isLoading: boolean

  /** Current error */
  error: string | null

  /** Whether chat widget is open */
  isOpen: boolean

  /** Current context */
  context: AdvisorContext | null

  /** Send a message to the advisor */
  sendMessage: (content: string) => Promise<void>

  /** Analyze a wallet */
  analyzeWallet: (address: string) => Promise<void>

  /** Set the context */
  setContext: (context: AdvisorContext | null) => void

  /** Open the chat widget */
  open: () => void

  /** Close the chat widget */
  close: () => void

  /** Toggle the chat widget */
  toggle: () => void

  /** Clear chat history */
  clearHistory: () => void
}

/** Call the advisor API */
async function callAdvisorAPI(
  messages: AdvisorMessage[],
  context?: AdvisorContext
): Promise<AdvisorAPIResponse> {
  const response = await fetch("/api/advisor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      context,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.details || "Failed to get response from advisor")
  }

  return response.json()
}

/**
 * Hook for interacting with the Privacy Advisor
 */
export function useAdvisor(): UseAdvisorReturn {
  const {
    messages,
    recommendations,
    isLoading,
    error,
    isOpen,
    context,
    addMessage,
    setRecommendations,
    setLoading,
    setError,
    setOpen,
    toggleOpen,
    setContext,
    clearHistory,
  } = useAdvisorStore()

  /** Send a message to the advisor */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      // Add user message
      const userMessage = createUserMessage(content)
      addMessage(userMessage)

      setLoading(true)
      setError(null)

      try {
        // Get all messages including the new one
        const allMessages = [...messages, userMessage]

        // Call the API
        const response = await callAdvisorAPI(allMessages, context || undefined)

        if (response.success && response.message) {
          // Add advisor response
          addMessage({
            ...response.message,
            timestamp: new Date(response.message.timestamp),
          })

          // Update recommendations if provided
          if (response.message.metadata?.recommendations) {
            setRecommendations(response.message.metadata.recommendations)
          }
        } else {
          throw new Error(response.error || "Unknown error")
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get response"
        setError(errorMessage)

        // Add error message to chat
        addMessage(
          createAdvisorMessage(
            "I'm sorry, I encountered an error. Please try again.",
            { error: errorMessage }
          )
        )
      } finally {
        setLoading(false)
      }
    },
    [
      messages,
      context,
      isLoading,
      addMessage,
      setLoading,
      setError,
      setRecommendations,
    ]
  )

  /** Analyze a specific wallet */
  const analyzeWallet = useCallback(
    async (address: string) => {
      // Update context with the wallet address
      setContext({ ...context, walletAddress: address })

      // Send analysis request
      await sendMessage(`Analyze wallet ${address}`)
    },
    [context, setContext, sendMessage]
  )

  /** Open the chat widget */
  const open = useCallback(() => {
    setOpen(true)
  }, [setOpen])

  /** Close the chat widget */
  const close = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  /** Toggle the chat widget */
  const toggle = useCallback(() => {
    toggleOpen()
  }, [toggleOpen])

  return {
    messages,
    recommendations,
    isLoading,
    error,
    isOpen,
    context,
    sendMessage,
    analyzeWallet,
    setContext,
    open,
    close,
    toggle,
    clearHistory,
  }
}

/** Hook for just the chat widget open state */
export function useAdvisorOpen() {
  const isOpen = useAdvisorStore((state) => state.isOpen)
  const setOpen = useAdvisorStore((state) => state.setOpen)
  const toggleOpen = useAdvisorStore((state) => state.toggleOpen)

  return { isOpen, setOpen, toggleOpen }
}
