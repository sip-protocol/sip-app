import { describe, it, expect, beforeEach } from "vitest"
import { useWalletStore } from "@/stores/wallet"

describe("useWalletStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useWalletStore.setState({
      isConnected: false,
      isConnecting: false,
      address: null,
      chain: null,
      walletType: null,
      availableWallets: {
        solana: [],
        ethereum: [],
        near: [],
        hardware: [],
      },
      isModalOpen: false,
    })
  })

  describe("initial state", () => {
    it("has correct initial values", () => {
      const state = useWalletStore.getState()

      expect(state.isConnected).toBe(false)
      expect(state.isConnecting).toBe(false)
      expect(state.address).toBeNull()
      expect(state.chain).toBeNull()
      expect(state.walletType).toBeNull()
      expect(state.isModalOpen).toBe(false)
    })
  })

  describe("connect", () => {
    it("sets connected state correctly", () => {
      const { connect } = useWalletStore.getState()

      connect("phantom", "solana", "HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH")

      const state = useWalletStore.getState()
      expect(state.isConnected).toBe(true)
      expect(state.isConnecting).toBe(false)
      expect(state.walletType).toBe("phantom")
      expect(state.chain).toBe("solana")
      expect(state.address).toBe("HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH")
      expect(state.isModalOpen).toBe(false)
    })

    it("supports ethereum wallets", () => {
      const { connect } = useWalletStore.getState()

      connect("metamask", "ethereum", "0x1234567890abcdef1234567890abcdef12345678")

      const state = useWalletStore.getState()
      expect(state.isConnected).toBe(true)
      expect(state.walletType).toBe("metamask")
      expect(state.chain).toBe("ethereum")
    })

    it("supports near wallets", () => {
      const { connect } = useWalletStore.getState()

      connect("meteor", "near", "user.near")

      const state = useWalletStore.getState()
      expect(state.isConnected).toBe(true)
      expect(state.walletType).toBe("meteor")
      expect(state.chain).toBe("near")
    })
  })

  describe("disconnect", () => {
    it("resets connection state", () => {
      // Setup: connect first
      const { connect } = useWalletStore.getState()
      connect("phantom", "solana", "abc123")

      // Verify connected
      expect(useWalletStore.getState().isConnected).toBe(true)

      // Act: disconnect
      useWalletStore.getState().disconnect()

      // Assert: all reset
      const state = useWalletStore.getState()
      expect(state.isConnected).toBe(false)
      expect(state.isConnecting).toBe(false)
      expect(state.address).toBeNull()
      expect(state.chain).toBeNull()
      expect(state.walletType).toBeNull()
    })
  })

  describe("setConnecting", () => {
    it("sets connecting state", () => {
      const { setConnecting } = useWalletStore.getState()

      setConnecting(true)
      expect(useWalletStore.getState().isConnecting).toBe(true)

      setConnecting(false)
      expect(useWalletStore.getState().isConnecting).toBe(false)
    })
  })

  describe("modal controls", () => {
    it("opens modal", () => {
      const { openModal } = useWalletStore.getState()

      openModal()

      expect(useWalletStore.getState().isModalOpen).toBe(true)
    })

    it("closes modal", () => {
      // Setup: open modal first
      useWalletStore.getState().openModal()
      expect(useWalletStore.getState().isModalOpen).toBe(true)

      // Act: close modal
      useWalletStore.getState().closeModal()

      expect(useWalletStore.getState().isModalOpen).toBe(false)
    })

    it("closes modal on connect", () => {
      // Setup: open modal
      useWalletStore.getState().openModal()
      expect(useWalletStore.getState().isModalOpen).toBe(true)

      // Act: connect (should close modal)
      useWalletStore.getState().connect("phantom", "solana", "abc123")

      expect(useWalletStore.getState().isModalOpen).toBe(false)
    })
  })

  describe("setAvailableWallets", () => {
    it("sets available wallets", () => {
      const { setAvailableWallets } = useWalletStore.getState()

      setAvailableWallets({
        solana: ["phantom", "solflare"],
        ethereum: ["metamask"],
        near: ["meteor"],
        hardware: ["ledger"],
      })

      const state = useWalletStore.getState()
      expect(state.availableWallets.solana).toEqual(["phantom", "solflare"])
      expect(state.availableWallets.ethereum).toEqual(["metamask"])
      expect(state.availableWallets.near).toEqual(["meteor"])
      expect(state.availableWallets.hardware).toEqual(["ledger"])
    })

    it("defaults hardware to empty array if not provided", () => {
      const { setAvailableWallets } = useWalletStore.getState()

      setAvailableWallets({
        solana: ["phantom"],
        ethereum: ["metamask"],
        near: ["meteor"],
      })

      expect(useWalletStore.getState().availableWallets.hardware).toEqual([])
    })
  })
})
