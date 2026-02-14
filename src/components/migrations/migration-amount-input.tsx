"use client"

import { useCallback } from "react"
import { cn } from "@/lib/utils"

interface MigrationAmountInputProps {
  value: string
  walletBalance: string | null
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function MigrationAmountInput({
  value,
  walletBalance,
  onValueChange,
  disabled,
}: MigrationAmountInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      if (input === "" || /^\d*\.?\d*$/.test(input)) {
        onValueChange(input)
      }
    },
    [onValueChange]
  )

  const handleMax = useCallback(() => {
    if (walletBalance) {
      onValueChange(walletBalance)
    }
  }, [walletBalance, onValueChange])

  return (
    <div>
      <label
        htmlFor="migration-amount"
        className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
      >
        Amount (SOL)
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          id="migration-amount"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="0.00"
          className={cn(
            "w-full px-4 py-4 text-3xl font-semibold bg-[var(--surface-secondary)] border rounded-xl transition-all",
            "focus:outline-none focus:ring-2 focus:ring-green-500/20",
            "border-[var(--border-default)] focus:border-green-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {walletBalance && (
            <button
              type="button"
              onClick={handleMax}
              disabled={disabled}
              className="px-2 py-1 text-xs font-medium text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
            >
              MAX
            </button>
          )}
          <span className="px-3 py-1.5 text-sm font-medium bg-[var(--surface-tertiary)] rounded-lg">
            SOL
          </span>
        </div>
      </div>
      {walletBalance && (
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
          Balance: {walletBalance} SOL
        </p>
      )}
    </div>
  )
}
