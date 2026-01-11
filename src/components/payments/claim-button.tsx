"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface ClaimButtonProps {
  paymentId: string
  claimed: boolean
  onClaim: (paymentId: string) => Promise<void>
  className?: string
}

export function ClaimButton({
  paymentId,
  claimed,
  onClaim,
  className,
}: ClaimButtonProps) {
  const [isClaiming, setIsClaiming] = useState(false)

  const handleClaim = useCallback(async () => {
    setIsClaiming(true)
    try {
      await onClaim(paymentId)
    } finally {
      setIsClaiming(false)
    }
  }, [onClaim, paymentId])

  if (claimed) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg",
          "bg-sip-green-500/10 text-sip-green-400",
          className
        )}
      >
        <span>✓</span>
        Claimed
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClaim}
      disabled={isClaiming}
      className={cn(
        "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
        isClaiming
          ? "bg-sip-purple-600/50 text-white/70 cursor-not-allowed"
          : "bg-sip-purple-600 text-white hover:bg-sip-purple-700",
        className
      )}
    >
      {isClaiming ? "Claiming..." : "Claim"}
    </button>
  )
}
