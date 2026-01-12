"use client"

import { useState, useCallback, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import type { ViewingKey } from "@sip-protocol/types"
import { RecipientInput, validateRecipient } from "./recipient-input"
import { AmountInput, type Token } from "./amount-input"
import { PrivacyToggle, type PrivacyLevel } from "./privacy-toggle"
import { TransactionStatus } from "./transaction-status"
import { ViewingKeyPanel } from "./viewing-key"
import { useSendPayment } from "@/hooks/use-send-payment"
import { useViewingKeyStorage } from "@/hooks/use-viewing-key-storage"
import { cn } from "@/lib/utils"

export function SendShieldedForm() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()

  // Viewing key storage
  const { saveKey } = useViewingKeyStorage(publicKey?.toBase58() ?? null)

  // Form state
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [token, setToken] = useState<Token>("SOL")
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>("shielded")
  const [balance, setBalance] = useState<number | undefined>(undefined)
  const [viewingKey, setViewingKey] = useState<ViewingKey | null>(null)

  // Transaction state
  const { status, txHash, error, send, reset } = useSendPayment()

  // Fetch balance when connected
  useEffect(() => {
    let cancelled = false

    if (!publicKey || !connection) {
      // Reset balance when wallet disconnects (deferred to avoid sync setState in effect)
      queueMicrotask(() => {
        if (!cancelled) {
          setBalance(undefined)
        }
      })
      return () => {
        cancelled = true
      }
    }

    connection.getBalance(publicKey).then((bal) => {
      if (!cancelled) {
        setBalance(bal / LAMPORTS_PER_SOL)
      }
    })

    return () => {
      cancelled = true
    }
  }, [publicKey, connection])

  // Validation
  const isValidRecipient = recipient !== "" && validateRecipient(recipient)
  const numericAmount = parseFloat(amount) || 0
  const isValidAmount =
    numericAmount > 0 && (balance === undefined || numericAmount <= balance)
  const canSubmit =
    connected && isValidRecipient && isValidAmount && status !== "pending"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!canSubmit) return

      // For compliant mode, require viewing key
      if (privacyLevel === "compliant" && !viewingKey) {
        console.error("Viewing key required for compliant mode")
        return
      }

      const result = await send({
        recipient,
        amount,
        token,
        privacyLevel,
        viewingKey: privacyLevel === "compliant" ? viewingKey : undefined,
      })

      // Save viewing key with transaction hash if successful
      if (result?.txHash && viewingKey && privacyLevel === "compliant") {
        saveKey(viewingKey, { transactionHash: result.txHash })
      }
    },
    [
      canSubmit,
      send,
      recipient,
      amount,
      token,
      privacyLevel,
      viewingKey,
      saveKey,
    ]
  )

  const handleReset = useCallback(() => {
    reset()
    setRecipient("")
    setAmount("")
    setPrivacyLevel("shielded")
    setViewingKey(null)
  }, [reset])

  // Clear viewing key when switching away from compliant mode
  const handlePrivacyChange = useCallback((level: PrivacyLevel) => {
    setPrivacyLevel(level)
    if (level !== "compliant") {
      setViewingKey(null)
    }
  }, [])

  // If transaction confirmed, show success state
  if (status === "confirmed") {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8">
        <TransactionStatus status={status} txHash={txHash ?? undefined} />
        <button
          type="button"
          onClick={handleReset}
          className="w-full mt-6 py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Send Another Payment
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8"
    >
      {/* Amount Input */}
      <div className="mb-6">
        <AmountInput
          value={amount}
          token={token}
          onValueChange={setAmount}
          onTokenChange={setToken}
          balance={token === "SOL" ? balance : undefined}
          disabled={status === "pending"}
        />
      </div>

      {/* Recipient Input */}
      <div className="mb-6">
        <RecipientInput
          value={recipient}
          onChange={setRecipient}
          disabled={status === "pending"}
        />
      </div>

      {/* Privacy Level */}
      <div className="mb-6">
        <PrivacyToggle
          value={privacyLevel}
          onChange={handlePrivacyChange}
          disabled={status === "pending"}
        />
      </div>

      {/* Viewing Key Panel (shown for compliant mode) */}
      {privacyLevel === "compliant" && (
        <div className="mb-8">
          <ViewingKeyPanel
            onViewingKeyChange={setViewingKey}
            initialViewingKey={viewingKey}
            disabled={status === "pending"}
          />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!canSubmit}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-colors",
          canSubmit
            ? "bg-sip-purple-600 text-white hover:bg-sip-purple-700"
            : "bg-sip-purple-600/50 text-white/70 cursor-not-allowed"
        )}
      >
        {!connected
          ? "Connect Wallet to Send"
          : status === "pending"
            ? "Sending..."
            : "Send Shielded Payment"}
      </button>

      {/* Transaction Status */}
      <TransactionStatus
        status={status}
        txHash={txHash ?? undefined}
        error={error ?? undefined}
      />

      {/* Transaction Details */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Network Fee</span>
          <span className="text-[var(--text-primary)]">~0.00001 SOL</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-[var(--text-secondary)]">Privacy</span>
          <span className="text-sip-green-500 font-medium">
            {privacyLevel === "shielded" && "🔒 Fully Shielded"}
            {privacyLevel === "compliant" && "👁️ Compliant"}
            {privacyLevel === "transparent" && "🔓 Transparent"}
          </span>
        </div>
      </div>
    </form>
  )
}
