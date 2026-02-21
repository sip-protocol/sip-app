"use client"

import { useMemo } from "react"
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl } from "@solana/web3.js"
import { useWalletAccountChange } from "@/hooks/use-wallet-account-change"

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css"

function WalletAccountChangeListener() {
  useWalletAccountChange()
  return null
}

interface WalletProviderProps {
  children: React.ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  // Use mainnet-beta by default, override with NEXT_PUBLIC_RPC_URL
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl("mainnet-beta"),
    []
  )

  const wallets = useMemo(() => [], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletAccountChangeListener />
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}
