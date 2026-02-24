"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import {
  LockSimpleIcon,
  EyeIcon,
  LockSimpleOpenIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

type PrivacyOption = "shielded" | "compliant" | "transparent"

interface MusicPrivacyToggleProps {
  value: PrivacyOption
  onChange: (value: PrivacyOption) => void
  disabled?: boolean
}

const OPTIONS: {
  level: PrivacyOption
  label: string
  desc: string
  icon: ReactNode
  tooltip: string
}[] = [
  {
    level: "shielded",
    label: "Shielded",
    desc: "Hidden listening & identity",
    icon: <LockSimpleIcon size={18} weight="duotone" />,
    tooltip:
      "Your listening is a stealth address. No one can link your streams to your wallet. Full anonymity for your music taste.",
  },
  {
    level: "compliant",
    label: "Compliant",
    desc: "Verifiable stream",
    icon: <EyeIcon size={18} weight="duotone" />,
    tooltip:
      "Rights holders can verify your stream via viewing key. Your wallet identity stays hidden from other listeners and the public.",
  },
  {
    level: "transparent",
    label: "Transparent",
    desc: "Public stream",
    icon: <LockSimpleOpenIcon size={18} weight="duotone" />,
    tooltip:
      "Stream is publicly linked to your wallet. Anyone can see your listening history. No privacy applied.",
  },
]

export function MusicPrivacyToggle({
  value,
  onChange,
  disabled,
}: MusicPrivacyToggleProps) {
  const [hoveredLevel, setHoveredLevel] = useState<PrivacyOption | null>(null)

  const activeOption = OPTIONS.find((o) => o.level === value)
  const hoveredOption = hoveredLevel
    ? OPTIONS.find((o) => o.level === hoveredLevel)
    : null

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
              onMouseEnter={() => setHoveredLevel(option.level)}
              onMouseLeave={() => setHoveredLevel(null)}
              disabled={disabled}
              className={cn(
                "relative p-3 rounded-xl border text-left",
                "transition-all duration-200 ease-out",
                "hover:scale-[1.02] active:scale-[0.98]",
                isActive
                  ? "border-pink-500 bg-pink-900/20 shadow-lg shadow-pink-500/10"
                  : "border-[var(--border-default)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)]",
                disabled && "opacity-50 cursor-not-allowed hover:scale-100"
              )}
            >
              {isActive && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
                </span>
              )}

              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    "transition-transform duration-200",
                    isActive && "scale-110"
                  )}
                >
                  {option.icon}
                </span>
                <span
                  className={cn(
                    "font-medium text-sm transition-colors duration-200",
                    isActive && "text-pink-300"
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

      {/* Info panel */}
      <div
        className={cn(
          "mt-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)]",
          "transition-all duration-300 ease-out",
          hoveredOption || activeOption
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-1"
        )}
      >
        <div className="flex items-start gap-2">
          <span className="mt-0.5">
            {(hoveredOption || activeOption)?.icon}
          </span>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {(hoveredOption || activeOption)?.label}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 leading-relaxed">
              {(hoveredOption || activeOption)?.tooltip}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
