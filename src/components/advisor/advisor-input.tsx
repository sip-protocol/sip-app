"use client"

import { useState, useCallback, KeyboardEvent } from "react"
import { cn } from "@/lib/utils"

interface AdvisorInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function AdvisorInput({
  onSend,
  disabled,
  placeholder = "Ask about privacy...",
}: AdvisorInputProps) {
  const [value, setValue] = useState("")

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (trimmed && !disabled) {
      onSend(trimmed)
      setValue("")
    }
  }, [value, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div className="flex items-end gap-2 p-3 border-t border-[var(--border-default)]">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className={cn(
          "flex-1 resize-none rounded-xl px-4 py-2.5 text-sm",
          "bg-[var(--surface-secondary)] border border-[var(--border-default)]",
          "focus:outline-none focus:ring-2 focus:ring-sip-purple-500/20 focus:border-[var(--border-focus)]",
          "placeholder:text-[var(--text-tertiary)]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{ maxHeight: "120px" }}
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className={cn(
          "p-2.5 rounded-xl transition-colors",
          "bg-sip-purple-600 text-white hover:bg-sip-purple-700",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-label="Send message"
      >
        <SendIcon className="w-5 h-5" />
      </button>
    </div>
  )
}

function SendIcon({ className }: { className?: string }) {
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
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  )
}
