"use client"

import { cn } from "@/lib/utils"
import type { VoteStep } from "@/lib/governance/types"

interface VoteStatusProps {
  currentStep: VoteStep
  mode: "commit" | "reveal"
  error?: string | null
  className?: string
}

interface StepConfig {
  id: VoteStep
  label: string
  description: string
  icon: string
}

const COMMIT_STEPS: StepConfig[] = [
  {
    id: "encrypting",
    label: "Encrypt Vote",
    description: "Creating Pedersen commitment and encrypting with XChaCha20-Poly1305",
    icon: "🔐",
  },
  {
    id: "committing",
    label: "Submit Commitment",
    description: "Submitting encrypted vote commitment on-chain",
    icon: "📝",
  },
  {
    id: "committed",
    label: "Committed",
    description: "Vote committed — hidden until reveal period",
    icon: "✅",
  },
]

const REVEAL_STEPS: StepConfig[] = [
  {
    id: "revealing",
    label: "Decrypt Vote",
    description: "Revealing vote with encryption key — verifying Pedersen commitment",
    icon: "🔓",
  },
  {
    id: "revealed",
    label: "Revealed",
    description: "Vote revealed and verified on-chain",
    icon: "✅",
  },
]

function buildStepIndex(steps: StepConfig[]): Record<string, number> {
  const index: Record<string, number> = {}
  steps.forEach((s, i) => {
    index[s.id] = i
  })
  return index
}

export function VoteStatus({
  currentStep,
  mode,
  error,
  className,
}: VoteStatusProps) {
  const steps = mode === "commit" ? COMMIT_STEPS : REVEAL_STEPS
  const stepIndex = buildStepIndex(steps)
  const currentIndex =
    currentStep === "failed" ? -1 : (stepIndex[currentStep] ?? -1)
  const isFailed = currentStep === "failed"
  const isComplete =
    (mode === "commit" && currentStep === "committed") ||
    (mode === "reveal" && currentStep === "revealed")

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        isFailed && "bg-red-900/20 border-red-800",
        isComplete && "bg-sip-green-900/20 border-sip-green-800",
        !isFailed && !isComplete && "bg-sip-purple-900/10 border-sip-purple-800/50",
        className,
      )}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <p
          className={cn(
            "font-semibold text-sm",
            isFailed && "text-red-300",
            isComplete && "text-sip-green-300",
            !isFailed && !isComplete && "text-sip-purple-300",
          )}
        >
          {isFailed
            ? mode === "commit"
              ? "Vote Commit Failed"
              : "Vote Reveal Failed"
            : isComplete
              ? mode === "commit"
                ? "Vote Committed!"
                : "Vote Revealed!"
              : mode === "commit"
                ? "Committing Vote..."
                : "Revealing Vote..."}
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
          {steps.map((step, index) => {
            const isStepComplete = !isFailed && index < currentIndex
            const isCurrent = !isFailed && index === currentIndex
            const isPending = isFailed || index > currentIndex

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-start gap-3 py-2 transition-opacity duration-300",
                  isPending && !isFailed && "opacity-30",
                  isFailed && "opacity-40",
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
                        "bg-sip-purple-500/20 text-sip-purple-300 ring-2 ring-sip-purple-500/40 animate-pulse",
                      isPending && "bg-gray-800 text-gray-500",
                    )}
                  >
                    {isStepComplete ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <span className="text-base">{step.icon}</span>
                    )}
                  </div>
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 h-4 mt-1 rounded-full transition-colors",
                        isStepComplete
                          ? "bg-sip-green-500/40"
                          : isCurrent
                            ? "bg-sip-purple-500/40"
                            : "bg-gray-700",
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
                      isPending && "text-gray-500",
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
                {isCurrent && !isComplete && (
                  <LoadingSpinner className="w-4 h-4 text-sip-purple-400 ml-auto flex-shrink-0 mt-1" />
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
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
