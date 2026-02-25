"use client"

import type { ReactNode } from "react"
import {
  DnaIcon,
  MaskHappyIcon,
  CreditCardIcon,
  CheckCircleIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  CheckIcon as PhosphorCheckIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import type { DeSciStep } from "@/lib/desci/types"

interface DeSciStatusProps {
  currentStep: DeSciStep
  mode: "fund" | "review"
  error?: string | null
  className?: string
}

interface StepConfig {
  id: DeSciStep
  label: string
  description: string
  icon: ReactNode
}

const FUND_STEPS: StepConfig[] = [
  {
    id: "selecting_project",
    label: "Select Project",
    description: "Validating project availability and funding tier",
    icon: <DnaIcon size={16} weight="duotone" />,
  },
  {
    id: "generating_stealth_funding",
    label: "Generate Stealth Funding",
    description: "Creating one-time stealth address for anonymous contribution",
    icon: <MaskHappyIcon size={16} weight="duotone" />,
  },
  {
    id: "funding",
    label: "Fund Project",
    description: "Committing funding amount as Pedersen commitment",
    icon: <CreditCardIcon size={16} weight="duotone" />,
  },
  {
    id: "funded",
    label: "Funded",
    description: "Stealth contribution complete — unlinkable to your wallet",
    icon: <CheckCircleIcon size={16} weight="duotone" />,
  },
]

const REVIEW_STEPS: StepConfig[] = [
  {
    id: "generating_proof",
    label: "Generate Reviewer Proof",
    description: "Creating anonymous reviewer proof from stealth identity",
    icon: <KeyIcon size={16} weight="duotone" />,
  },
  {
    id: "submitting_review",
    label: "Submit Review",
    description: "Submitting anonymous peer review",
    icon: <MagnifyingGlassIcon size={16} weight="duotone" />,
  },
  {
    id: "reviewed",
    label: "Reviewed",
    description: "Review submitted — reviewer identity remains private",
    icon: <CheckCircleIcon size={16} weight="duotone" />,
  },
]

const STEPS_MAP: Record<string, StepConfig[]> = {
  fund: FUND_STEPS,
  review: REVIEW_STEPS,
}

const HEADERS: Record<
  string,
  { active: string; complete: string; failed: string }
> = {
  fund: {
    active: "Funding...",
    complete: "Project Funded!",
    failed: "Funding Failed",
  },
  review: {
    active: "Reviewing...",
    complete: "Review Submitted!",
    failed: "Review Failed",
  },
}

function buildStepIndex(steps: StepConfig[]): Record<string, number> {
  const index: Record<string, number> = {}
  steps.forEach((s, i) => {
    index[s.id] = i
  })
  return index
}

export function DeSciStatus({
  currentStep,
  mode,
  error,
  className,
}: DeSciStatusProps) {
  const steps = STEPS_MAP[mode]
  const stepIndex = buildStepIndex(steps)
  const currentIndex =
    currentStep === "failed" ? -1 : (stepIndex[currentStep] ?? -1)
  const isFailed = currentStep === "failed"

  const finalSteps: DeSciStep[] = ["funded", "reviewed"]
  const isComplete = finalSteps.includes(currentStep)

  const header = HEADERS[mode]

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        isFailed && "bg-red-900/20 border-red-800",
        isComplete && "bg-sip-green-900/20 border-sip-green-800",
        !isFailed && !isComplete && "bg-lime-900/10 border-lime-800/50",
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
            !isFailed && !isComplete && "text-lime-300"
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
                        "bg-lime-500/20 text-lime-300 ring-2 ring-lime-500/40 animate-pulse",
                      isPending && "bg-gray-800 text-gray-500"
                    )}
                  >
                    {isStepComplete ? (
                      <PhosphorCheckIcon size={16} weight="bold" />
                    ) : (
                      step.icon
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
                            ? "bg-lime-500/40"
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
                  <SpinnerGapIcon
                    size={16}
                    className="animate-spin text-lime-400 ml-auto flex-shrink-0 mt-1"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
