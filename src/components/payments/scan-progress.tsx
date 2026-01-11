"use client"

import { cn } from "@/lib/utils"

interface ScanProgressProps {
  progress: number
  isScanning: boolean
  className?: string
}

export function ScanProgress({
  progress,
  isScanning,
  className,
}: ScanProgressProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--text-secondary)]">
          {isScanning ? "Scanning blockchain..." : "Scan complete"}
        </span>
        <span className="text-[var(--text-primary)] font-medium">
          {progress}%
        </span>
      </div>

      <div className="h-2 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isScanning ? "bg-sip-purple-500" : "bg-sip-green-500"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {isScanning && (
        <p className="text-xs text-[var(--text-muted)] animate-pulse">
          Checking stealth addresses for incoming payments...
        </p>
      )}
    </div>
  )
}
