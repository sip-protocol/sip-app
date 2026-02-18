"use client"

import { useState, useCallback, useMemo } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import type { Transaction } from "@solana/web3.js"

export type SolanaTxStatus =
  | "idle"
  | "building"
  | "signing"
  | "sending"
  | "confirming"
  | "confirmed"
  | "error"

export interface UseSolanaTransactionReturn {
  /** Current transaction lifecycle status */
  status: SolanaTxStatus
  /** Transaction signature after successful send */
  txSignature: string | null
  /** Solana Explorer URL auto-computed from signature + cluster */
  explorerUrl: string | null
  /** Error message if status is "error" */
  error: string | null
  /** Whether the wallet is connected and ready to sign */
  isWalletConnected: boolean
  /** Send a pre-built transaction through the wallet signing lifecycle */
  sendTransaction: (tx: Transaction) => Promise<string | null>
  /** Reset all state back to idle */
  reset: () => void
}

/**
 * Detects cluster from RPC endpoint URL.
 * Returns "devnet", "testnet", or "mainnet-beta".
 */
function detectCluster(rpcEndpoint: string): string {
  if (rpcEndpoint.includes("devnet")) return "devnet"
  if (rpcEndpoint.includes("testnet")) return "testnet"
  return "mainnet-beta"
}

/**
 * Builds a Solana Explorer URL for a transaction signature.
 */
function buildExplorerUrl(signature: string, cluster: string): string {
  const base = `https://explorer.solana.com/tx/${signature}`
  if (cluster === "mainnet-beta") return base
  return `${base}?cluster=${cluster}`
}

/**
 * Shared hook for sending Solana transactions via wallet adapter.
 *
 * Handles the full wallet signing lifecycle:
 * idle -> signing -> sending -> confirming -> confirmed (or error)
 *
 * Auto-computes explorer URL from the transaction signature and detected cluster.
 */
export function useSolanaTransaction(): UseSolanaTransactionReturn {
  const { connected, sendTransaction: walletSendTx } = useWallet()
  const { connection } = useConnection()

  const [status, setStatus] = useState<SolanaTxStatus>("idle")
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cluster = useMemo(
    () => detectCluster(connection.rpcEndpoint),
    [connection.rpcEndpoint]
  )

  const explorerUrl = useMemo(() => {
    if (!txSignature) return null
    return buildExplorerUrl(txSignature, cluster)
  }, [txSignature, cluster])

  const isWalletConnected = connected

  const reset = useCallback(() => {
    setStatus("idle")
    setTxSignature(null)
    setError(null)
  }, [])

  const sendTransaction = useCallback(
    async (tx: Transaction): Promise<string | null> => {
      if (!connected || !walletSendTx) {
        setError("Wallet not connected")
        setStatus("error")
        return null
      }

      try {
        setError(null)
        setTxSignature(null)

        // Signing phase — wallet adapter prompts user
        setStatus("signing")

        // Sending phase — broadcast to network
        setStatus("sending")
        const signature = await walletSendTx(tx, connection)

        // Confirming phase — wait for on-chain confirmation
        setStatus("confirming")
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash("confirmed")
        const confirmation = await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          "confirmed"
        )

        if (confirmation.value.err) {
          setError("Transaction failed on-chain")
          setStatus("error")
          return null
        }

        setTxSignature(signature)
        setStatus("confirmed")
        return signature
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Transaction failed"
        setError(message)
        setStatus("error")
        return null
      }
    },
    [connected, walletSendTx, connection]
  )

  return {
    status,
    txSignature,
    explorerUrl,
    error,
    isWalletConnected,
    sendTransaction,
    reset,
  }
}
