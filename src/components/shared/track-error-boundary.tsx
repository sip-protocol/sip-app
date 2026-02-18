"use client"

import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  trackName: string
  trackColor: string
  fallbackMode?: "simulation" | "error"
}

interface State {
  hasError: boolean
  error?: Error
}

export class TrackErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="p-6 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-default)]">
            <div className="text-4xl mb-4">&#x26A0;&#xFE0F;</div>
            <h2 className="text-lg font-semibold mb-2">
              {this.props.trackName} encountered an issue
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className={`px-4 py-2 rounded-lg text-sm font-medium bg-${this.props.trackColor}-500/20 text-${this.props.trackColor}-400 border border-${this.props.trackColor}-500/30 hover:bg-${this.props.trackColor}-500/30 transition-colors`}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
