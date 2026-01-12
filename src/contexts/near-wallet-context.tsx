"use client"

/**
 * NEAR Wallet Context
 *
 * Stub implementation for NEAR wallet integration.
 * This will be fully implemented when NEAR support is added.
 *
 * Currently provides the sendNearTransaction function required by
 * wallet-deposit.ts for cross-chain swaps via NEAR.
 */

import { createContext, useContext, useState, type ReactNode } from "react"

interface NearWalletContextValue {
  /** Whether NEAR wallet is connected */
  isConnected: boolean
  /** NEAR account ID (e.g., "user.near") */
  accountId: string | null
  /** Connect to NEAR wallet */
  connect: () => Promise<void>
  /** Disconnect from NEAR wallet */
  disconnect: () => void
}

const NearWalletContext = createContext<NearWalletContextValue | null>(null)

interface NearWalletProviderProps {
  children: ReactNode
}

/**
 * NEAR Wallet Provider
 *
 * Stub implementation - will integrate with NEAR wallet selector.
 */
export function NearWalletProvider({ children }: NearWalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [accountId, setAccountId] = useState<string | null>(null)

  const connect = async () => {
    // TODO: Integrate with @near-wallet-selector/core
    throw new Error("NEAR wallet connection not yet implemented")
  }

  const disconnect = () => {
    setIsConnected(false)
    setAccountId(null)
  }

  return (
    <NearWalletContext.Provider
      value={{ isConnected, accountId, connect, disconnect }}
    >
      {children}
    </NearWalletContext.Provider>
  )
}

/**
 * Hook to access NEAR wallet context
 */
export function useNearWallet(): NearWalletContextValue {
  const context = useContext(NearWalletContext)
  if (!context) {
    throw new Error("useNearWallet must be used within NearWalletProvider")
  }
  return context
}

/**
 * Send a NEAR transaction
 *
 * This function is called by wallet-deposit.ts for NEAR deposits.
 * Currently a stub that throws - will be implemented with wallet selector.
 *
 * @param receiverId - The recipient account ID
 * @param amount - Amount in yoctoNEAR
 * @returns Transaction hash
 */
export async function sendNearTransaction(
  receiverId: string,
  amount: string
): Promise<string> {
  // TODO: Implement with @near-wallet-selector/core
  // This will use the active wallet from the selector to send a transaction
  throw new Error(
    `NEAR transactions not yet implemented. ` +
      `Would send ${amount} yoctoNEAR to ${receiverId}`
  )
}
