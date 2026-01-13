"use client"

import { useState, useCallback, useMemo } from "react"
import type { ViewingKey, EncryptedTransaction } from "@sip-protocol/types"
import {
  generateViewingKey,
  deriveViewingKey,
  encryptForViewing,
  decryptWithViewing,
  type TransactionData,
} from "@sip-protocol/sdk"
import { useViewingKeyStorage } from "./use-viewing-key-storage"
import { useWalletStore } from "@/stores/wallet"

export interface ShareableKey {
  viewingKey: ViewingKey
  label?: string
  createdAt: number
  qrData: string
  /** Generate JSON export with fresh timestamp */
  getJsonExport: () => string
}

export interface DecryptionResult {
  success: boolean
  data?: TransactionData
  error?: string
}

interface UseViewingKeyDisclosureResult {
  // State
  keys: ShareableKey[]
  isLoading: boolean
  error: string | null

  // Actions
  generateKey: (label?: string, path?: string) => ViewingKey
  deriveKey: (
    masterKey: ViewingKey,
    childPath: string,
    label?: string
  ) => ViewingKey
  getShareableKey: (keyHash: string) => ShareableKey | undefined
  decryptTransaction: (
    viewingKey: ViewingKey,
    encrypted: EncryptedTransaction
  ) => DecryptionResult
  encryptTransaction: (
    viewingKey: ViewingKey,
    data: TransactionData
  ) => EncryptedTransaction
  removeKey: (keyHash: string) => void
  clearError: () => void
}

/**
 * useViewingKeyDisclosure - Hook for viewing key disclosure flow
 *
 * Provides functionality for:
 * - Generating and storing viewing keys
 * - Sharing viewing keys (QR code, JSON export)
 * - Decrypting transactions with viewing keys
 * - Encrypting transaction data
 */
export function useViewingKeyDisclosure(): UseViewingKeyDisclosureResult {
  const { address } = useWalletStore()
  const {
    keys: storedKeys,
    saveKey,
    removeKey: removeStoredKey,
  } = useViewingKeyStorage(address)

  const [isLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Convert stored keys to shareable format
  const keys = useMemo<ShareableKey[]>(() => {
    return storedKeys.map((stored) => ({
      viewingKey: stored.key,
      label: stored.label,
      createdAt: stored.createdAt,
      qrData: JSON.stringify({
        type: "sip-viewing-key",
        version: 1,
        key: stored.key.key,
        hash: stored.key.hash,
        path: stored.key.path,
      }),
      getJsonExport: () =>
        JSON.stringify(
          {
            type: "sip-viewing-key",
            version: 1,
            viewingKey: stored.key,
            label: stored.label,
            createdAt: stored.createdAt,
            exportedAt: Date.now(),
          },
          null,
          2
        ),
    }))
  }, [storedKeys])

  /**
   * Generate a new viewing key
   */
  const generateKey = useCallback(
    (label?: string, path: string = "m/0"): ViewingKey => {
      setError(null)

      try {
        const viewingKey = generateViewingKey(path)

        // Save to storage
        saveKey(viewingKey, { label })

        return viewingKey
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to generate key"
        setError(message)
        throw err
      }
    },
    [saveKey]
  )

  /**
   * Derive a child viewing key from a master key
   */
  const deriveKey = useCallback(
    (masterKey: ViewingKey, childPath: string, label?: string): ViewingKey => {
      setError(null)

      try {
        const derivedKey = deriveViewingKey(masterKey, childPath)

        // Save to storage
        saveKey(derivedKey, { label })

        return derivedKey
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to derive key"
        setError(message)
        throw err
      }
    },
    [saveKey]
  )

  /**
   * Get a shareable version of a key by hash
   */
  const getShareableKey = useCallback(
    (keyHash: string): ShareableKey | undefined => {
      return keys.find((k) => k.viewingKey.hash === keyHash)
    },
    [keys]
  )

  /**
   * Decrypt an encrypted transaction with a viewing key
   */
  const decryptTransaction = useCallback(
    (
      viewingKey: ViewingKey,
      encrypted: EncryptedTransaction
    ): DecryptionResult => {
      setError(null)

      try {
        const data = decryptWithViewing(encrypted, viewingKey)
        return { success: true, data }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Decryption failed - wrong key or tampered data"
        setError(message)
        return { success: false, error: message }
      }
    },
    []
  )

  /**
   * Encrypt transaction data with a viewing key
   */
  const encryptTransaction = useCallback(
    (viewingKey: ViewingKey, data: TransactionData): EncryptedTransaction => {
      setError(null)

      try {
        return encryptForViewing(data, viewingKey)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Encryption failed"
        setError(message)
        throw err
      }
    },
    []
  )

  /**
   * Remove a viewing key
   */
  const removeKey = useCallback(
    (keyHash: string) => {
      removeStoredKey(keyHash)
    },
    [removeStoredKey]
  )

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    keys,
    isLoading,
    error,
    generateKey,
    deriveKey,
    getShareableKey,
    decryptTransaction,
    encryptTransaction,
    removeKey,
    clearError,
  }
}

/**
 * Parse a viewing key from JSON string
 */
export function parseViewingKeyFromJson(json: string): ViewingKey | null {
  try {
    const parsed = JSON.parse(json)

    // Handle both export format and direct key format
    if (parsed.viewingKey) {
      return parsed.viewingKey as ViewingKey
    }

    if (parsed.key && parsed.hash && parsed.path) {
      return {
        key: parsed.key,
        hash: parsed.hash,
        path: parsed.path,
      } as ViewingKey
    }

    return null
  } catch {
    return null
  }
}

/**
 * Validate a viewing key structure
 */
export function isValidViewingKey(key: unknown): key is ViewingKey {
  if (!key || typeof key !== "object") return false

  const k = key as Record<string, unknown>

  return (
    typeof k.key === "string" &&
    k.key.startsWith("0x") &&
    k.key.length === 66 && // 0x + 64 hex chars
    typeof k.hash === "string" &&
    k.hash.startsWith("0x") &&
    typeof k.path === "string"
  )
}
