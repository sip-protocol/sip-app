import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface HistoryEntry {
  id: string
  type: "sent" | "claimed"
  walletAddress: string
  amount: number
  token: string
  txSignature: string
  stealthAddress: string
  recipient?: string
  transferRecordPda?: string
  timestamp: number
}

export interface AddSentParams {
  walletAddress: string
  recipient: string
  amount: number
  token: string
  txSignature: string
  stealthAddress: string
  timestamp: number
}

export interface AddClaimedParams {
  walletAddress: string
  transferRecordPda: string
  amount: number
  token: string
  txSignature: string
  stealthAddress: string
  timestamp: number
}

interface PaymentHistoryState {
  entries: HistoryEntry[]
  addSent: (params: AddSentParams) => void
  addClaimed: (params: AddClaimedParams) => void
  getAll: (walletAddress: string) => HistoryEntry[]
  getSent: (walletAddress: string) => HistoryEntry[]
  getClaimed: (walletAddress: string) => HistoryEntry[]
  clear: () => void
}

const MAX_ENTRIES_PER_WALLET = 100

function generateId(): string {
  return `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function enforceWalletLimit(
  entries: HistoryEntry[],
  walletAddress: string
): HistoryEntry[] {
  const walletEntries = entries.filter((e) => e.walletAddress === walletAddress)
  if (walletEntries.length <= MAX_ENTRIES_PER_WALLET) return entries

  const sorted = [...walletEntries].sort((a, b) => b.timestamp - a.timestamp)
  const keepIds = new Set(
    sorted.slice(0, MAX_ENTRIES_PER_WALLET).map((e) => e.id)
  )

  return entries.filter(
    (e) => e.walletAddress !== walletAddress || keepIds.has(e.id)
  )
}

function filterAndSort(
  entries: HistoryEntry[],
  walletAddress: string,
  type?: "sent" | "claimed"
): HistoryEntry[] {
  return entries
    .filter(
      (e) =>
        e.walletAddress === walletAddress && (type === undefined || e.type === type)
    )
    .sort((a, b) => b.timestamp - a.timestamp)
}

export const usePaymentHistoryStore = create<PaymentHistoryState>()(
  persist(
    (set, get) => ({
      entries: [],

      addSent: (params) =>
        set((state) => {
          const entry: HistoryEntry = {
            id: generateId(),
            type: "sent",
            walletAddress: params.walletAddress,
            amount: params.amount,
            token: params.token,
            txSignature: params.txSignature,
            stealthAddress: params.stealthAddress,
            recipient: params.recipient,
            timestamp: params.timestamp,
          }
          const updated = [...state.entries, entry]
          return {
            entries: enforceWalletLimit(updated, params.walletAddress),
          }
        }),

      addClaimed: (params) =>
        set((state) => {
          const entry: HistoryEntry = {
            id: generateId(),
            type: "claimed",
            walletAddress: params.walletAddress,
            amount: params.amount,
            token: params.token,
            txSignature: params.txSignature,
            stealthAddress: params.stealthAddress,
            transferRecordPda: params.transferRecordPda,
            timestamp: params.timestamp,
          }
          const updated = [...state.entries, entry]
          return {
            entries: enforceWalletLimit(updated, params.walletAddress),
          }
        }),

      getAll: (walletAddress) => filterAndSort(get().entries, walletAddress),

      getSent: (walletAddress) =>
        filterAndSort(get().entries, walletAddress, "sent"),

      getClaimed: (walletAddress) =>
        filterAndSort(get().entries, walletAddress, "claimed"),

      clear: () => set({ entries: [] }),
    }),
    {
      name: "sip-payment-history",
    }
  )
)
