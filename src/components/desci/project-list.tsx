"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ProjectCard } from "./project-card"
import { SAMPLE_PROJECTS } from "@/lib/desci/constants"
import type { Project, ResearchCategory } from "@/lib/desci/types"

type ProjectFilter = "all" | ResearchCategory

const FILTER_TABS: { value: ProjectFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "biotech", label: "Biotech" },
  { value: "neurotech", label: "Neurotech" },
  { value: "genomics", label: "Genomics" },
  { value: "climate", label: "Climate" },
  { value: "pharma", label: "Pharma" },
]

interface ProjectListProps {
  onFund?: (project: Project) => void
}

export function ProjectList({ onFund }: ProjectListProps) {
  const [filter, setFilter] = useState<ProjectFilter>("all")

  const projects =
    filter === "all"
      ? SAMPLE_PROJECTS
      : SAMPLE_PROJECTS.filter((p) => p.category === filter)

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              "flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              filter === tab.value
                ? "bg-lime-500/20 text-lime-300 border border-lime-500/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Project grid */}
      {projects.length === 0 ? (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
          <p className="text-4xl mb-4">{"\u{1F9EC}"}</p>
          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {filter === "all"
              ? "No projects available yet. Check back soon for new research projects."
              : `No ${filter} projects. Try a different filter.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onFund={onFund} />
          ))}
        </div>
      )}
    </div>
  )
}
