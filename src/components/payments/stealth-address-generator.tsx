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
  const [isScanning, setIsScanning] = useState(false)
  const [expandedNotification, setExpandedNotification] = useState<
    number | null
  >(null)

  // Mock notifications - in production, these come from scanning blockchain
  const [notifications] = useState<
    {
      amount: string
      token: string
      timestamp: number
      status: "pending" | "confirmed" | "failed"
      txHash?: string
    }[]
  >([])

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
          <div className="w-full space-y-4">
            {/* Key Details Panel */}
            <div className="p-4 rounded-xl bg-[var(--surface-secondary)] space-y-4">
              <KeyDetailRow
                label="Spending Public Key"
                value={keys.spendingPublicKey}
                description="Used to derive one-time spending addresses"
              />
              <KeyDetailRow
                label="Viewing Public Key"
                value={keys.viewingPublicKey}
                description="Used to scan for incoming payments"
              />
              <KeyDetailRow
                label="Meta Address"
                value={keys.metaAddress}
                description="Share this address to receive private payments"
              />
            </div>

            {/* Derivation Info */}
            <div className="p-3 rounded-lg bg-sip-purple-500/10 border border-sip-purple-500/20">
              <div className="flex items-start gap-2">
                <InfoCircleIcon className="w-4 h-4 text-sip-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-sip-purple-300">
                  Keys are derived from your wallet using BIP-340 Schnorr
                  signatures. Each incoming payment creates a unique stealth
                  address only you can spend from.
                </p>
              </div>
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

      {/* Payment Notifications */}
      <div className="mt-8 pt-6 border-t border-[var(--border-default)]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-[var(--text-primary)]">
            Incoming Payments
          </h4>
          <button
            type="button"
            onClick={() => setIsScanning(!isScanning)}
            disabled={isScanning}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              isScanning
                ? "bg-sip-purple-500/20 text-sip-purple-400"
                : "bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] text-[var(--text-secondary)]"
            )}
          >
            {isScanning ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-sip-purple-400 rounded-full animate-pulse" />
                Scanning...
              </span>
            ) : (
              "Scan for Payments"
            )}
          </button>
        </div>

        {/* Notification List */}
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notif, i) => (
              <PaymentNotification
                key={i}
                amount={notif.amount}
                token={notif.token}
                timestamp={notif.timestamp}
                status={notif.status}
                txHash={notif.txHash}
                onExpand={() =>
                  setExpandedNotification(expandedNotification === i ? null : i)
                }
                isExpanded={expandedNotification === i}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[var(--surface-secondary)] text-center">
            <p className="text-sm text-[var(--text-muted)]">
              {isScanning
                ? "Scanning blockchain for payments..."
                : "No payments detected yet. Scan to check for incoming payments."}
            </p>
          </div>
        )}
      </div>

      {/* Privacy Info */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
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

// Subcomponents
interface KeyDetailRowProps {
  label: string
  value: string
  description: string
}

function KeyDetailRow({ label, value, description }: KeyDetailRowProps) {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "text-xs transition-colors",
              copied
                ? "text-sip-green-400"
                : "text-sip-purple-400 hover:text-sip-purple-300"
            )}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
      <p
        className={cn(
          "font-mono text-xs text-[var(--text-primary)]",
          isExpanded ? "break-all" : "truncate"
        )}
      >
        {isExpanded ? value : `${value.slice(0, 24)}...${value.slice(-12)}`}
      </p>
      <p className="text-xs text-[var(--text-muted)]">{description}</p>
    </div>
  )
}

interface PaymentNotificationProps {
  amount: string
  token: string
  timestamp: number
  status: "pending" | "confirmed" | "failed"
  txHash?: string
  onExpand: () => void
  isExpanded: boolean
}

function PaymentNotification({
  amount,
  token,
  timestamp,
  status,
  txHash,
  onExpand,
  isExpanded,
}: PaymentNotificationProps) {
  const statusColors = {
    pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    confirmed: "text-sip-green-400 bg-sip-green-500/10 border-sip-green-500/20",
    failed: "text-red-400 bg-red-500/10 border-red-500/20",
  }

  const statusIcons = {
    pending: "⏳",
    confirmed: "✓",
    failed: "✗",
  }

  return (
    <div
      className={cn(
        "p-3 rounded-xl border transition-all cursor-pointer",
        statusColors[status],
        "hover:scale-[1.01]"
      )}
      onClick={onExpand}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">{statusIcons[status]}</span>
          <div>
            <p className="text-sm font-medium">
              +{amount} {token}
            </p>
            <p className="text-xs opacity-70">
              {new Date(timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        <span className="text-xs capitalize px-2 py-1 rounded-full bg-black/20">
          {status}
        </span>
      </div>

      {isExpanded && txHash && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <p className="text-xs opacity-70 mb-1">Transaction Hash</p>
          <p className="font-mono text-xs break-all">{txHash}</p>
          <a
            href={`https://solscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View on Solscan →
          </a>
        </div>
      )}
    </div>
  )
}

function InfoCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}
