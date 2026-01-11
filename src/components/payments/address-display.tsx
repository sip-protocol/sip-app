"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface AddressDisplayProps {
  address: string
  label?: string
  className?: string
}

export function AddressDisplay({
  address,
  label,
  className,
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [address])

  // Format address for display: show prefix and truncate the rest
  const formatAddress = (addr: string) => {
    if (addr.length <= 40) return addr

    // For sip:solana:... format, show more context
    const parts = addr.split(":")
    if (parts.length >= 3 && parts[0] === "sip") {
      const chain = parts[1]
      const keys = parts.slice(2).join(":")
      const truncated =
        keys.length > 20 ? `${keys.slice(0, 12)}...${keys.slice(-8)}` : keys
      return `sip:${chain}:${truncated}`
    }

    return `${addr.slice(0, 16)}...${addr.slice(-8)}`
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}

      <div className="relative">
        <div
          className={cn(
            "w-full p-4 pr-24 rounded-xl font-mono text-sm break-all",
            "bg-[var(--surface-secondary)] border border-[var(--border-default)]",
            "text-[var(--text-primary)]"
          )}
        >
          <span className="text-sip-purple-400">sip:</span>
          <span className="text-sip-green-400">solana:</span>
          <span>{address.replace(/^sip:solana:/, "")}</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            copied
              ? "bg-sip-green-500 text-white"
              : "bg-sip-purple-600 text-white hover:bg-sip-purple-700"
          )}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        {formatAddress(address)}
      </p>
    </div>
  )
}
