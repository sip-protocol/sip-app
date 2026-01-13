"use client"

import { QRCodeSVG } from "qrcode.react"

interface ViewingKeyQRProps {
  data: string
  size?: number
  label?: string
}

/**
 * ViewingKeyQR - QR code for sharing viewing keys
 *
 * Generates a scannable QR code containing the viewing key data
 * that can be shared with auditors or compliance officers.
 */
export function ViewingKeyQR({ data, size = 200, label }: ViewingKeyQRProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-4 bg-white rounded-xl">
        <QRCodeSVG
          value={data}
          size={size}
          level="M"
          marginSize={0}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>
      {label && (
        <p className="text-sm text-[var(--text-secondary)] text-center">
          {label}
        </p>
      )}
      <p className="text-xs text-[var(--text-tertiary)] text-center max-w-xs">
        Scan this QR code to import the viewing key into another device or share
        with an auditor.
      </p>
    </div>
  )
}
