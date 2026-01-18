"use client"

import { useState, useCallback, useEffect } from "react"
import type { ViewingKey } from "@sip-protocol/types"
import { cn } from "@/lib/utils"

interface AuditorShare {
  auditorId: string
  viewingKeyHash: string
  sharedAt: number
}

interface AuditorShareModalProps {
  viewingKey: ViewingKey
  sharedWith: AuditorShare[]
  isOpen: boolean
  onClose: () => void
  onShare: (auditorId: string) => Promise<void>
}

/**
 * AuditorShareModal - Modal for sharing viewing keys with auditors
 *
 * Allows users to:
 * - Enter auditor ID to share key with
 * - View list of auditors who have access
 * - Export viewing key as JSON for secure transfer
 */
export function AuditorShareModal({
  viewingKey,
  sharedWith,
  isOpen,
  onClose,
  onShare,
}: AuditorShareModalProps) {
  const [auditorId, setAuditorId] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showExportWarning, setShowExportWarning] = useState(false)

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  const handleShare = useCallback(async () => {
    if (!auditorId.trim()) {
      setError("Please enter an auditor ID")
      return
    }

    // Check if already shared
    if (sharedWith.some((s) => s.auditorId === auditorId.trim())) {
      setError("Already shared with this auditor")
      return
    }

    setIsSharing(true)
    setError(null)

    try {
      await onShare(auditorId.trim())
      setSuccess(true)
      setAuditorId("")
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to share")
    } finally {
      setIsSharing(false)
    }
  }, [auditorId, sharedWith, onShare])

  const handleExportJSON = useCallback(() => {
    const exportData = {
      type: "sip-viewing-key-export",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      viewingKey: {
        key: viewingKey.key,
        hash: viewingKey.hash,
        path: viewingKey.path,
      },
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = `sip-viewing-key-${viewingKey.hash.slice(0, 8)}.json`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }, [viewingKey])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
          <h2 className="text-lg font-semibold">Share Viewing Key</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--surface-tertiary)] transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Revocation Warning Banner */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <LockClosedIcon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-400">
              <p className="font-medium">Sharing is permanent</p>
              <p className="mt-1 text-red-400/80">
                Once shared, this viewing key cannot be revoked. The auditor
                will be able to view transaction details indefinitely.
              </p>
            </div>
          </div>

          {/* Share with auditor */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Share with Auditor
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={auditorId}
                onChange={(e) => setAuditorId(e.target.value)}
                placeholder="Enter auditor ID or name"
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg text-sm",
                  "bg-[var(--surface-tertiary)] border border-[var(--border-default)]",
                  "placeholder:text-[var(--text-tertiary)]",
                  "focus:outline-none focus:ring-2 focus:ring-sip-purple-500/50"
                )}
              />
              <button
                type="button"
                onClick={handleShare}
                disabled={isSharing || !auditorId.trim()}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "bg-sip-purple-600 text-white",
                  "hover:bg-sip-purple-700",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isSharing ? "Sharing..." : "Share"}
              </button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && (
              <p className="text-sm text-sip-green-500">
                Successfully shared with auditor
              </p>
            )}
          </div>

          {/* Shared with list */}
          {sharedWith.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Shared With ({sharedWith.length})
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {sharedWith.map((share) => (
                  <div
                    key={share.auditorId}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--surface-tertiary)]"
                  >
                    <div className="flex items-center gap-2">
                      <AuditorIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
                      <span className="text-sm">{share.auditorId}</span>
                    </div>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {new Date(share.sharedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export option */}
          <div className="pt-4 border-t border-[var(--border-default)]">
            {showExportWarning ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs">
                  <WarningIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    This file contains sensitive cryptographic material. Only
                    share with trusted parties through secure channels.
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExportWarning(false)}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--surface-tertiary)] hover:bg-[var(--surface-secondary)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleExportJSON()
                      setShowExportWarning(false)
                    }}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-sip-purple-600 text-white hover:bg-sip-purple-700 transition-colors"
                  >
                    Download Anyway
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowExportWarning(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-[var(--surface-tertiary)] hover:bg-[var(--surface-secondary)] transition-colors"
                >
                  <ExportIcon className="w-4 h-4" />
                  Export as JSON File
                </button>
                <p className="mt-2 text-xs text-[var(--text-tertiary)] text-center">
                  For secure offline transfer to compliance systems
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Icons
function CloseIcon({ className }: { className?: string }) {
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
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

function AuditorIcon({ className }: { className?: string }) {
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
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )
}

function ExportIcon({ className }: { className?: string }) {
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
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  )
}

function WarningIcon({ className }: { className?: string }) {
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
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  )
}

function LockClosedIcon({ className }: { className?: string }) {
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
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  )
}
