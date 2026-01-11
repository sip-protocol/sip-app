"use client"

import { cn } from "@/lib/utils"

export type PrivacyLevel = "shielded" | "compliant" | "transparent"

interface PrivacyToggleProps {
  value: PrivacyLevel
  onChange: (value: PrivacyLevel) => void
  disabled?: boolean
}

const OPTIONS: {
  level: PrivacyLevel
  label: string
  desc: string
  icon: string
}[] = [
  { level: "shielded", label: "Shielded", desc: "Full privacy", icon: "🔒" },
  {
    level: "compliant",
    label: "Compliant",
    desc: "With viewing key",
    icon: "👁️",
  },
  {
    level: "transparent",
    label: "Transparent",
    desc: "No privacy",
    icon: "🔓",
  },
]

export function PrivacyToggle({
  value,
  onChange,
  disabled,
}: PrivacyToggleProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
        Privacy Level
      </label>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((option) => {
          const isActive = option.level === value
          return (
            <button
              key={option.level}
              type="button"
              onClick={() => onChange(option.level)}
              disabled={disabled}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                isActive
                  ? "border-sip-purple-500 bg-sip-purple-50 dark:bg-sip-purple-900/20"
                  : "border-[var(--border-default)] hover:border-[var(--border-hover)]",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{option.icon}</span>
                <span
                  className={cn(
                    "font-medium text-sm",
                    isActive && "text-sip-purple-700 dark:text-sip-purple-300"
                  )}
                >
                  {option.label}
                </span>
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">
                {option.desc}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
