import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ArtActionRecord, GeneratedArt, ArtNFT } from "@/lib/art/types"
import { MAX_ART_HISTORY } from "@/lib/art/constants"

interface ArtGalleryStore {
  actions: ArtActionRecord[]
  generatedArts: GeneratedArt[]
  mintedNFTs: ArtNFT[]

  addAction: (record: ArtActionRecord) => void
  updateAction: (id: string, updates: Partial<ArtActionRecord>) => void
  getAction: (id: string) => ArtActionRecord | undefined
  getActionsByType: (type: "generate" | "mint") => ArtActionRecord[]

  addGeneratedArt: (art: GeneratedArt) => void
  getGeneratedArt: (id: string) => GeneratedArt | undefined
  getGeneratedArts: () => GeneratedArt[]

  addMintedNFT: (nft: ArtNFT) => void
  getMintedNFTs: () => ArtNFT[]

  clearHistory: () => void
}

export const useArtGalleryStore = create<ArtGalleryStore>()(
  persist(
    (set, get) => ({
      actions: [],
      generatedArts: [],
      mintedNFTs: [],

      addAction: (record) =>
        set((state) => ({
          actions: [record, ...state.actions].slice(0, MAX_ART_HISTORY),
        })),

      updateAction: (id, updates) =>
        set((state) => ({
          actions: state.actions.map((a) =>
            a.id === id ? { ...a, ...updates } : a,
          ),
        })),

      getAction: (id) => get().actions.find((a) => a.id === id),

      getActionsByType: (type) =>
        get().actions.filter((a) => a.type === type),

      addGeneratedArt: (art) =>
        set((state) => ({
          generatedArts: [art, ...state.generatedArts].slice(0, MAX_ART_HISTORY),
        })),

      getGeneratedArt: (id) =>
        get().generatedArts.find((a) => a.id === id),

      getGeneratedArts: () => get().generatedArts,

      addMintedNFT: (nft) =>
        set((state) => ({
          mintedNFTs: [nft, ...state.mintedNFTs],
        })),

      getMintedNFTs: () => get().mintedNFTs,

      clearHistory: () =>
        set({ actions: [], generatedArts: [], mintedNFTs: [] }),
    }),
    {
      name: "sip-art-gallery",
    },
  ),
)
