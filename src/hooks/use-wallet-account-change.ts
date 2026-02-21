"use client"

import { useEffect, useRef } from "react"
import { useWallet } from "@solana/wallet-adapter-react"

/**
 * Detects Phantom account switches and triggers disconnect/reconnect.
 * Solana wallet adapter doesn't always detect mid-session account changes.
 */
export function useWalletAccountChange() {
  const { disconnect, select, wallet, publicKey } = useWallet()
  const prevKeyRef = useRef<string | null>(null)

  useEffect(() => {
    const phantom = (window as any)?.phantom?.solana

    if (!phantom || !wallet) return

    const handleAccountChanged = (newPublicKey: any) => {
      const newKey = newPublicKey?.toBase58?.() ?? null
      const prevKey = prevKeyRef.current

      // Account removed (locked) or changed
      if (!newKey) {
        disconnect()
      } else if (prevKey && newKey !== prevKey) {
        // Account switched — disconnect and reconnect
        disconnect().then(() => {
          // Re-select same wallet adapter to trigger reconnect
          if (wallet.adapter.name) {
            select(wallet.adapter.name)
          }
        })
      }

      prevKeyRef.current = newKey
    }

    // Track current key
    prevKeyRef.current = publicKey?.toBase58() ?? null

    phantom.on("accountChanged", handleAccountChanged)

    return () => {
      phantom.removeListener("accountChanged", handleAccountChanged)
    }
  }, [wallet, publicKey, disconnect, select])
}
