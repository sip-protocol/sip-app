"use client"

import { useMemo } from "react"
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { useWalletAccountChange } from "@/hooks/use-wallet-account-change"
import { useNetworkStore } from "@/stores/network"

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
  // Derive endpoint from network store (reacts to cluster/custom RPC changes)
  const rpcUrl = useNetworkStore((s) => s.rpcUrl)
  const endpoint = useMemo(() => rpcUrl, [rpcUrl])

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
