"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface BridgeAmountInputProps {
  value: string
  token: string | null
  tokens: string[]
  onValueChange: (value: string) => void
  onTokenChange: (token: string) => void
  disabled?: boolean
}

export function BridgeAmountInput({
  value,
  token,
  tokens,
  onValueChange,
  onTokenChange,
  disabled,
}: BridgeAmountInputProps) {
  const [showTokenMenu, setShowTokenMenu] = useState(false)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      if (input === "" || /^\d*\.?\d*$/.test(input)) {
        onValueChange(input)
      }
    },
    [onValueChange]
  )

  const handleTokenSelect = useCallback(
    (t: string) => {
      onTokenChange(t)
      setShowTokenMenu(false)
    },
    [onTokenChange]
  )

  return (
    <div>
      <label
        htmlFor="bridge-amount"
        className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
      >
        Amount
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          id="bridge-amount"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="0.00"
          className={cn(
            "w-full px-4 py-4 text-3xl font-semibold bg-[var(--surface-secondary)] border rounded-xl transition-all",
            "focus:outline-none focus:ring-2 focus:ring-cyan-500/20",
            "border-[var(--border-default)] focus:border-cyan-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <button
            type="button"
            onClick={() => setShowTokenMenu(!showTokenMenu)}
            disabled={disabled || tokens.length === 0}
            className="px-3 py-1.5 text-sm font-medium bg-[var(--surface-tertiary)] hover:bg-[var(--border-default)] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <span>{token ?? "Token"}</span>
            {tokens.length > 1 && (
              <span className="text-[var(--text-tertiary)]">
                {showTokenMenu ? "\u25B2" : "\u25BC"}
              </span>
            )}
          </button>
          {showTokenMenu && tokens.length > 1 && (
            <div className="absolute right-0 top-full mt-1 w-32 py-1 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-lg shadow-lg z-10">
              {tokens.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTokenSelect(t)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-[var(--surface-secondary)] transition-colors",
                    t === token && "text-cyan-400 font-medium"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
