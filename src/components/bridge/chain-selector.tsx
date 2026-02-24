"use client"

import type { ReactNode } from "react"
import { useState, useCallback } from "react"
import {
  SunDim,
  Diamond,
  Hexagon,
  Globe,
  ArrowsLeftRight,
} from "@phosphor-icons/react"
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
            {getChainIcon(selected.id)}
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
              {getChainIcon(chain.id)}
              <span>{chain.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function getChainIcon(chain: BridgeChainId): ReactNode {
  const map: Record<BridgeChainId, ReactNode> = {
    solana: <SunDim size={20} weight="duotone" className="text-violet-400" />,
    ethereum: <Diamond size={20} weight="duotone" className="text-blue-400" />,
    base: <Hexagon size={20} weight="duotone" className="text-blue-500" />,
    arbitrum: (
      <Hexagon size={20} weight="duotone" className="text-orange-400" />
    ),
    optimism: <Hexagon size={20} weight="duotone" className="text-red-400" />,
  }
  return (
    map[chain] ?? (
      <Globe
        size={20}
        weight="duotone"
        className="text-[var(--text-secondary)]"
      />
    )
  )
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
          <ArrowsLeftRight
            size={16}
            weight="bold"
            className="text-[var(--text-secondary)]"
          />
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
