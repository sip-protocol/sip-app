"use client"

import { useState, useEffect } from "react"
import { ClaimButton } from "./claim-button"
import type { DetectedPayment } from "@/hooks/use-scan-payments"
import { cn } from "@/lib/utils"

interface PaymentListProps {
  payments: DetectedPayment[]
  onClaim: (paymentId: string) => Promise<void>
  className?: string
}

// Format relative date outside component to avoid impure function during render
function formatRelativeDate(timestamp: number, now: number): string {
  const diff = now - timestamp

  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`
  }
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`
  }
  const days = Math.floor(diff / 86400000)
  return `${days} day${days !== 1 ? "s" : ""} ago`
}

export function PaymentList({
  payments,
  onClaim,
  className,
}: PaymentListProps) {
  // Use state to store the current time, initialized once
  // The lazy initializer is called only on mount, avoiding the purity issue
  const [now, setNow] = useState(() => Date.now())

  // Update time when payments change (deferred to avoid sync setState in effect)
  useEffect(() => {
    queueMicrotask(() => setNow(Date.now()))
  }, [payments])

  if (payments.length === 0) {
    return (
      <div
        className={cn(
          "text-center py-12 bg-[var(--surface-secondary)] rounded-xl",
          className
        )}
      >
        <p className="text-4xl mb-3">📭</p>
        <p className="text-[var(--text-secondary)]">No payments found</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Scan again or share your stealth address to receive payments
        </p>
      </div>
    )
  }

  const formatAmount = (amount: number, token: string) => {
    return `${amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${token}`
  }

  return (
    <div className={cn("space-y-3", className)}>
      {payments.map((payment) => (
        <div
          key={payment.id}
          className={cn(
            "flex items-center justify-between p-4 rounded-xl",
            "bg-[var(--surface-secondary)] border border-[var(--border-default)]",
            payment.claimed && "opacity-60"
          )}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-lg font-semibold",
                  payment.token === "SOL"
                    ? "text-sip-purple-400"
                    : "text-sip-green-400"
                )}
              >
                {formatAmount(payment.amount, payment.token)}
              </span>
              {payment.claimed && (
                <span className="text-xs text-sip-green-400 bg-sip-green-500/10 px-2 py-0.5 rounded">
                  Claimed
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1 text-sm text-[var(--text-muted)]">
              <span className="font-mono truncate max-w-[150px]">
                {payment.txHash}
              </span>
              <span>•</span>
              <span>{formatRelativeDate(payment.timestamp, now)}</span>
            </div>
          </div>

          <div className="flex-shrink-0 ml-4">
            <ClaimButton
              paymentId={payment.id}
              claimed={payment.claimed}
              onClaim={onClaim}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
