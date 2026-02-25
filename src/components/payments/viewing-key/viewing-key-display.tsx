"use client"

import { useState, useCallback } from "react"
import type { ViewingKey } from "@sip-protocol/types"
import { CopyIcon, CheckIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { hexToBase58 } from "@/lib/stealth-browser-fallback"
import { logger } from "@/lib/logger"

interface ViewingKeyDisplayProps {
  viewingKey: ViewingKey
  className?: string
  showFullKey?: boolean
  onCopy?: () => void
}

/**
 * ViewingKeyDisplay - Shows a viewing key with copy functionality
 *
 * Displays truncated key hash with option to reveal full key.
 * Includes copy-to-clipboard with visual feedback.
 */
export function ViewingKeyDisplay({
  viewingKey,
  className,
  showFullKey = false,
  onCopy,
}: ViewingKeyDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(showFullKey)

  const handleCopy = useCallback(async () => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(viewingKey.key)
      } else {
        // Fallback for non-HTTPS or older browsers
        const textArea = document.createElement("textarea")
        textArea.value = viewingKey.key
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      logger.error("Failed to copy viewing key", err, "ViewingKeyDisplay")
    }
  }, [viewingKey.key, onCopy])

  const truncateKey = (key: string) => {
    if (key.length <= 16) return key
    return `${key.slice(0, 10)}...${key.slice(-8)}`
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Key Display */}
      <div className="flex items-center gap-2">
        <div
          role="button"
          tabIndex={0}
          className={cn(
            "flex-1 px-3 py-2 rounded-lg font-mono text-sm",
            "bg-[var(--surface-tertiary)] border border-[var(--border-default)]",
            "select-all cursor-pointer transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-sip-purple-500/50",
            isExpanded ? "break-all" : "truncate"
          )}
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setIsExpanded(!isExpanded)
            }
          }}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded ? "Collapse viewing key" : "Expand viewing key"
          }
          title={isExpanded ? "Click to collapse" : "Click to expand"}
        >
          {isExpanded ? viewingKey.key : truncateKey(viewingKey.key)}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "px-3 py-2 rounded-lg text-sm font-medium transition-all",
            "border border-[var(--border-default)]",
            copied
              ? "bg-sip-green-500/20 text-sip-green-500 border-sip-green-500/30"
              : "hover:bg-[var(--surface-tertiary)] text-[var(--text-secondary)]"
          )}
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <CheckIcon size={16} />
              Copied
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <CopyIcon size={16} />
              Copy
            </span>
          )}
        </button>
      </div>

      {/* Key Hash (for verification) */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
        <span>Hash:</span>
        <code className="font-mono">
          {truncateKey(
            viewingKey.hash.startsWith("0x")
              ? hexToBase58(viewingKey.hash)
              : viewingKey.hash
          )}
        </code>
      </div>

      {/* Derivation Path */}
      {viewingKey.path && (
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <span>Path:</span>
          <code className="font-mono">{viewingKey.path}</code>
        </div>
      )}
    </div>
  )
}
