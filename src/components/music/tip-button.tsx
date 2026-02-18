"use client"

import { useState } from "react"
import { useStealthTip } from "@/hooks/use-stealth-tip"
import { TransactionStatus } from "@/components/solana/transaction-status"

interface TipButtonProps {
  artistName: string
  disabled?: boolean
}

const TIP_AMOUNTS = [0.01, 0.05, 0.1]

export function TipButton({ artistName, disabled }: TipButtonProps) {
  const { sendTip, lastTip, tx } = useStealthTip()
  const [selectedAmount, setSelectedAmount] = useState(TIP_AMOUNTS[0])
  const [showForm, setShowForm] = useState(false)

  const handleTip = async () => {
    await sendTip(selectedAmount, artistName)
  }

  const isBusy = tx.status !== "idle" && tx.status !== "error" && tx.status !== "confirmed"

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        disabled={disabled}
        className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 disabled:opacity-50 transition-colors"
      >
        Tip Artist
      </button>
    )
  }

  return (
    <div className="mt-2 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
      <p className="text-xs text-zinc-400 mb-2">
        Anonymous tip for {artistName}
      </p>

      <div className="flex gap-2 mb-2">
        {TIP_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => setSelectedAmount(amount)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              selectedAmount === amount
                ? "bg-purple-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {amount} SOL
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleTip}
          disabled={isBusy}
          className="text-xs px-3 py-1.5 rounded bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 transition-colors"
        >
          {tx.isWalletConnected ? `Send ${selectedAmount} SOL` : "Connect Wallet"}
        </button>
        <button
          type="button"
          onClick={() => { setShowForm(false); tx.reset() }}
          className="text-xs px-2 py-1 text-zinc-500 hover:text-zinc-300"
        >
          Cancel
        </button>
      </div>

      <TransactionStatus
        status={tx.status}
        txSignature={tx.txSignature}
        explorerUrl={tx.explorerUrl}
        error={tx.error}
      />

      {lastTip && tx.status === "confirmed" && (
        <div className="mt-2 text-xs text-zinc-500">
          <p>Stealth address: <code>{lastTip.stealthAddress.slice(0, 12)}...</code></p>
          <p>Commitment: <code>{lastTip.commitment.slice(0, 12)}...</code></p>
        </div>
      )}
    </div>
  )
}
