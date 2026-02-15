"use client"

import { cn } from "@/lib/utils"
import type { GamingStep } from "@/lib/gaming/types"

interface GamingStatusProps {
  currentStep: GamingStep
  mode: "play" | "claim"
  error?: string | null
  className?: string
}

interface StepConfig {
  id: GamingStep
  label: string
  description: string
  icon: string
}

const PLAY_STEPS: StepConfig[] = [
  {
    id: "committing_move",
    label: "Commit Move",
    description: "Hashing your move with Pedersen commitment",
    icon: "\u{1F94A}",
  },
  {
    id: "generating_commitment",
    label: "Generate Commitment",
    description: "Creating cryptographic commitment proof",
    icon: "\u{1F510}",
  },
  {
    id: "revealing",
    label: "Reveal Phase",
    description: "Both players reveal — commitment verified on-chain",
    icon: "\u{1F50D}",
  },
  {
    id: "resolved",
    label: "Resolved",
    description: "Game outcome determined — commitment proofs verified",
    icon: "\u2705",
  },
]

const CLAIM_STEPS: StepConfig[] = [
  {
    id: "generating_stealth",
    label: "Generate Stealth Address",
    description: "Creating one-time address for private reward claim",
    icon: "\u{1F3AD}",
  },
  {
    id: "claiming_reward",
    label: "Claiming Reward",
    description: "Sending reward to stealth address via MagicBlock",
    icon: "\u{1F3C6}",
  },
  {
    id: "claimed",
    label: "Claimed",
    description: "Reward claimed — stealth address funded privately",
    icon: "\u2705",
  },
]

const STEPS_MAP: Record<string, StepConfig[]> = {
  play: PLAY_STEPS,
  claim: CLAIM_STEPS,
}

const HEADERS: Record<
  string,
  { active: string; complete: string; failed: string }
> = {
  play: {
    active: "Playing...",
    complete: "Game Resolved!",
    failed: "Game Failed",
  },
  claim: {
    active: "Claiming Reward...",
    complete: "Reward Claimed!",
    failed: "Claim Failed",
  },
}

function buildStepIndex(steps: StepConfig[]): Record<string, number> {
  const index: Record<string, number> = {}
  steps.forEach((s, i) => {
    index[s.id] = i
  })
  return index
}

export function GamingStatus({
  currentStep,
  mode,
  error,
  className,
}: GamingStatusProps) {
  const steps = STEPS_MAP[mode]
  const stepIndex = buildStepIndex(steps)
  const currentIndex =
    currentStep === "failed" ? -1 : (stepIndex[currentStep] ?? -1)
  const isFailed = currentStep === "failed"

  const finalSteps: GamingStep[] = ["resolved", "claimed"]
  const isComplete = finalSteps.includes(currentStep)

  const header = HEADERS[mode]

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        isFailed && "bg-red-900/20 border-red-800",
        isComplete && "bg-sip-green-900/20 border-sip-green-800",
        !isFailed && !isComplete && "bg-orange-900/10 border-orange-800/50",
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
            !isFailed && !isComplete && "text-orange-300"
          )}
        >
          {isFailed
            ? header.failed
            : isComplete
              ? header.complete
              : header.active}
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
                        "bg-orange-500/20 text-orange-300 ring-2 ring-orange-500/40 animate-pulse",
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
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 h-4 mt-1 rounded-full transition-colors",
                        isStepComplete
                          ? "bg-sip-green-500/40"
                          : isCurrent
                            ? "bg-orange-500/40"
                            : "bg-gray-700"
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
                {isCurrent && !isComplete && (
                  <LoadingSpinner className="w-4 h-4 text-orange-400 ml-auto flex-shrink-0 mt-1" />
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
