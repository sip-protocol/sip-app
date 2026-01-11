"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useStealthKeys } from "@/hooks/use-stealth-keys"
import { KeyBackupWarning } from "./key-backup-warning"
import { AddressDisplay } from "./address-display"
import { QRCodeDisplay } from "./qr-code-display"
import { cn } from "@/lib/utils"

interface StealthAddressGeneratorProps {
  className?: string
}

export function StealthAddressGenerator({
  className,
}: StealthAddressGeneratorProps) {
  const { connected } = useWallet()
  const {
    keys,
    isLoading,
    error,
    generate,
    clear,
    hasBackedUp,
    confirmBackup,
  } = useStealthKeys()

  const [showWarning, setShowWarning] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleGenerateClick = () => {
    if (!hasBackedUp) {
      setShowWarning(true)
    } else {
      generate()
    }
  }

  const handleConfirmWarning = () => {
    confirmBackup()
    setShowWarning(false)
    generate()
  }

  const handleCancelWarning = () => {
    setShowWarning(false)
  }

  if (!connected) {
    return (
      <div
        className={cn(
          "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-8 text-center",
          className
        )}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sip-purple-500/20 flex items-center justify-center">
          <span className="text-3xl">🔒</span>
        </div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Connect Wallet to Receive
        </h2>
        <p className="text-[var(--text-secondary)]">
          Connect your Solana wallet to generate a stealth address for receiving
          private payments.
        </p>
      </div>
    )
  }

  if (showWarning) {
    return (
      <KeyBackupWarning
        onConfirm={handleConfirmWarning}
        onCancel={handleCancelWarning}
        className={className}
      />
    )
  }

  if (!keys) {
    return (
      <div
        className={cn(
          "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-8 text-center",
          className
        )}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sip-purple-500/20 flex items-center justify-center">
          <span className="text-3xl">✨</span>
        </div>

        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Generate Stealth Address
        </h2>

        <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
          Create a unique stealth meta-address that allows anyone to send you
          private payments. Each payment creates a new unlinkable address.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerateClick}
          disabled={isLoading}
          className={cn(
            "px-8 py-3 text-lg font-semibold rounded-xl transition-colors",
            isLoading
              ? "bg-sip-purple-600/50 text-white/70 cursor-not-allowed"
              : "bg-sip-purple-600 text-white hover:bg-sip-purple-700"
          )}
        >
          {isLoading ? "Generating..." : "Generate Address"}
        </button>
      </div>
    )
  }

  // Keys exist - show the address
  return (
    <div
      className={cn(
        "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8",
        className
      )}
    >
      <div className="flex flex-col items-center">
        {/* QR Code */}
        <div className="mb-6">
          <QRCodeDisplay value={keys.metaAddress} size={180} />
        </div>

        {/* Address Display */}
        <div className="w-full mb-6">
          <AddressDisplay
            address={keys.metaAddress}
            label="Your Stealth Address"
          />
        </div>

        {/* Created At */}
        <p className="text-xs text-[var(--text-muted)] mb-6">
          Generated on {new Date(keys.createdAt).toLocaleDateString()}
        </p>

        {/* Details Toggle */}
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-sip-purple-400 hover:text-sip-purple-300 mb-4"
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>

        {showDetails && (
          <div className="w-full p-4 rounded-xl bg-[var(--surface-secondary)] text-sm space-y-3">
            <div>
              <span className="text-[var(--text-muted)]">Spending Key:</span>
              <p className="font-mono text-[var(--text-secondary)] break-all">
                {keys.spendingPublicKey.slice(0, 32)}...
              </p>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Viewing Key:</span>
              <p className="font-mono text-[var(--text-secondary)] break-all">
                {keys.viewingPublicKey.slice(0, 32)}...
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={clear}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Clear Keys
          </button>
          <button
            type="button"
            onClick={generate}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            Regenerate
          </button>
        </div>
      </div>

      {/* Privacy Info */}
      <div className="mt-8 pt-6 border-t border-[var(--border-default)]">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sip-green-500/20 flex items-center justify-center">
            <span className="text-sip-green-400">✓</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[var(--text-primary)]">
              Full Privacy Enabled
            </h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Payments to this address are unlinkable. Each sender creates a
              unique one-time address that only you can spend from.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
