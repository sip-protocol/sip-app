"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

export type Token = "SOL" | "USDC"

interface AmountInputProps {
  value: string
  token: Token
  onValueChange: (value: string) => void
  onTokenChange: (token: Token) => void
  balance?: number
  disabled?: boolean
}

const TOKENS: { symbol: Token; name: string; decimals: number }[] = [
  { symbol: "SOL", name: "Solana", decimals: 9 },
  { symbol: "USDC", name: "USD Coin", decimals: 6 },
]

export function AmountInput({
  value,
  token,
  onValueChange,
  onTokenChange,
  balance,
  disabled,
}: AmountInputProps) {
  const [showTokenMenu, setShowTokenMenu] = useState(false)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      // Only allow valid decimal numbers
      if (input === "" || /^\d*\.?\d*$/.test(input)) {
        onValueChange(input)
      }
    },
    [onValueChange]
  )

  const handleMax = useCallback(() => {
    if (balance !== undefined) {
      onValueChange(balance.toString())
    }
  }, [balance, onValueChange])

  const handleTokenSelect = useCallback(
    (t: Token) => {
      onTokenChange(t)
      setShowTokenMenu(false)
    },
    [onTokenChange]
  )

  const numericValue = parseFloat(value) || 0
  const insufficientBalance = balance !== undefined && numericValue > balance

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-[var(--text-secondary)]"
        >
          Amount
        </label>
        {balance !== undefined && (
          <button
            type="button"
            onClick={handleMax}
            disabled={disabled}
            className="text-xs text-sip-purple-600 hover:text-sip-purple-700 font-medium disabled:opacity-50"
          >
            Max: {balance.toFixed(4)} {token}
          </button>
        )}
      </div>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          id="amount"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="0.00"
          className={cn(
            "w-full px-4 py-4 text-3xl font-semibold bg-[var(--surface-secondary)] border rounded-xl transition-all",
            "focus:outline-none focus:ring-2 focus:ring-sip-purple-500/20",
            insufficientBalance
              ? "border-red-500 focus:border-red-500"
              : "border-[var(--border-default)] focus:border-[var(--border-focus)]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <button
            type="button"
            onClick={() => setShowTokenMenu(!showTokenMenu)}
            disabled={disabled}
            className="px-3 py-1.5 text-sm font-medium bg-[var(--surface-tertiary)] hover:bg-[var(--border-default)] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <span>{token}</span>
            <span className="text-[var(--text-tertiary)]">▼</span>
          </button>
          {showTokenMenu && (
            <div className="absolute right-0 top-full mt-1 w-32 py-1 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-lg shadow-lg z-10">
              {TOKENS.map((t) => (
                <button
                  key={t.symbol}
                  type="button"
                  onClick={() => handleTokenSelect(t.symbol)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-[var(--surface-secondary)] transition-colors",
                    t.symbol === token && "text-sip-purple-600 font-medium"
                  )}
                >
                  {t.symbol}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {insufficientBalance && (
        <p className="mt-2 text-xs text-red-500">Insufficient balance</p>
      )}
    </div>
  )
}
