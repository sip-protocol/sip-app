/**
 * Privacy Advisor Store
 *
 * Zustand store for managing advisor chat state.
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  AdvisorMessage,
  AdvisorRecommendation,
  AdvisorContext,
} from "@/lib/advisor"

/** Advisor store state */
interface AdvisorState {
  /** Chat message history */
  messages: AdvisorMessage[]

  /** Current recommendations */
  recommendations: AdvisorRecommendation[]

  /** Whether the advisor is currently responding */
  isLoading: boolean

  /** Current error message */
  error: string | null

  /** Whether the chat widget is open */
  isOpen: boolean

  /** Current context (wallet address, score, etc.) */
  context: AdvisorContext | null

  /** Actions */
  addMessage: (message: AdvisorMessage) => void
  setMessages: (messages: AdvisorMessage[]) => void
  setRecommendations: (recommendations: AdvisorRecommendation[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setOpen: (open: boolean) => void
  toggleOpen: () => void
  setContext: (context: AdvisorContext | null) => void
  clearHistory: () => void
  reset: () => void
}

/** Initial state */
const initialState = {
  messages: [],
  recommendations: [],
  isLoading: false,
  error: null,
  isOpen: false,
  context: null,
}

/** Welcome message shown when chat is first opened */
const WELCOME_MESSAGE: AdvisorMessage = {
  id: "welcome",
  role: "advisor",
  content: `**Welcome to the Privacy Advisor!**

I'm here to help you understand and improve your wallet's privacy on Solana.

I can:
- **Analyze** your wallet for privacy risks
- **Explain** why each risk matters
- **Recommend** specific actions to improve
- **Guide** you through SIP Protocol features

Try asking me:
- "Why is address reuse bad?"
- "Analyze GjKr7..." (paste your wallet address)
- "What can SIP do for me?"

What would you like to know?`,
  timestamp: new Date(),
}

/** Create the advisor store */
export const useAdvisorStore = create<AdvisorState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      setMessages: (messages) => set({ messages }),

      setRecommendations: (recommendations) => set({ recommendations }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setOpen: (isOpen) => {
        const state = get()
        // Add welcome message if opening for first time with no messages
        if (isOpen && state.messages.length === 0) {
          set({
            isOpen,
            messages: [WELCOME_MESSAGE],
          })
        } else {
          set({ isOpen })
        }
      },

      toggleOpen: () => {
        const state = get()
        state.setOpen(!state.isOpen)
      },

      setContext: (context) => set({ context }),

      clearHistory: () =>
        set({
          messages: [WELCOME_MESSAGE],
          recommendations: [],
          error: null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "sip-advisor-store",
      partialize: (state) => ({
        // Only persist messages and recommendations
        messages: state.messages.slice(-50), // Keep last 50 messages
        recommendations: state.recommendations,
      }),
    }
  )
)

/** Selector for checking if chat has messages */
export const selectHasMessages = (state: AdvisorState) =>
  state.messages.length > 0

/** Selector for the last message */
export const selectLastMessage = (state: AdvisorState) =>
  state.messages[state.messages.length - 1]

/** Selector for user messages only */
export const selectUserMessages = (state: AdvisorState) =>
  state.messages.filter((m) => m.role === "user")

/** Selector for advisor messages only */
export const selectAdvisorMessages = (state: AdvisorState) =>
  state.messages.filter((m) => m.role === "advisor")
