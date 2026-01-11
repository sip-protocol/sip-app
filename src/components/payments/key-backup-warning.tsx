"use client"

import { cn } from "@/lib/utils"

interface KeyBackupWarningProps {
  onConfirm: () => void
  onCancel: () => void
  className?: string
}

export function KeyBackupWarning({
  onConfirm,
  onCancel,
  className,
}: KeyBackupWarningProps) {
  return (
    <div
      className={cn(
        "bg-amber-500/10 border border-amber-500/30 rounded-xl p-6",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <span className="text-xl">⚠️</span>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Important: Backup Your Keys
          </h3>

          <div className="text-sm text-[var(--text-secondary)] space-y-3">
            <p>
              You are about to generate a new stealth meta-address. This will
              create cryptographic keys that control access to funds sent to
              this address.
            </p>

            <div className="bg-[var(--surface-secondary)] rounded-lg p-4">
              <h4 className="font-medium text-[var(--text-primary)] mb-2">
                Before proceeding:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Keys are stored in your browser</li>
                <li>Clearing browser data will delete your keys</li>
                <li>Without keys, you cannot access received funds</li>
                <li>We recommend exporting and backing up your keys</li>
              </ul>
            </div>

            <p className="font-medium text-amber-400">
              There is no way to recover lost keys.
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-3 px-4 text-sm font-medium rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition-colors"
            >
              I Understand, Generate Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
