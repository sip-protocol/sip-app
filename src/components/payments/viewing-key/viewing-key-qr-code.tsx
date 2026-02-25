"use client"

import { useState, useCallback, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import type { ViewingKey } from "@sip-protocol/types"
import { WarningIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"

interface ViewingKeyQRCodeProps {
  viewingKey: ViewingKey
  size?: number
  className?: string
  onClose?: () => void
}

/**
 * ViewingKeyQRCode - QR code display for viewing key sharing
 *
 * Generates a scannable QR code containing the viewing key.
 * Includes download functionality for offline sharing.
 */
export function ViewingKeyQRCode({
  viewingKey,
  size = 200,
  className,
  onClose,
}: ViewingKeyQRCodeProps) {
  const [downloading, setDownloading] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const handleDownload = useCallback(async () => {
    if (!qrRef.current) return

    setDownloading(true)
    try {
      // Get the SVG element
      const svgElement = qrRef.current.querySelector("svg")
      if (!svgElement) return

      // Create canvas and draw SVG
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = size * 2
      canvas.height = size * 2

      // Convert SVG to image
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const img = new Image()
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      })
      const url = URL.createObjectURL(svgBlob)

      img.onload = () => {
        // White background
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw QR code
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Download
        const link = document.createElement("a")
        link.download = `sip-viewing-key-${viewingKey.hash.slice(0, 8)}.png`
        link.href = canvas.toDataURL("image/png")
        link.click()

        URL.revokeObjectURL(url)
        setDownloading(false)
      }

      img.onerror = () => {
        logger.error(
          "Failed to load QR code image for download",
          undefined,
          "ViewingKeyQRCode"
        )
        URL.revokeObjectURL(url)
        setDownloading(false)
      }

      img.src = url
    } catch (err) {
      logger.error("Failed to download QR code", err, "ViewingKeyQRCode")
      setDownloading(false)
    }
  }, [viewingKey.hash, size])

  // Encode viewing key as JSON for scanning
  const qrData = JSON.stringify({
    type: "sip-viewing-key",
    key: viewingKey.key,
    hash: viewingKey.hash,
    path: viewingKey.path,
  })

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* QR Code */}
      <div ref={qrRef} className="p-4 bg-white rounded-xl shadow-lg">
        <QRCodeSVG
          value={qrData}
          size={size}
          level="M"
          marginSize={0}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>

      {/* Instructions */}
      <p className="text-sm text-[var(--text-secondary)] text-center max-w-xs">
        Scan this QR code with your auditor&apos;s device to share the viewing
        key securely
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            "bg-[var(--surface-tertiary)] hover:bg-[var(--surface-secondary)]",
            "border border-[var(--border-default)]",
            downloading && "opacity-50 cursor-not-allowed"
          )}
        >
          {downloading ? "Downloading..." : "Download PNG"}
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Close
          </button>
        )}
      </div>

      {/* Security Note */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs max-w-xs">
        <WarningIcon size={16} className="flex-shrink-0 mt-0.5" />
        <span>
          This viewing key allows decryption of transaction details. Only share
          with trusted auditors.
        </span>
      </div>
    </div>
  )
}