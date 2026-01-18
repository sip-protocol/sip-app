"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { truncate } from "@/lib/utils"

export type TxStatus = "idle" | "pending" | "confirmed" | "error"

// Progress step types
export type ProgressStep =
  | "deriving"
  | "encrypting"
  | "signing"
  | "broadcasting"
  | "confirming"
  | "complete"

interface TransactionStatusProps {
  status: TxStatus
  txHash?: string
  error?: string
  currentStep?: ProgressStep
  onRetry?: () => void
  derivationProgress?: {
    step: string
    percentage: number
  }
  className?: string
}

const PROGRESS_STEPS: {
  id: ProgressStep
  label: string
  description: string
}[] = [
  {
    id: "deriving",
    label: "Deriving Address",
    description: "Generating stealth address from recipient's meta-address",
  },
  {
    id: "encrypting",
    label: "Encrypting",
    description: "Encrypting transaction data with viewing key",
  },
  {
    id: "signing",
    label: "Signing",
    description: "Waiting for wallet signature",
  },
  {
    id: "broadcasting",
    label: "Broadcasting",
    description: "Sending transaction to the network",
  },
  {
    id: "confirming",
    label: "Confirming",
    description: "Waiting for network confirmation",
  },
  {
    id: "complete",
    label: "Complete",
    description: "Transaction confirmed on-chain",
  },
]

export function TransactionStatus({
  status,
  txHash,
  error,
  currentStep,
  onRetry,
  derivationProgress,
  className,
}: TransactionStatusProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const startTimeRef = useRef<number>(0)

  // Track elapsed time for pending transactions
  useEffect(() => {
    if (status !== "pending") {
      startTimeRef.current = 0
      return
    }

    // Reset start time when entering pending state
    startTimeRef.current = Date.now()

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [status])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (status === "idle") return null

  const currentStepIndex = currentStep
    ? PROGRESS_STEPS.findIndex((s) => s.id === currentStep)
    : -1

  return (
    <div
      className={cn(
        "mt-6 rounded-xl border overflow-hidden",
        status === "pending" && "bg-blue-900/20 border-blue-800",
        status === "confirmed" && "bg-sip-green-900/20 border-sip-green-800",
        status === "error" && "bg-red-900/20 border-red-800",
        className
      )}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "text-2xl",
                status === "pending" && "animate-pulse"
              )}
            >
              {status === "pending" && "⏳"}
              {status === "confirmed" && "✅"}
              {status === "error" && "❌"}
            </span>
            <div>
              <p
                className={cn(
                  "font-semibold text-lg",
                  status === "pending" && "text-blue-100",
                  status === "confirmed" && "text-sip-green-100",
                  status === "error" && "text-red-100"
                )}
              >
                {status === "pending" && "Transaction in Progress"}
                {status === "confirmed" && "Transaction Confirmed!"}
                {status === "error" && "Transaction Failed"}
              </p>
              {status === "pending" && (
                <p className="text-sm text-blue-300/70 mt-0.5">
                  Elapsed: {formatTime(elapsedTime)}
                </p>
              )}
            </div>
          </div>

          {/* Retry Button */}
          {status === "error" && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 text-sm font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
            >
              Retry
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && status === "error" && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-300">{error}</p>
            {error.includes("timeout") && (
              <p className="text-xs text-red-400/70 mt-1">
                The network may be congested. Try again with a higher priority
                fee.
              </p>
            )}
          </div>
        )}

        {/* Transaction Hash */}
        {txHash && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-[var(--text-tertiary)]">TX:</span>
            <a
              href={`https://solscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-sip-purple-400 hover:text-sip-purple-300 hover:underline transition-colors"
            >
              {truncate(txHash, 12, 8)}
            </a>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(txHash)
              }}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Copy TX hash"
            >
              <CopyIcon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            </button>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      {status === "pending" && currentStep && (
        <div className="border-t border-blue-800/50 p-4">
          <div className="space-y-3">
            {PROGRESS_STEPS.map((step, index) => {
              const isComplete = index < currentStepIndex
              const isCurrent = index === currentStepIndex
              const isPending = index > currentStepIndex

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-start gap-3 transition-opacity",
                    isPending && "opacity-40"
                  )}
                >
                  {/* Step Indicator */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0",
                      isComplete && "bg-sip-green-500 text-white",
                      isCurrent && "bg-blue-500 text-white animate-pulse",
                      isPending && "bg-gray-600 text-gray-400"
                    )}
                  >
                    {isComplete ? "✓" : index + 1}
                  </div>

                  {/* Step Details */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isComplete && "text-sip-green-300",
                        isCurrent && "text-blue-200",
                        isPending && "text-gray-400"
                      )}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-blue-300/70 mt-0.5">
                        {step.description}
                      </p>
                    )}
                  </div>

                  {/* Loading indicator for current step */}
                  {isCurrent && (
                    <LoadingSpinner className="w-4 h-4 text-blue-400" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Derivation Progress */}
      {derivationProgress &&
        status === "pending" &&
        currentStep === "deriving" && (
          <div className="border-t border-blue-800/50 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-200">{derivationProgress.step}</span>
                <span className="text-blue-300/70">
                  {derivationProgress.percentage}%
                </span>
              </div>
              <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-sip-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${derivationProgress.percentage}%` }}
                />
              </div>
              <p className="text-xs text-blue-300/50">
                Deriving stealth address using secp256k1 curve...
              </p>
            </div>
          </div>
        )}

      {/* Success Details */}
      {status === "confirmed" && (
        <div className="border-t border-sip-green-800/50 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-sip-green-300/70">Status</p>
              <p className="text-sip-green-100 font-medium">Confirmed</p>
            </div>
            <div>
              <p className="text-sip-green-300/70">Finality</p>
              <p className="text-sip-green-100 font-medium">Finalized</p>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={`https://solscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-4 text-sm font-medium text-center bg-sip-green-500/20 hover:bg-sip-green-500/30 text-sip-green-300 rounded-lg transition-colors"
            >
              View on Solscan
            </a>
            <button
              type="button"
              onClick={async () => {
                if (txHash) {
                  await navigator.clipboard.writeText(
                    `https://solscan.io/tx/${txHash}`
                  )
                }
              }}
              className="py-2 px-4 text-sm font-medium bg-sip-green-500/10 hover:bg-sip-green-500/20 text-sip-green-300 rounded-lg transition-colors"
            >
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Icons
function CopyIcon({ className }: { className?: string }) {
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
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
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
