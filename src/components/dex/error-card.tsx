"use client"

import { useCallback } from "react"
import {
  parseError,
  ERROR_MESSAGES,
  type ErrorCode,
  type ErrorAction,
  type ErrorInfo,
} from "@/lib/error-messages"

interface ErrorCardProps {
  /** The error to display - can be Error object or string */
  error: Error | string | unknown
  /** Override the parsed error code */
  errorCode?: ErrorCode
  /** Compact mode - smaller, less prominent */
  compact?: boolean
  /** Handler for action buttons */
  onAction?: (action: ErrorAction) => void
  /** Additional class names */
  className?: string
  /** Test ID for testing */
  testId?: string
}

/**
 * ErrorCard - Displays structured error messages with recovery actions
 */
export function ErrorCard({
  error,
  errorCode,
  compact = false,
  onAction,
  className = "",
  testId = "error-card",
}: ErrorCardProps) {
  const errorObj = typeof error === "string" ? new Error(error) : error
  const parsed = parseError(errorObj)

  const code = errorCode ?? parsed.code
  const info = errorCode ? ERROR_MESSAGES[errorCode] : parsed.info

  const handleAction = useCallback(
    (action: ErrorAction) => {
      if (onAction) {
        onAction(action)
      }
    },
    [onAction]
  )

  if (compact) {
    return (
      <div
        data-testid={testId}
        className={`flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 ${className}`}
      >
        <WarningIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-red-300">{info.title}</p>
          <p className="mt-0.5 text-xs text-red-400/80">{info.description}</p>
          {info.actions.length > 0 && onAction && (
            <div className="mt-2 flex flex-wrap gap-2">
              {info.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleAction(action.action)}
                  className="text-xs text-red-300 underline underline-offset-2 transition-colors hover:text-red-200"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      data-testid={testId}
      className={`rounded-xl border border-red-500/30 bg-red-500/10 p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20">
          <XCircleIcon className="h-5 w-5 text-red-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-red-300">{info.title}</h4>
          <p className="mt-0.5 text-sm text-red-400/80">{info.description}</p>
        </div>
      </div>

      {/* Likely causes */}
      {info.causes.length > 0 && (
        <div className="mt-3 rounded-lg bg-red-500/10 px-3 py-2">
          <p className="mb-1 text-xs font-medium text-red-400/60">
            Possible causes:
          </p>
          <ul className="space-y-0.5">
            {info.causes.map((cause, index) => (
              <li
                key={index}
                className="flex items-center gap-1.5 text-xs text-red-400/80"
              >
                <span className="h-1 w-1 flex-shrink-0 rounded-full bg-red-400/60" />
                {cause}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      {info.actions.length > 0 && onAction && (
        <div className="mt-4 flex flex-wrap gap-2">
          {info.actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleAction(action.action)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                index === 0
                  ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                  : "border border-red-500/30 text-red-300 hover:bg-red-500/10"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Original error (dev mode) */}
      {parsed.originalMessage &&
        parsed.originalMessage !== info.description &&
        process.env.NODE_ENV === "development" && (
          <details className="mt-3 text-xs">
            <summary className="cursor-pointer text-red-400/60 hover:text-red-400/80">
              Technical details
            </summary>
            <pre className="mt-1 overflow-x-auto rounded bg-red-950/30 p-2 text-red-400/70">
              {parsed.originalMessage}
            </pre>
          </details>
        )}
    </div>
  )
}

/**
 * QuoteErrorCard - Specialized error card for quote errors
 */
export function QuoteErrorCard({
  error,
  onRetry,
  onClear,
  className = "",
}: {
  error: string | Error | unknown
  onRetry?: () => void
  onClear?: () => void
  className?: string
}) {
  const handleAction = useCallback(
    (action: ErrorAction) => {
      switch (action) {
        case "retry":
        case "refresh":
          onRetry?.()
          break
        case "clear":
          onClear?.()
          break
      }
    },
    [onRetry, onClear]
  )

  return (
    <ErrorCard
      error={error}
      compact
      onAction={handleAction}
      className={className}
      testId="quote-error-card"
    />
  )
}

/**
 * SwapErrorCard - Specialized error card for swap transaction errors
 */
export function SwapErrorCard({
  error,
  onRetry,
  onReset,
  onConnect,
  onSwitchNetwork,
  className = "",
}: {
  error: string | Error | unknown
  onRetry?: () => void
  onReset?: () => void
  onConnect?: () => void
  onSwitchNetwork?: () => void
  className?: string
}) {
  const handleAction = useCallback(
    (action: ErrorAction) => {
      switch (action) {
        case "retry":
        case "refresh":
          onRetry?.()
          break
        case "clear":
          onReset?.()
          break
        case "connect":
          onConnect?.()
          break
        case "switch_network":
          onSwitchNetwork?.()
          break
      }
    },
    [onRetry, onReset, onConnect, onSwitchNetwork]
  )

  return (
    <ErrorCard
      error={error}
      onAction={handleAction}
      className={className}
      testId="swap-error-card"
    />
  )
}

// Icons

function WarningIcon({ className }: { className?: string }) {
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
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  )
}

function XCircleIcon({ className }: { className?: string }) {
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
        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}
