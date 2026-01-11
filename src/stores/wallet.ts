import { create } from "zustand"
import type { WalletState } from "@/types"

interface WalletStore extends WalletState {
  connect: () => Promise<void>
  disconnect: () => void
  setAddress: (address: string | null) => void
  setBalance: (balance: number | null) => void
  setStealthMetaAddress: (address: string | null) => void
}

export const useWalletStore = create<WalletStore>((set) => ({
  // Initial state
  connected: false,
  address: null,
  balance: null,
  stealthMetaAddress: null,

  // Actions
  connect: async () => {
    // TODO: Implement wallet connection logic
    set({ connected: true })
  },

  disconnect: () => {
    set({
      connected: false,
      address: null,
      balance: null,
      stealthMetaAddress: null,
    })
  },

  setAddress: (address) => set({ address }),
  setBalance: (balance) => set({ balance }),
  setStealthMetaAddress: (stealthMetaAddress) => set({ stealthMetaAddress }),
}))
