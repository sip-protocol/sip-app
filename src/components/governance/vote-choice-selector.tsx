"use client"

import { cn } from "@/lib/utils"

interface VoteChoiceSelectorProps {
  choices: string[]
  selected: number | null
  onSelect: (index: number) => void
  weight?: string | null
  disabled?: boolean
}

const CHOICE_ICONS: Record<string, string> = {
  For: "👍",
  Against: "👎",
  Abstain: "🤷",
}

export function VoteChoiceSelector({
  choices,
  selected,
  onSelect,
  weight,
  disabled,
}: VoteChoiceSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
        Your Vote
      </label>
      <div className="space-y-2">
        {choices.map((choice, index) => {
          const isSelected = selected === index
          const icon = CHOICE_ICONS[choice] ?? "📋"

          return (
            <button
              key={choice}
              type="button"
              onClick={() => onSelect(index)}
              disabled={disabled}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border text-left",
                "transition-all duration-200 ease-out",
                "hover:scale-[1.01] active:scale-[0.99]",
                isSelected
                  ? "border-sip-purple-500 bg-sip-purple-900/20 shadow-lg shadow-sip-purple-500/10"
                  : "border-[var(--border-default)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)]",
                disabled && "opacity-50 cursor-not-allowed hover:scale-100"
              )}
            >
              {/* Radio indicator */}
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  isSelected
                    ? "border-sip-purple-500"
                    : "border-[var(--border-default)]"
                )}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-sip-purple-500" />
                )}
              </div>

              {/* Choice label */}
              <span className="text-lg">{icon}</span>
              <span
                className={cn(
                  "font-medium text-sm flex-1",
                  isSelected && "text-sip-purple-300"
                )}
              >
                {choice}
              </span>

              {/* Weight display when selected */}
              {isSelected && weight && (
                <span className="text-xs text-[var(--text-tertiary)]">
                  {Number(weight).toLocaleString()} tokens
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
