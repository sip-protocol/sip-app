"use client"

import { cn } from "@/lib/utils"
import type { BridgeStep } from "@/lib/bridge/types"

interface BridgeStatusProps {
  currentStep: BridgeStep
  error?: string | null
  className?: string
}

interface StepConfig {
  id: BridgeStep
  label: string
  description: string
  icon: string
}

const STEPS: StepConfig[] = [
  {
    id: "generating_stealth",
    label: "Generate Stealth Address",
    description: "Creating cryptographically unlinkable destination address",
    icon: "\uD83D\uDD10",
  },
  {
    id: "initiating_transfer",
    label: "Lock Tokens",
    description: "Locking tokens on source chain for cross-chain transfer",
    icon: "\uD83D\uDD12",
  },
  {
    id: "awaiting_attestation",
    label: "Guardian Attestation",
    description: "Wormhole guardians verifying and signing the message",
    icon: "\uD83C\uDF00",
  },
  {
    id: "relaying",
    label: "Relay to Destination",
    description: "Delivering tokens to stealth address on destination chain",
    icon: "\uD83C\uDF09",
  },
  {
    id: "complete",
    label: "Complete",
    description: "Tokens delivered to stealth address \u2014 fully private",
    icon: "\u2705",
  },
]

const STEP_INDEX: Record<string, number> = {}
STEPS.forEach((s, i) => {
  STEP_INDEX[s.id] = i
})

export function BridgeStatus({
  currentStep,
  error,
  className,
}: BridgeStatusProps) {
  const currentIndex =
    currentStep === "failed" ? -1 : (STEP_INDEX[currentStep] ?? -1)
  const isFailed = currentStep === "failed"
  const isComplete = currentStep === "complete"

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        isFailed && "bg-red-900/20 border-red-800",
        isComplete && "bg-sip-green-900/20 border-sip-green-800",
        !isFailed && !isComplete && "bg-cyan-900/10 border-cyan-800/50",
        className
      )}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <p
          className={cn(
            "font-semibold text-sm",
            isFailed && "text-red-300",
            isComplete && "text-sip-green-300",
            !isFailed && !isComplete && "text-cyan-300"
          )}
        >
          {isFailed
            ? "Bridge Transfer Failed"
            : isComplete
              ? "Bridge Transfer Complete!"
              : "Bridge Transfer in Progress"}
        </p>
      </div>

      {/* Error message */}
      {isFailed && error && (
        <div className="mx-4 mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Step Pipeline */}
      <div className="px-4 pb-4">
        <div className="space-y-1">
          {STEPS.map((step, index) => {
            const isStepComplete = !isFailed && index < currentIndex
            const isCurrent = !isFailed && index === currentIndex
            const isPending = isFailed || index > currentIndex

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-start gap-3 py-2 transition-opacity duration-300",
                  isPending && !isFailed && "opacity-30",
                  isFailed && "opacity-40"
                )}
              >
                {/* Step indicator */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all",
                      isStepComplete &&
                        "bg-sip-green-500/20 text-sip-green-400 ring-1 ring-sip-green-500/30",
                      isCurrent &&
                        "bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/40 animate-pulse",
                      isPending && "bg-gray-800 text-gray-500"
                    )}
                  >
                    {isStepComplete ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <span className="text-base">{step.icon}</span>
                    )}
                  </div>
                  {/* Connector line */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 h-4 mt-1 rounded-full transition-colors",
                        isStepComplete ? "bg-sip-green-500/40" : "bg-gray-700"
                      )}
                    />
                  )}
                </div>

                {/* Step content */}
                <div className="pt-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium leading-tight",
                      isStepComplete && "text-sip-green-300",
                      isCurrent && "text-white",
                      isPending && "text-gray-500"
                    )}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Active spinner */}
                {isCurrent && (
                  <LoadingSpinner className="w-4 h-4 text-cyan-400 ml-auto flex-shrink-0 mt-1" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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
