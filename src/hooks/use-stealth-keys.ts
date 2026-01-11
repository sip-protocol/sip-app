"use client"

import { useState, useCallback, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"

export interface StealthKeys {
  metaAddress: string
  spendingPublicKey: string
  viewingPublicKey: string
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
      // TODO: Replace with actual SDK integration when available
      // For now, generate deterministic keys based on wallet signature
      //
      // Production implementation:
      // import { generateEd25519StealthMetaAddress, encodeStealthMetaAddress } from '@sip-protocol/sdk'
      // const { metaAddress, spendingPrivateKey, viewingPrivateKey } =
      //   generateEd25519StealthMetaAddress('solana', 'My Wallet')

      // Mock implementation for demo
      // Generate pseudo-random hex strings (64 chars = 32 bytes)
      const generateHex = (seed: string) => {
        let hash = 0
        for (let i = 0; i < seed.length; i++) {
          const char = seed.charCodeAt(i)
          hash = (hash << 5) - hash + char
          hash = hash & hash
        }

        const bytes = []
        for (let i = 0; i < 33; i++) {
          hash = (hash * 1103515245 + 12345) & 0x7fffffff
          bytes.push((hash % 256).toString(16).padStart(2, "0"))
        }
        return bytes.join("")
      }

      const walletAddress = publicKey.toBase58()
      const spendingPublicKey = generateHex(`${walletAddress}_spending`)
      const viewingPublicKey = generateHex(`${walletAddress}_viewing`)

      const newKeys: StealthKeys = {
        metaAddress: `sip:solana:${spendingPublicKey}:${viewingPublicKey}`,
        spendingPublicKey,
        viewingPublicKey,
        createdAt: Date.now(),
      }

      // Store in localStorage (encrypted storage in production)
      const storageKey = getStorageKey(walletAddress)
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
