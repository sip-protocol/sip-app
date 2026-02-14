"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
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
  const [scanResult, setScanResult] = useState<WalletScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scan = async () => {
    if (!publicKey) return

    try {
      setIsScanning(true)
      setError(null)
      const result = await scanWallet(publicKey.toBase58())
      setScanResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed")
    } finally {
      setIsScanning(false)
    }
  }

  useEffect(() => {
    if (publicKey) {
      scan()
    } else {
      setScanResult(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey?.toBase58()])

  return { scanResult, isScanning, error, rescan: scan }
}
