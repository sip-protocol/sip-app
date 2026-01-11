"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

// SIP stealth address format: sip:<chain>:<spendingKey>:<viewingKey>
const SIP_ADDRESS_REGEX = /^sip:solana:[a-fA-F0-9]{64,66}:[a-fA-F0-9]{64,66}$/

interface RecipientInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function RecipientInput({
  value,
  onChange,
  disabled,
}: RecipientInputProps) {
  const [touched, setTouched] = useState(false)

  const isValid = value === "" || SIP_ADDRESS_REGEX.test(value)
  const showError = touched && value !== "" && !isValid

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value.trim())
    },
    [onChange]
  )

  const handleBlur = useCallback(() => {
    setTouched(true)
  }, [])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      onChange(text.trim())
      setTouched(true)
    } catch {
      // Clipboard access denied
    }
  }, [onChange])

  return (
    <div>
      <label
        htmlFor="recipient"
        className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
      >
        Recipient Stealth Address
      </label>
      <div className="relative">
        <input
          type="text"
          id="recipient"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="sip:solana:02abc...123:03def...456"
          className={cn(
            "w-full px-4 py-3 bg-[var(--surface-secondary)] border rounded-xl font-mono text-sm transition-all",
            "focus:outline-none focus:ring-2 focus:ring-sip-purple-500/20",
            showError
              ? "border-red-500 focus:border-red-500"
              : "border-[var(--border-default)] focus:border-[var(--border-focus)]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <button
          type="button"
          onClick={handlePaste}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] rounded-lg transition-colors disabled:opacity-50"
          title="Paste from clipboard"
        >
          📋
        </button>
      </div>
      {showError ? (
        <p className="mt-2 text-xs text-red-500">
          Invalid stealth address format. Expected: sip:solana:&lt;spend&gt;:&lt;view&gt;
        </p>
      ) : (
        <p className="mt-2 text-xs text-[var(--text-tertiary)]">
          Enter the recipient&apos;s SIP stealth meta-address
        </p>
      )}
    </div>
  )
}

export function validateRecipient(value: string): boolean {
  return SIP_ADDRESS_REGEX.test(value)
}
