"use client"

import { useState, useCallback } from "react"
import { DeSciStats } from "@/components/desci/desci-stats"
import { ProjectList } from "@/components/desci/project-list"
import { FundForm } from "@/components/desci/fund-form"
import type { Project } from "@/lib/desci/types"

type View = "projects" | "fund"

export function DeSciPageClient() {
  const [view, setView] = useState<View>("projects")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const handleFund = useCallback((project: Project) => {
    setSelectedProject(project)
    setView("fund")
  }, [])

  const handleBack = useCallback(() => {
    setView("projects")
    setSelectedProject(null)
  }, [])

  // Fund view
  if (view === "fund" && selectedProject) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          &larr; Back to projects
        </button>
        <FundForm project={selectedProject} onFunded={handleBack} />
      </div>
    )
  }

  // Projects view
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Privacy DeSci</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Anonymous funding, private peer review, stealth contributions —
          science privacy powered by real cryptography.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10">
        <DeSciStats />
      </div>

      {/* Project List */}
      <ProjectList onFund={handleFund} />

      {/* Info Banner */}
      <div className="mt-10 p-4 rounded-xl bg-lime-900/20 border border-lime-800">
        <div className="flex gap-3">
          <span className="text-xl">{"\u{1F9EC}"}</span>
          <div>
            <p className="font-medium text-lime-100">Powered by BIO Protocol</p>
            <p className="text-sm text-lime-300 mt-1">
              Contributions use stealth addresses for unlinkable funding,
              Pedersen commitments for hidden amounts, and viewing keys for
              regulatory compliance. All cryptography is real — powered by
              @sip-protocol/sdk.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
