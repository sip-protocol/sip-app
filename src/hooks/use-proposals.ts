"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { RealmsReader } from "@/lib/governance/realms-reader"
import type { Proposal, ProposalStatus, DAO } from "@/lib/governance/types"

export type ProposalFilter = ProposalStatus | "all"

export interface UseProposalsReturn {
  proposals: Proposal[]
  isLoading: boolean
  filter: ProposalFilter
  setFilter: (filter: ProposalFilter) => void
  daos: DAO[]
  selectedDao: string | null
  setSelectedDao: (daoId: string | null) => void
}

export function useProposals(): UseProposalsReturn {
  const [allProposals, setAllProposals] = useState<Proposal[]>([])
  const [daos, setDaos] = useState<DAO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<ProposalFilter>("all")
  const [selectedDao, setSelectedDao] = useState<string | null>(null)

  useEffect(() => {
    const reader = new RealmsReader("simulation")

    async function load() {
      setIsLoading(true)
      try {
        const [proposalData, daoData] = await Promise.all([
          reader.getProposals(),
          reader.getDAOs(),
        ])
        setAllProposals(proposalData)
        setDaos(daoData)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const proposals = useMemo(() => {
    let filtered = allProposals
    if (filter !== "all") {
      filtered = filtered.filter((p) => p.status === filter)
    }
    if (selectedDao) {
      filtered = filtered.filter((p) => p.daoId === selectedDao)
    }
    return filtered
  }, [allProposals, filter, selectedDao])

  const handleSetFilter = useCallback((f: ProposalFilter) => {
    setFilter(f)
  }, [])

  const handleSetSelectedDao = useCallback((daoId: string | null) => {
    setSelectedDao(daoId)
  }, [])

  return {
    proposals,
    isLoading,
    filter,
    setFilter: handleSetFilter,
    daos,
    selectedDao,
    setSelectedDao: handleSetSelectedDao,
  }
}
