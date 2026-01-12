"use client"

import { useState } from "react"

interface PrivacyScoreInputProps {
  onAnalyze: (address: string) => void
  isLoading: boolean
}

export function PrivacyScoreInput({
  onAnalyze,
  isLoading,
}: PrivacyScoreInputProps) {
  const [address, setAddress] = useState("")
  const [error, setError] = useState<string | null>(null)

  const validateSolanaAddress = (addr: string): boolean => {
    // Basic Solana address validation (base58, 32-44 chars)
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
    return base58Regex.test(addr)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedAddress = address.trim()

    if (!trimmedAddress) {
      setError("Please enter a wallet address")
      return
    }

    if (!validateSolanaAddress(trimmedAddress)) {
      setError("Invalid Solana address format")
      return
    }

    onAnalyze(trimmedAddress)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setAddress(text.trim())
      setError(null)
    } catch {
      setError("Failed to read clipboard")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value)
                setError(null)
              }}
              placeholder="Enter Solana wallet address..."
              className={`
                w-full px-4 py-3.5 rounded-xl
                bg-[var(--surface-secondary)]
                border ${error ? "border-red-500" : "border-[var(--border-default)]"}
                text-white placeholder-[var(--text-tertiary)]
                focus:outline-none focus:border-sip-purple-500 focus:ring-1 focus:ring-sip-purple-500
                transition-all duration-200
                font-mono text-sm
              `}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-white transition-colors"
              disabled={isLoading}
            >
              Paste
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading || !address.trim()}
            className={`
              px-6 py-3.5 rounded-xl font-medium
              ${
                isLoading || !address.trim()
                  ? "bg-[var(--surface-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed"
                  : "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90"
              }
              transition-all duration-200
              flex items-center justify-center gap-2 min-w-[140px]
            `}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Analyze
              </>
            )}
          </button>
        </div>
        {error && (
          <p className="absolute -bottom-6 left-0 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>

      {/* Example addresses */}
      <div className="mt-8 text-center">
        <p className="text-xs text-[var(--text-tertiary)] mb-2">
          Try an example:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            {
              label: "Active Trader",
              addr: "vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg",
            },
            {
              label: "DeFi User",
              addr: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
            },
          ].map((example) => (
            <button
              key={example.addr}
              type="button"
              onClick={() => {
                setAddress(example.addr)
                setError(null)
              }}
              className="px-3 py-1.5 rounded-lg text-xs bg-[var(--surface-tertiary)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-secondary)] transition-colors"
              disabled={isLoading}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  )
}
