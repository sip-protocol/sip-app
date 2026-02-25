"use client"

import { Component, type ReactNode } from "react"
import { motion } from "framer-motion"
import { WarningIcon } from "@phosphor-icons/react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallbackLabel?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorCard error={this.state.error} onRetry={this.handleRetry} />
    }
    return this.props.children
  }
}

function ErrorCard({ error, onRetry }: { error?: Error; onRetry: () => void }) {
  return (
    <motion.div
      className="max-w-lg mx-auto px-4 py-12"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-xl bg-gray-900 border border-red-500/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <WarningIcon size={20} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-red-400">
              Something went wrong
            </h2>
            <p className="text-xs text-gray-400">
              An error occurred while rendering this section
            </p>
          </div>
        </div>

        {error?.message && (
          <div className="mb-4 p-3 rounded-lg bg-gray-950 border border-gray-800">
            <code className="text-xs font-mono text-gray-300 break-all leading-relaxed">
              {error.message}
            </code>
          </div>
        )}

        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors"
        >
          Try Again
        </button>
      </div>
    </motion.div>
  )
}
