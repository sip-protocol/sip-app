"use client"

import { useState, useEffect, useCallback } from "react"
import type { ViewingKey } from "@sip-protocol/types"

const STORAGE_KEY = "sip-viewing-keys"

interface StoredViewingKey {
  key: ViewingKey
  transactionHash?: string
  createdAt: number
  label?: string
}

interface ViewingKeyStorage {
  keys: StoredViewingKey[]
  lastUpdated: number
}

const EMPTY_STORAGE: ViewingKeyStorage = { keys: [], lastUpdated: 0 }

// Validate storage data structure
function isValidStorage(data: unknown): data is ViewingKeyStorage {
  if (!data || typeof data !== "object") return false
  const obj = data as Record<string, unknown>
  if (!Array.isArray(obj.keys)) return false
  if (typeof obj.lastUpdated !== "number") return false
  // Validate each key entry
  return obj.keys.every((entry: unknown) => {
    if (!entry || typeof entry !== "object") return false
    const e = entry as Record<string, unknown>
    if (!e.key || typeof e.key !== "object") return false
    const key = e.key as Record<string, unknown>
    return (
      typeof key.key === "string" &&
      typeof key.hash === "string" &&
      typeof e.createdAt === "number"
    )
  })
}

// Load storage from localStorage synchronously
function loadStorageSync(key: string | null): ViewingKeyStorage {
  if (!key) return EMPTY_STORAGE
  if (typeof window === "undefined") return EMPTY_STORAGE

  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed: unknown = JSON.parse(stored)
      if (isValidStorage(parsed)) {
        return parsed
      }
      console.warn("Invalid viewing key storage format, resetting")
    }
  } catch (err) {
    console.error("Failed to load viewing keys from storage:", err)
  }
  return EMPTY_STORAGE
}

/**
 * useViewingKeyStorage - Persist viewing keys in localStorage
 *
 * Stores viewing keys associated with transactions for later retrieval.
 * Keys are stored per-wallet address for isolation.
 *
 * @param walletAddress - The connected wallet address (for isolation)
 */
export function useViewingKeyStorage(walletAddress: string | null) {
  // Storage key includes wallet address for isolation
  const storageKey = walletAddress
    ? `${STORAGE_KEY}-${walletAddress.slice(0, 8)}`
    : null

  // Initialize with sync load
  const [storage, setStorage] = useState<ViewingKeyStorage>(() =>
    loadStorageSync(storageKey)
  )
  const [isLoaded, setIsLoaded] = useState(true)

  // Reload when storageKey changes (wallet switch)
  // This is a valid use case: syncing React state with external localStorage
  useEffect(() => {
    let isMounted = true

    const loadStorage = () => {
      if (!storageKey) {
        if (isMounted) setIsLoaded(true)
        return
      }

      try {
        const stored = localStorage.getItem(storageKey)
        if (stored && isMounted) {
          const parsed: unknown = JSON.parse(stored)
          if (isValidStorage(parsed)) {
            setStorage(parsed)
          } else {
            console.warn("Invalid viewing key storage format, resetting")
          }
        }
      } catch (err) {
        console.error("Failed to load viewing keys from storage:", err)
      }
      if (isMounted) setIsLoaded(true)
    }

    // Defer state updates to next tick to avoid synchronous setState in effect
    queueMicrotask(loadStorage)

    return () => {
      isMounted = false
    }
  }, [storageKey])

  // Save to localStorage when storage changes
  useEffect(() => {
    if (!storageKey || !isLoaded) return

    try {
      localStorage.setItem(storageKey, JSON.stringify(storage))
    } catch (err) {
      console.error("Failed to save viewing keys to storage:", err)
    }
  }, [storageKey, storage, isLoaded])

  /**
   * Save a viewing key (optionally with transaction hash)
   */
  const saveKey = useCallback(
    (
      viewingKey: ViewingKey,
      options?: { transactionHash?: string; label?: string }
    ) => {
      const entry: StoredViewingKey = {
        key: viewingKey,
        transactionHash: options?.transactionHash,
        label: options?.label,
        createdAt: Date.now(),
      }

      setStorage((prev) => {
        // Deduplicate: remove existing key with same hash
        const filtered = prev.keys.filter((k) => k.key.hash !== viewingKey.hash)
        return {
          keys: [...filtered, entry],
          lastUpdated: Date.now(),
        }
      })

      return entry
    },
    []
  )

  /**
   * Get viewing key by transaction hash
   */
  const getKeyByTransaction = useCallback(
    (transactionHash: string): StoredViewingKey | undefined => {
      return storage.keys.find((k) => k.transactionHash === transactionHash)
    },
    [storage.keys]
  )

  /**
   * Get viewing key by hash
   */
  const getKeyByHash = useCallback(
    (keyHash: string): StoredViewingKey | undefined => {
      return storage.keys.find((k) => k.key.hash === keyHash)
    },
    [storage.keys]
  )

  /**
   * Remove a viewing key
   */
  const removeKey = useCallback((keyHash: string) => {
    setStorage((prev) => ({
      keys: prev.keys.filter((k) => k.key.hash !== keyHash),
      lastUpdated: Date.now(),
    }))
  }, [])

  /**
   * Clear all viewing keys
   */
  const clearAll = useCallback(() => {
    setStorage({ keys: [], lastUpdated: Date.now() })
  }, [])

  /**
   * Get recent keys (for display in history)
   */
  const getRecentKeys = useCallback(
    (limit: number = 10): StoredViewingKey[] => {
      return [...storage.keys]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit)
    },
    [storage.keys]
  )

  return {
    /** All stored viewing keys */
    keys: storage.keys,
    /** Whether storage has been loaded */
    isLoaded,
    /** Save a new viewing key */
    saveKey,
    /** Get key by transaction hash */
    getKeyByTransaction,
    /** Get key by key hash */
    getKeyByHash,
    /** Remove a viewing key */
    removeKey,
    /** Clear all viewing keys */
    clearAll,
    /** Get recent keys (sorted by date) */
    getRecentKeys,
  }
}
