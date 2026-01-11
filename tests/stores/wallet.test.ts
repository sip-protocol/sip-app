import { describe, it, expect, beforeEach } from "vitest"
import { useWalletStore } from "@/stores/wallet"

describe("useWalletStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useWalletStore.setState({
      connected: false,
      address: null,
      balance: null,
      stealthMetaAddress: null,
    })
  })

  describe("initial state", () => {
    it("has correct initial values", () => {
      const state = useWalletStore.getState()

      expect(state.connected).toBe(false)
      expect(state.address).toBeNull()
      expect(state.balance).toBeNull()
      expect(state.stealthMetaAddress).toBeNull()
    })
  })

  describe("connect", () => {
    it("sets connected to true", async () => {
      const { connect } = useWalletStore.getState()

      await connect()

      expect(useWalletStore.getState().connected).toBe(true)
    })
  })

  describe("disconnect", () => {
    it("resets all state to initial values", async () => {
      // Setup: connect and set values
      const store = useWalletStore.getState()
      await store.connect()
      store.setAddress("0x123")
      store.setBalance(100)
      store.setStealthMetaAddress("sip:solana:abc:def")

      // Verify connected state
      expect(useWalletStore.getState().connected).toBe(true)
      expect(useWalletStore.getState().address).toBe("0x123")

      // Act: disconnect
      useWalletStore.getState().disconnect()

      // Assert: all reset
      const state = useWalletStore.getState()
      expect(state.connected).toBe(false)
      expect(state.address).toBeNull()
      expect(state.balance).toBeNull()
      expect(state.stealthMetaAddress).toBeNull()
    })
  })

  describe("setAddress", () => {
    it("sets address correctly", () => {
      const { setAddress } = useWalletStore.getState()
      const testAddress = "0xabcdef1234567890"

      setAddress(testAddress)

      expect(useWalletStore.getState().address).toBe(testAddress)
    })

    it("can set address to null", () => {
      const { setAddress } = useWalletStore.getState()
      setAddress("0x123")
      setAddress(null)

      expect(useWalletStore.getState().address).toBeNull()
    })
  })

  describe("setBalance", () => {
    it("sets balance correctly", () => {
      const { setBalance } = useWalletStore.getState()

      setBalance(1234.56)

      expect(useWalletStore.getState().balance).toBe(1234.56)
    })

    it("handles zero balance", () => {
      const { setBalance } = useWalletStore.getState()

      setBalance(0)

      expect(useWalletStore.getState().balance).toBe(0)
    })

    it("can set balance to null", () => {
      const { setBalance } = useWalletStore.getState()
      setBalance(100)
      setBalance(null)

      expect(useWalletStore.getState().balance).toBeNull()
    })
  })

  describe("setStealthMetaAddress", () => {
    it("sets stealth meta-address correctly", () => {
      const { setStealthMetaAddress } = useWalletStore.getState()
      const testAddress = "sip:solana:02abc123:03def456"

      setStealthMetaAddress(testAddress)

      expect(useWalletStore.getState().stealthMetaAddress).toBe(testAddress)
    })

    it("can set stealth meta-address to null", () => {
      const { setStealthMetaAddress } = useWalletStore.getState()
      setStealthMetaAddress("sip:solana:abc:def")
      setStealthMetaAddress(null)

      expect(useWalletStore.getState().stealthMetaAddress).toBeNull()
    })
  })
})
