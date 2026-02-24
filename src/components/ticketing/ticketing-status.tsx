"use client"

import type { ReactNode } from "react"
import {
  Ticket,
  MaskHappy,
  CreditCard,
  CheckCircle,
  Key,
  MagnifyingGlass,
  Check,
  SpinnerGap,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import type { TicketingStep } from "@/lib/ticketing/types"

interface TicketingStatusProps {
  currentStep: TicketingStep
  mode: "purchase" | "verify"
  error?: string | null
  className?: string
}

interface StepConfig {
  id: TicketingStep
  label: string
  description: string
  icon: ReactNode
}

const PURCHASE_STEPS: StepConfig[] = [
  {
    id: "selecting_event",
    label: "Select Event",
    description: "Validating event availability and ticket tier",
    icon: <Ticket size={16} weight="duotone" />,
  },
  {
    id: "generating_stealth_ticket",
    label: "Generate Stealth Ticket",
    description: "Creating one-time stealth address for private ticket",
    icon: <MaskHappy size={16} weight="duotone" />,
  },
  {
    id: "purchasing",
    label: "Purchase Ticket",
    description: "Committing ticket ID as Pedersen commitment",
    icon: <CreditCard size={16} weight="duotone" />,
  },
  {
    id: "purchased",
    label: "Purchased",
    description: "Stealth ticket issued — unlinkable to your wallet",
    icon: <CheckCircle size={16} weight="duotone" />,
  },
]

const VERIFY_STEPS: StepConfig[] = [
  {
    id: "generating_proof",
    label: "Generate Viewing Key Proof",
    description: "Creating attendance proof from viewing key",
    icon: <Key size={16} weight="duotone" />,
  },
  {
    id: "verifying_attendance",
    label: "Verify Attendance",
    description: "Organizer verifying ticket without revealing identity",
    icon: <MagnifyingGlass size={16} weight="duotone" />,
  },
  {
    id: "verified",
    label: "Verified",
    description: "Attendance confirmed — identity remains private",
    icon: <CheckCircle size={16} weight="duotone" />,
  },
]

const STEPS_MAP: Record<string, StepConfig[]> = {
  purchase: PURCHASE_STEPS,
  verify: VERIFY_STEPS,
}

const HEADERS: Record<
  string,
  { active: string; complete: string; failed: string }
> = {
  purchase: {
    active: "Purchasing...",
    complete: "Ticket Purchased!",
    failed: "Purchase Failed",
  },
  verify: {
    active: "Verifying...",
    complete: "Attendance Verified!",
    failed: "Verification Failed",
  },
}

function buildStepIndex(steps: StepConfig[]): Record<string, number> {
  const index: Record<string, number> = {}
  steps.forEach((s, i) => {
    index[s.id] = i
  })
  return index
}

export function TicketingStatus({
  currentStep,
  mode,
  error,
  className,
}: TicketingStatusProps) {
  const steps = STEPS_MAP[mode]
  const stepIndex = buildStepIndex(steps)
  const currentIndex =
    currentStep === "failed" ? -1 : (stepIndex[currentStep] ?? -1)
  const isFailed = currentStep === "failed"

  const finalSteps: TicketingStep[] = ["purchased", "verified"]
  const isComplete = finalSteps.includes(currentStep)

  const header = HEADERS[mode]

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        isFailed && "bg-red-900/20 border-red-800",
        isComplete && "bg-sip-green-900/20 border-sip-green-800",
        !isFailed && !isComplete && "bg-teal-900/10 border-teal-800/50",
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
            !isFailed && !isComplete && "text-teal-300"
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
                        "bg-teal-500/20 text-teal-300 ring-2 ring-teal-500/40 animate-pulse",
                      isPending && "bg-gray-800 text-gray-500"
                    )}
                  >
                    {isStepComplete ? (
                      <Check size={16} weight="bold" />
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
                            ? "bg-teal-500/40"
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
                  <SpinnerGap
                    size={16}
                    weight="bold"
                    className="animate-spin text-teal-400 ml-auto flex-shrink-0 mt-1"
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
