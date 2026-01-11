"use client"

import { WalletProvider } from "./wallet-provider"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return <WalletProvider>{children}</WalletProvider>
}
