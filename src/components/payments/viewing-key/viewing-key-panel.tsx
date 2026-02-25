"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { ViewingKey } from "@sip-protocol/types"
import { generateViewingKey } from "@sip-protocol/sdk"
import {
  EyeIcon,
  QrCodeIcon,
  ShareNetworkIcon,
  KeyIcon,
  ShieldWarningIcon,
  InfoIcon,
} from "@phosphor-icons/react"
import { ViewingKeyDisplay } from "./viewing-key-display"
import { ViewingKeyQRCode } from "./viewing-key-qr-code"
import { AuditorShareModal } from "./auditor-share-modal"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"

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
  const [showRevocationInfo, setShowRevocationInfo] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Use ref to track if we've already generated on mount
  const hasGeneratedRef = useRef(false)
  const onViewingKeyChangeRef = useRef(onViewingKeyChange)
  onViewingKeyChangeRef.current = onViewingKeyChange

  // Auto-generate viewing key on mount if not provided
  useEffect(() => {
    if (hasGeneratedRef.current || disabled || initialViewingKey) return
    hasGeneratedRef.current = true

    const generate = async () => {
      setIsGenerating(true)
      try {
        const key = generateViewingKey("m/0/compliance")
        setViewingKey(key)
        onViewingKeyChangeRef.current?.(key)
      } catch (err) {
        logger.error("Failed to generate viewing key", err, "ViewingKeyPanel")
      } finally {
        setIsGenerating(false)
      }
    }
    generate()
  }, [disabled, initialViewingKey])

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    try {
      // Generate with compliance path
      const key = generateViewingKey("m/0/compliance")
      setViewingKey(key)
      setSharedWith([]) // Reset shares on new key
      onViewingKeyChange?.(key)
    } catch (err) {
      logger.error("Failed to generate viewing key", err, "ViewingKeyPanel")
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
              <KeyIcon size={16} />
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
            <EyeIcon size={16} className="text-sip-purple-400" />
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
          <QrCodeIcon size={14} />
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
          <ShareNetworkIcon size={14} />
          Share with Auditor
          {sharedWith.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-sip-purple-500/20 text-sip-purple-400">
              {sharedWith.length}
            </span>
          )}
        </button>
      </div>

      {/* Backup Reminder */}
      {!disabled && (
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-2">
            <ShieldWarningIcon size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-amber-500">
                Backup Your Viewing Key
              </p>
              <p className="text-xs text-amber-500/80 mt-1">
                Save this key securely. If lost, you won&apos;t be able to prove
                transaction details for compliance purposes.
              </p>
              <button
                type="button"
                onClick={() => setShowQR(true)}
                className="mt-2 text-xs text-amber-500 hover:text-amber-400 underline transition-colors"
              >
                Show QR code for backup →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared indicator with revocation warning */}
      {sharedWith.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--border-default)]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--text-tertiary)]">
              Shared with {sharedWith.length} auditor
              {sharedWith.length > 1 ? "s" : ""}
            </p>
            <button
              type="button"
              onClick={() => setShowRevocationInfo(true)}
              className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
              About revocation
            </button>
          </div>
        </div>
      )}

      {/* Revocation Info Modal */}
      {showRevocationInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRevocationInfo(false)}
          />
          <div className="relative z-10 max-w-sm mx-4 p-6 bg-[var(--surface-primary)] rounded-2xl border border-[var(--border-default)] shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <InfoIcon size={20} className="text-red-400" />
              </div>
              <h3 className="text-base font-semibold">Key Revocation</h3>
            </div>

            <div className="space-y-3 text-sm text-[var(--text-secondary)]">
              <p>
                <strong className="text-[var(--text-primary)]">
                  Viewing keys cannot be revoked.
                </strong>{" "}
                Once shared, an auditor can view your transaction details
                indefinitely.
              </p>
              <p>
                This is by design — compliance proofs must be verifiable even
                after the transaction. Revoking would defeat the purpose of
                auditable privacy.
              </p>
              <div className="p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-default)]">
                <p className="text-xs text-[var(--text-tertiary)]">
                  <strong>To limit access:</strong> Generate a new viewing key
                  for future transactions. Old keys only work for transactions
                  signed with that key.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRevocationInfo(false)}
              className="w-full mt-4 py-2.5 px-4 rounded-lg bg-[var(--surface-tertiary)] hover:bg-[var(--surface-secondary)] text-sm font-medium transition-colors"
            >
              Got it
            </button>
          </div>
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
