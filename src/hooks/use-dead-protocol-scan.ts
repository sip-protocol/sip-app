"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useDemoModeStore } from "@/stores/demo-mode"
import { scanWallet } from "@/lib/migrations/dead-protocol-scanner"
import type { WalletScanResult } from "@/lib/migrations/dead-protocol-scanner"

export interface UseDeadProtocolScanReturn {
  scanResult: WalletScanResult | null
  isScanning: boolean
  error: string | null
  rescan: () => void
}

export function useDeadProtocolScan(): UseDeadProtocolScanReturn {
  const { publicKey } = useWallet()
  const isDemoMode = useDemoModeStore((s) => s.isDemoMode)
  const [scanResult, setScanResult] = useState<WalletScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Bumped by rescan() to re-run the scan effect without duplicating its logic
  const [rescanNonce, setRescanNonce] = useState(0)

  // Auto-scan when a wallet connects; clear results when it disconnects. The
  // effect owns its async work with a cancel guard so a settled scan never
  // updates state after unmount or after the wallet changes.
  const address = publicKey?.toBase58() ?? null
  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!address) {
        setScanResult(null)
        return
      }

      setIsScanning(true)
      setError(null)
      try {
        const result = await scanWallet(address)
        if (!cancelled) setScanResult(result)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Scan failed")
        }
      } finally {
        if (!cancelled) setIsScanning(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [address, rescanNonce])

  // Manual rescan re-runs the scan effect via a nonce bump (single scan path)
  const rescan = useCallback(() => {
    if (!publicKey && !isDemoMode) return
    setRescanNonce((n) => n + 1)
  }, [publicKey, isDemoMode])

  return { scanResult, isScanning, error, rescan }
}
