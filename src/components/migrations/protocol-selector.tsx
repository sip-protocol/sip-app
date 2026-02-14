"use client"

import { cn } from "@/lib/utils"
import {
  DEAD_PROTOCOLS,
  getSelectableProtocols,
} from "@/lib/migrations/constants"
import type { DeadProtocol } from "@/lib/migrations/types"

interface ProtocolSelectorProps {
  selected: DeadProtocol | null
  onSelect: (protocol: DeadProtocol | null) => void
  disabled?: boolean
}

const STATUS_BADGES: Record<
  DeadProtocol["status"],
  { label: string; color: string }
> = {
  dead: { label: "Dead", color: "text-red-400 bg-red-500/10" },
  rugged: { label: "Rugged", color: "text-red-400 bg-red-500/10" },
  deprecated: { label: "Deprecated", color: "text-amber-400 bg-amber-500/10" },
  inactive: { label: "Inactive", color: "text-gray-400 bg-gray-500/10" },
}

export function ProtocolSelector({
  selected,
  onSelect,
  disabled,
}: ProtocolSelectorProps) {
  const protocols = getSelectableProtocols()
  const manualEntry = DEAD_PROTOCOLS.find((p) => p.id === "manual")!

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
        Source Protocol
      </label>

      <div className="space-y-2">
        {protocols.map((protocol) => {
          const badge = STATUS_BADGES[protocol.status]
          const isSelected = selected?.id === protocol.id

          return (
            <button
              key={protocol.id}
              type="button"
              onClick={() => onSelect(isSelected ? null : protocol)}
              disabled={disabled}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                isSelected
                  ? "border-green-500 bg-green-900/20 ring-1 ring-green-500/30"
                  : "border-[var(--border-default)] bg-[var(--surface-secondary)] hover:border-green-500/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-tertiary)] flex items-center justify-center text-sm flex-shrink-0">
                {protocol.icon ? (
                  <span>{protocol.name.charAt(0)}</span>
                ) : (
                  <span>?</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {protocol.name}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] truncate">
                  {protocol.description}
                </p>
              </div>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
                  badge.color
                )}
              >
                {badge.label}
              </span>
            </button>
          )
        })}

        {/* Manual entry option */}
        <button
          type="button"
          onClick={() =>
            onSelect(selected?.id === "manual" ? null : manualEntry)
          }
          disabled={disabled}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all border-dashed",
            selected?.id === "manual"
              ? "border-green-500 bg-green-900/20 ring-1 ring-green-500/30"
              : "border-[var(--border-default)] bg-[var(--surface-secondary)] hover:border-green-500/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--surface-tertiary)] flex items-center justify-center text-sm flex-shrink-0">
            +
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Manual SOL Entry
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Enter SOL amount directly from your wallet
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}
