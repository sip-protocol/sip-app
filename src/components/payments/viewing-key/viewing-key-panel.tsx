"use client"

import { useState, useEffect, useCallback } from "react"
import type { ViewingKey } from "@sip-protocol/types"
import { generateViewingKey } from "@sip-protocol/sdk"
import { ViewingKeyDisplay } from "./viewing-key-display"
import { ViewingKeyQRCode } from "./viewing-key-qr-code"
import { AuditorShareModal } from "./auditor-share-modal"
import { cn } from "@/lib/utils"

interface AuditorShare {
  auditorId: string
  viewingKeyHash: string
  sharedAt: number
}

interface ViewingKeyPanelProps {
  /** Called when viewing key is generated/changed */
  onViewingKeyChange?: (viewingKey: ViewingKey) => void
  /** Initial viewing key (if restoring from storage) */
  initialViewingKey?: ViewingKey | null
  /** Whether the panel is disabled */
  disabled?: boolean
  /** Additional class names */
  className?: string
}

/**
 * ViewingKeyPanel - Main panel for viewing key management in compliant mode
 *
 * Auto-generates a viewing key and provides:
 * - Key display with copy functionality
 * - QR code for mobile sharing
 * - Auditor share modal
 * - Regenerate option
 */
export function ViewingKeyPanel({
  onViewingKeyChange,
  initialViewingKey,
  disabled = false,
  className,
}: ViewingKeyPanelProps) {
  const [viewingKey, setViewingKey] = useState<ViewingKey | null>(
    initialViewingKey ?? null
  )
  const [sharedWith, setSharedWith] = useState<AuditorShare[]>([])
  const [showQR, setShowQR] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Auto-generate viewing key on mount if not provided
  useEffect(() => {
    if (!viewingKey && !disabled) {
      handleGenerate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    try {
      // Generate with compliance path
      const key = generateViewingKey("m/0/compliance")
      setViewingKey(key)
      setSharedWith([]) // Reset shares on new key
      onViewingKeyChange?.(key)
    } catch (err) {
      console.error("Failed to generate viewing key:", err)
    } finally {
      setIsGenerating(false)
    }
  }, [onViewingKeyChange])

  const handleShare = useCallback(
    async (auditorId: string) => {
      if (!viewingKey) return

      const shareEntry: AuditorShare = {
        auditorId,
        viewingKeyHash: viewingKey.hash,
        sharedAt: Date.now(),
      }

      setSharedWith((prev) => [...prev, shareEntry])

      // In production: encrypt key with auditor's public key and store
    },
    [viewingKey]
  )

  const handleCopy = useCallback(() => {
    // Could track analytics or show toast here
  }, [])

  if (!viewingKey) {
    return (
      <div
        className={cn(
          "p-4 rounded-xl border border-dashed",
          "border-[var(--border-default)] bg-[var(--surface-secondary)]",
          className
        )}
      >
        <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-tertiary)]">
          {isGenerating ? (
            <>
              <LoadingSpinner className="w-4 h-4" />
              Generating viewing key...
            </>
          ) : (
            <>
              <KeyIcon className="w-4 h-4" />
              No viewing key generated
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "p-4 rounded-xl border",
        "border-sip-purple-500/30 bg-sip-purple-500/5",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sip-purple-500/20">
            <EyeIcon className="w-4 h-4 text-sip-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Viewing Key</h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              For compliance disclosure
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || disabled}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {isGenerating ? "Generating..." : "Regenerate"}
        </button>
      </div>

      {/* Key Display */}
      <ViewingKeyDisplay
        viewingKey={viewingKey}
        onCopy={handleCopy}
        className="mb-4"
      />

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowQR(true)}
          disabled={disabled}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
            "bg-[var(--surface-tertiary)] hover:bg-[var(--surface-secondary)]",
            "border border-[var(--border-default)] transition-colors"
          )}
        >
          <QRIcon className="w-3.5 h-3.5" />
          Show QR
        </button>

        <button
          type="button"
          onClick={() => setShowShareModal(true)}
          disabled={disabled}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
            "bg-[var(--surface-tertiary)] hover:bg-[var(--surface-secondary)]",
            "border border-[var(--border-default)] transition-colors"
          )}
        >
          <ShareIcon className="w-3.5 h-3.5" />
          Share with Auditor
          {sharedWith.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-sip-purple-500/20 text-sip-purple-400">
              {sharedWith.length}
            </span>
          )}
        </button>
      </div>

      {/* Shared indicator */}
      {sharedWith.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--border-default)]">
          <p className="text-xs text-[var(--text-tertiary)]">
            Shared with {sharedWith.length} auditor
            {sharedWith.length > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowQR(false)}
          />
          <div className="relative z-10 p-6 bg-[var(--surface-primary)] rounded-2xl border border-[var(--border-default)] shadow-2xl">
            <ViewingKeyQRCode
              viewingKey={viewingKey}
              onClose={() => setShowQR(false)}
            />
          </div>
        </div>
      )}

      {/* Share Modal */}
      <AuditorShareModal
        viewingKey={viewingKey}
        sharedWith={sharedWith}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleShare}
      />
    </div>
  )
}

// Icons
function EyeIcon({ className }: { className?: string }) {
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
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  )
}

function QRIcon({ className }: { className?: string }) {
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
        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
      />
    </svg>
  )
}

function ShareIcon({ className }: { className?: string }) {
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
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  )
}

function KeyIcon({ className }: { className?: string }) {
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
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      />
    </svg>
  )
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
