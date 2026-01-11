"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { truncate } from "@/lib/utils"

export function WalletButton() {
  const { publicKey, disconnect, connecting } = useWallet()
  const { setVisible } = useWalletModal()

  if (connecting) {
    return (
      <button
        type="button"
        disabled
        className="px-4 py-2 text-sm font-medium rounded-lg bg-sip-purple-600/50 text-white cursor-wait"
      >
        Connecting...
      </button>
    )
  }

  if (publicKey) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-[var(--text-secondary)]">
          {truncate(publicKey.toBase58(), 4, 4)}
        </span>
        <button
          type="button"
          onClick={() => disconnect()}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setVisible(true)}
      className="px-4 py-2 text-sm font-medium rounded-lg bg-sip-purple-600 text-white hover:bg-sip-purple-700 transition-colors"
    >
      Connect Wallet
    </button>
  )
}
