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

/**
 * useViewingKeyStorage - Persist viewing keys in localStorage
 *
 * Stores viewing keys associated with transactions for later retrieval.
 * Keys are stored per-wallet address for isolation.
 *
 * @param walletAddress - The connected wallet address (for isolation)
 */
export function useViewingKeyStorage(walletAddress: string | null) {
  const [storage, setStorage] = useState<ViewingKeyStorage>({
    keys: [],
    lastUpdated: 0,
  })
  const [isLoaded, setIsLoaded] = useState(false)

  // Storage key includes wallet address for isolation
  const storageKey = walletAddress
    ? `${STORAGE_KEY}-${walletAddress.slice(0, 8)}`
    : null

  // Load from localStorage on mount
  useEffect(() => {
    if (!storageKey) {
      setStorage({ keys: [], lastUpdated: 0 })
      setIsLoaded(true)
      return
    }

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as ViewingKeyStorage
        setStorage(parsed)
      }
    } catch (err) {
      console.error("Failed to load viewing keys from storage:", err)
    }
    setIsLoaded(true)
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

      setStorage((prev) => ({
        keys: [...prev.keys, entry],
        lastUpdated: Date.now(),
      }))

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
