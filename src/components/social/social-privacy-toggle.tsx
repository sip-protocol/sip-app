"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

type PrivacyOption = "shielded" | "compliant" | "transparent"

interface SocialPrivacyToggleProps {
  value: PrivacyOption
  onChange: (value: PrivacyOption) => void
  disabled?: boolean
}

const OPTIONS: {
  level: PrivacyOption
  label: string
  desc: string
  icon: string
  tooltip: string
}[] = [
  {
    level: "shielded",
    label: "Shielded",
    desc: "Anonymous post",
    icon: "\u{1F512}",
    tooltip:
      "Only viewing key holders can see the author. Content is encrypted with XChaCha20-Poly1305 and identity is hidden behind a stealth address.",
  },
  {
    level: "compliant",
    label: "Compliant",
    desc: "Auditable author",
    icon: "\u{1F441}\uFE0F",
    tooltip:
      "Auditors can verify authorship via viewing key. Post content is public but your wallet identity stays hidden from casual observers.",
  },
  {
    level: "transparent",
    label: "Transparent",
    desc: "Public identity",
    icon: "\u{1F513}",
    tooltip:
      "Public post linked to your stealth identity. Anyone can see the author and content. No encryption applied.",
  },
]

export function SocialPrivacyToggle({
  value,
  onChange,
  disabled,
}: SocialPrivacyToggleProps) {
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
                disabled && "opacity-50 cursor-not-allowed hover:scale-100",
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
                    "text-lg transition-transform duration-200",
                    isActive && "scale-110",
                  )}
                >
                  {option.icon}
                </span>
                <span
                  className={cn(
                    "font-medium text-sm transition-colors duration-200",
                    isActive && "text-pink-300",
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
            : "opacity-0 -translate-y-1",
        )}
      >
        <div className="flex items-start gap-2">
          <span className="text-lg mt-0.5">
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
