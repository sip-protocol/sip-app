"use client"

import { useState, useRef, useMemo } from "react"
import { useSettingsStore, SLIPPAGE_PRESETS } from "@/stores"
import {
  XIcon as CloseIcon,
  WarningIcon,
  PencilSimpleIcon as EditIcon,
} from "@phosphor-icons/react"

interface SlippageSettingsProps {
  /** Called when settings panel should close */
  onClose?: () => void
}

export function SlippageSettings({ onClose }: SlippageSettingsProps) {
  const { slippage, setSlippage } = useSettingsStore()
  const inputRef = useRef<HTMLInputElement>(null)

  // Check if current slippage matches a preset
  const isPreset = SLIPPAGE_PRESETS.includes(
    slippage as (typeof SLIPPAGE_PRESETS)[number]
  )

  // Initialize custom value from slippage if not a preset
  const initialCustom = useMemo(() => !isPreset, [isPreset])
  const initialValue = useMemo(
    () => (!isPreset ? slippage.toString() : ""),
    [isPreset, slippage]
  )

  const [customValue, setCustomValue] = useState(initialValue)
  const [isCustom, setIsCustom] = useState(initialCustom)

  const handlePresetClick = (preset: number) => {
    setSlippage(preset)
    setIsCustom(false)
    setCustomValue("")
  }

  const handleCustomChange = (value: string) => {
    setCustomValue(value)
    const parsed = parseFloat(value)
    if (!isNaN(parsed) && parsed > 0) {
      setSlippage(parsed)
    }
  }

  const handleCustomFocus = () => {
    setIsCustom(true)
    if (!customValue) {
      setCustomValue(slippage.toString())
    }
  }

  // Warning thresholds
  const isLowSlippage = slippage < 0.5
  const isHighSlippage = slippage > 5
  const isVeryHighSlippage = slippage > 10

  return (
    <div
      className="rounded-xl border border-gray-700 bg-gray-800/90 p-4 backdrop-blur-sm"
      role="region"
      aria-label="Slippage settings"
    >
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-200">
          Slippage Tolerance
        </h4>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
            aria-label="Close settings"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      {/* Preset buttons */}
      <div className="mb-3 flex gap-2">
        {SLIPPAGE_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePresetClick(preset)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              slippage === preset && !isCustom
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            aria-pressed={slippage === preset && !isCustom}
          >
            {preset}%
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="number"
            value={isCustom ? customValue : ""}
            onChange={(e) => handleCustomChange(e.target.value)}
            onFocus={handleCustomFocus}
            placeholder="Custom"
            min="0.01"
            max="50"
            step="0.1"
            className={`w-full rounded-lg bg-gray-700 px-3 py-2 pr-8 text-sm outline-none placeholder:text-gray-500 ${
              isCustom ? "text-white ring-1 ring-purple-500" : "text-gray-400"
            }`}
            aria-label="Custom slippage percentage"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            %
          </span>
        </div>
      </div>

      {/* Warnings */}
      {isLowSlippage && (
        <div className="mt-3 flex items-start gap-2 text-xs text-yellow-400">
          <WarningIcon size={16} className="mt-0.5 flex-shrink-0" />
          <span>
            Low slippage may cause transaction to fail in volatile markets
          </span>
        </div>
      )}

      {isHighSlippage && !isVeryHighSlippage && (
        <div className="mt-3 flex items-start gap-2 text-xs text-orange-400">
          <WarningIcon size={16} className="mt-0.5 flex-shrink-0" />
          <span>High slippage may result in an unfavorable rate</span>
        </div>
      )}

      {isVeryHighSlippage && (
        <div className="mt-3 flex items-start gap-2 text-xs text-red-400">
          <WarningIcon size={16} className="mt-0.5 flex-shrink-0" />
          <span>
            Very high slippage! You may receive significantly less than expected
          </span>
        </div>
      )}

      {/* Current setting display */}
      <div className="mt-3 border-t border-gray-700 pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Current tolerance</span>
          <span
            className={`font-medium ${
              isVeryHighSlippage
                ? "text-red-400"
                : isHighSlippage
                  ? "text-orange-400"
                  : isLowSlippage
                    ? "text-yellow-400"
                    : "text-green-400"
            }`}
          >
            {slippage}%
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Inline slippage display with edit button
 */
export function SlippageDisplay({ onClick }: { onClick: () => void }) {
  const { slippage } = useSettingsStore()
  const isHighSlippage = slippage > 5

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-white"
      aria-label={`Slippage tolerance: ${slippage}%. Click to edit`}
    >
      <span>Slippage: {slippage}%</span>
      <EditIcon size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
      {isHighSlippage && <WarningIcon size={12} className="text-orange-400" />}
    </button>
  )
}

