import { create } from "zustand"

interface DemoModeState {
  isDemoMode: boolean
  enableDemo: () => void
  disableDemo: () => void
}

export const useDemoModeStore = create<DemoModeState>((set) => ({
  isDemoMode: false,
  enableDemo: () => set({ isDemoMode: true }),
  disableDemo: () => set({ isDemoMode: false }),
}))
