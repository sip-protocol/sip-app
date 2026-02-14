"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { BRIDGE_CHAINS } from "@/lib/bridge/constants"
import type { BridgeChainId } from "@/lib/bridge/types"
import type { ChainInfo } from "@/lib/bridge/constants"

interface ChainSelectorProps {
  sourceChain: BridgeChainId | null
  destChain: BridgeChainId | null
  availableDestChains: BridgeChainId[]
  onSourceChange: (chain: BridgeChainId) => void
  onDestChange: (chain: BridgeChainId) => void
  onSwap: () => void
  disabled?: boolean
}

const allChains = Object.values(BRIDGE_CHAINS)

function ChainDropdown({
  label,
  selected,
  options,
  onSelect,
  disabled,
}: {
  label: string
  selected: ChainInfo | null
  options: ChainInfo[]
  onSelect: (chain: BridgeChainId) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)

  const handleSelect = useCallback(
    (chain: BridgeChainId) => {
      onSelect(chain)
      setOpen(false)
    },
    [onSelect]
  )

  return (
    <div className="relative flex-1">
      <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
          "bg-[var(--surface-secondary)] border-[var(--border-default)]",
          "hover:border-[var(--border-hover)]",
          open && "border-cyan-500 ring-2 ring-cyan-500/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {selected ? (
          <>
            <span className="text-xl">{getChainEmoji(selected.id)}</span>
            <span className="font-medium text-[var(--text-primary)]">
              {selected.name}
            </span>
          </>
        ) : (
          <span className="text-[var(--text-tertiary)]">Select chain</span>
        )}
        <span className="ml-auto text-[var(--text-tertiary)]">
          {open ? "\u25B2" : "\u25BC"}
        </span>
      </button>

      {open && (
        <div className="absolute z-20 top-full mt-1 w-full py-1 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl shadow-lg">
          {options.map((chain) => (
            <button
              key={chain.id}
              type="button"
              onClick={() => handleSelect(chain.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                "hover:bg-[var(--surface-secondary)]",
                selected?.id === chain.id && "text-cyan-400 font-medium"
              )}
            >
              <span className="text-lg">{getChainEmoji(chain.id)}</span>
              <span>{chain.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function getChainEmoji(chain: BridgeChainId): string {
  const map: Record<BridgeChainId, string> = {
    solana: "\u{2600}\uFE0F",
    ethereum: "\u{1F48E}",
    base: "\u{1F535}",
    arbitrum: "\u{1F7E0}",
    optimism: "\u{1F534}",
  }
  return map[chain] ?? "\u{1F30D}"
}

export function ChainSelector({
  sourceChain,
  destChain,
  availableDestChains,
  onSourceChange,
  onDestChange,
  onSwap,
  disabled,
}: ChainSelectorProps) {
  const sourceInfo = sourceChain ? BRIDGE_CHAINS[sourceChain] : null
  const destInfo = destChain ? BRIDGE_CHAINS[destChain] : null

  const destOptions = availableDestChains
    .map((id) => BRIDGE_CHAINS[id])
    .filter(Boolean)

  return (
    <div>
      <div className="flex items-end gap-3">
        <ChainDropdown
          label="From"
          selected={sourceInfo}
          options={allChains}
          onSelect={onSourceChange}
          disabled={disabled}
        />

        {/* Swap button */}
        <button
          type="button"
          onClick={onSwap}
          disabled={disabled || !sourceChain || !destChain}
          className={cn(
            "flex-shrink-0 w-10 h-10 mb-0.5 rounded-full border transition-all",
            "flex items-center justify-center",
            "border-[var(--border-default)] bg-[var(--surface-secondary)]",
            "hover:border-cyan-500 hover:bg-cyan-900/20 hover:rotate-180",
            "active:scale-90",
            "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:rotate-0"
          )}
          style={{
            transition:
              "transform 0.3s ease, border-color 0.2s, background 0.2s",
          }}
          title="Swap chains"
        >
          <SwapIcon className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>

        <ChainDropdown
          label="To"
          selected={destInfo}
          options={destOptions.length > 0 ? destOptions : allChains}
          onSelect={onDestChange}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

function SwapIcon({ className }: { className?: string }) {
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
        d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
      />
    </svg>
  )
}
