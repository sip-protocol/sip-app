"use client"

import { cn } from "@/lib/utils"
import { FundingTierBadge } from "./funding-tier-badge"
import { RESEARCH_CATEGORY_LABELS } from "@/lib/desci/constants"
import type { Project } from "@/lib/desci/types"

interface ProjectCardProps {
  project: Project
  onFund?: (project: Project) => void
  className?: string
}

export function ProjectCard({ project, onFund, className }: ProjectCardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-5",
        "hover:border-[var(--border-hover)] hover:shadow-md transition-all",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{project.icon}</span>
          <div>
            <h3 className="font-semibold text-sm">{project.title}</h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              {project.contributorCount} contributors
            </p>
          </div>
        </div>
        <FundingTierBadge tier={project.tier} />
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-tertiary)]">
          {RESEARCH_CATEGORY_LABELS[project.category]}
        </span>

        <button
          type="button"
          onClick={() => onFund?.(project)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            "bg-gradient-to-r from-lime-500 to-lime-700 text-white hover:from-lime-400 hover:to-lime-600"
          )}
        >
          Fund
        </button>
      </div>
    </div>
  )
}
