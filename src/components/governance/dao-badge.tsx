"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface DaoBadgeProps {
  name: string
  icon: string
  token?: string
  size?: "sm" | "md"
  className?: string
}

export function DaoBadge({
  name,
  icon,
  token,
  size = "md",
  className,
}: DaoBadgeProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full bg-[var(--surface-secondary)] flex items-center justify-center overflow-hidden flex-shrink-0",
          size === "sm" ? "w-6 h-6" : "w-8 h-8"
        )}
      >
        <Image
          src={icon}
          alt={name}
          width={size === "sm" ? 24 : 32}
          height={size === "sm" ? 24 : 32}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = "none"
            target.parentElement!.textContent = name[0]
          }}
        />
      </div>
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className={cn(
            "font-medium truncate",
            size === "sm" ? "text-xs" : "text-sm"
          )}
        >
          {name}
        </span>
        {token && (
          <span
            className={cn(
              "text-[var(--text-tertiary)] flex-shrink-0",
              size === "sm" ? "text-[10px]" : "text-xs"
            )}
          >
            {token}
          </span>
        )}
      </div>
    </div>
  )
}
