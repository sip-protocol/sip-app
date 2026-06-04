"use client"

import { useState, useCallback, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { getSDK } from "@/lib/sip-client"
import bs58 from "bs58"
import { logger } from "@/lib/logger"

export interface StealthKeys {
  metaAddress: string
  spendingPublicKey: string
  viewingPublicKey: string
  spendingPrivateKey: string
  viewingPrivateKey: string
  createdAt: number
}

interface UseStealthKeysResult {
  keys: StealthKeys | null
  isLoading: boolean
  error: string | null
  generate: () => Promise<void>
  clear: () => void
  hasBackedUp: boolean
  confirmBackup: () => void
}

/** Convert a hex string (with optional 0x prefix) to base58 */
function hexToBase58(hex: string): string {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16)
  }
  return bs58.encode(bytes)
}

const STORAGE_KEY = "sip_stealth_keys"
const BACKUP_KEY = "sip_backup_confirmed"

function getStorageKey(publicKey: string): string {
  return `${STORAGE_KEY}_${publicKey}`
}

export function useStealthKeys(): UseStealthKeysResult {
  const { publicKey, connected } = useWallet()

  const [keys, setKeys] = useState<StealthKeys | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasBackedUp, setHasBackedUp] = useState(false)

  // Load existing keys from storage. Wrapped in a local function so the state
  // updates are not direct synchronous setState in the effect body (react-hooks).
  useEffect(() => {
    const loadFromStorage = () => {
      if (!connected || !publicKey) {
        setKeys(null)
        return
      }

      const storageKey = getStorageKey(publicKey.toBase58())

      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored) as StealthKeys
          setKeys(parsed)
        }

        const backedUp = localStorage.getItem(
          `${BACKUP_KEY}_${publicKey.toBase58()}`
        )
        setHasBackedUp(backedUp === "true")
      } catch {
        logger.error(
          "Failed to load stealth keys from storage",
          undefined,
          "useStealthKeys"
        )
      }
    }

    loadFromStorage()
  }, [connected, publicKey])

  const generate = useCallback(async () => {
    if (!publicKey) {
      setError("Wallet not connected")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const sdk = await getSDK()

      // Generate real ed25519 stealth meta-address via SDK
      const { metaAddress, spendingPrivateKey, viewingPrivateKey } =
        sdk.generateStealthMetaAddress("solana")

      // Convert hex keys from SDK to Solana-native base58 encoding
      const spendingPubBase58 = hexToBase58(
        typeof metaAddress.spendingKey === "string"
          ? metaAddress.spendingKey
          : String(metaAddress.spendingKey)
      )
      const viewingPubBase58 = hexToBase58(
        typeof metaAddress.viewingKey === "string"
          ? metaAddress.viewingKey
          : String(metaAddress.viewingKey)
      )
      const spendingPrivBase58 = hexToBase58(spendingPrivateKey)
      const viewingPrivBase58 = hexToBase58(viewingPrivateKey)

      // Build meta-address with base58 keys: sip:solana:<spending>:<viewing>
      const metaAddressStr = `sip:solana:${spendingPubBase58}:${viewingPubBase58}`

      const newKeys: StealthKeys = {
        metaAddress: metaAddressStr,
        spendingPublicKey: spendingPubBase58,
        viewingPublicKey: viewingPubBase58,
        spendingPrivateKey: spendingPrivBase58,
        viewingPrivateKey: viewingPrivBase58,
        createdAt: Date.now(),
      }

      // Store in localStorage (MVP — production uses encrypted storage)
      const storageKey = getStorageKey(publicKey.toBase58())
      localStorage.setItem(storageKey, JSON.stringify(newKeys))

      setKeys(newKeys)
    } catch (err) {
      logger.error("Failed to generate stealth keys", err, "useStealthKeys")
      setError(err instanceof Error ? err.message : "Failed to generate keys")
    } finally {
      setIsLoading(false)
    }
  }, [publicKey])

  const clear = useCallback(() => {
    if (!publicKey) return

    const storageKey = getStorageKey(publicKey.toBase58())
    localStorage.removeItem(storageKey)
    localStorage.removeItem(`${BACKUP_KEY}_${publicKey.toBase58()}`)
    setKeys(null)
    setHasBackedUp(false)
  }, [publicKey])

  const confirmBackup = useCallback(() => {
    if (!publicKey) return
    localStorage.setItem(`${BACKUP_KEY}_${publicKey.toBase58()}`, "true")
    setHasBackedUp(true)
  }, [publicKey])

  return {
    keys,
    isLoading,
    error,
    generate,
    clear,
    hasBackedUp,
    confirmBackup,
  }
}
