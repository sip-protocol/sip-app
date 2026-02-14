"use client"

import { cn } from "@/lib/utils"

interface CarbonImpactDisplayProps {
  carbonOffsetKg: number
  gsolAmount: string
  className?: string
}

export function CarbonImpactDisplay({
  carbonOffsetKg,
  gsolAmount,
  className,
}: CarbonImpactDisplayProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-green-800/50 bg-green-900/10 p-4",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{"\uD83C\uDF3F"}</span>
        <p className="text-sm font-semibold text-green-300">Carbon Impact</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 rounded-lg bg-green-900/20">
          <p className="text-2xl font-bold text-green-400">{gsolAmount}</p>
          <p className="text-xs text-green-300/70 mt-1">gSOL Received</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-green-900/20">
          <p className="text-2xl font-bold text-green-400">
            {carbonOffsetKg.toFixed(4)}
          </p>
          <p className="text-xs text-green-300/70 mt-1">kg CO2/year offset</p>
        </div>
      </div>

      <p className="text-xs text-green-400/60 mt-3 text-center">
        gSOL staking yield is used to purchase verified carbon offsets via
        Sunrise Stake
      </p>
    </div>
  )
}
