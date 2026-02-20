"use client"

import { useState, useCallback, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { getSDK } from "@/lib/sip-client"

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

  // Load existing keys from storage
  useEffect(() => {
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
      console.error("Failed to load stealth keys from storage")
    }
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

      const metaAddressStr = sdk.encodeStealthMetaAddress(metaAddress)
      const spendingPublicKey =
        typeof metaAddress.spendingKey === "string"
          ? metaAddress.spendingKey
          : String(metaAddress.spendingKey)
      const viewingPublicKey =
        typeof metaAddress.viewingKey === "string"
          ? metaAddress.viewingKey
          : String(metaAddress.viewingKey)

      const newKeys: StealthKeys = {
        metaAddress: metaAddressStr,
        spendingPublicKey,
        viewingPublicKey,
        spendingPrivateKey,
        viewingPrivateKey,
        createdAt: Date.now(),
      }

      // Store in localStorage (MVP — production uses encrypted storage)
      const storageKey = getStorageKey(publicKey.toBase58())
      localStorage.setItem(storageKey, JSON.stringify(newKeys))

      setKeys(newKeys)
    } catch (err) {
      console.error("Failed to generate stealth keys:", err)
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
