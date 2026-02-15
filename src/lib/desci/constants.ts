import type {
  Project,
  Contribution,
  DeSciStep,
  ResearchCategory,
  FundingTier,
} from "./types"

const now = Date.now()
const DAY = 24 * 3600_000

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: "project-longevity-dao",
    title: "Longevity DAO",
    description:
      "Decentralized longevity research funding. Stealth funding identity ensures contributors remain anonymous — no wallet-based donor profiling.",
    category: "biotech",
    tier: "grant",
    contributorCount: 2400,
    isActive: true,
    icon: "\u{1F9EC}",
  },
  {
    id: "project-neural-interface",
    title: "Neural Interface",
    description:
      "Brain-computer interface research. Pedersen commitments hide funding amounts — prove your contribution without revealing how much.",
    category: "neurotech",
    tier: "seed",
    contributorCount: 890,
    isActive: true,
    icon: "\u{1F9E0}",
  },
  {
    id: "project-gene-therapy",
    title: "Gene Therapy",
    description:
      "CRISPR gene therapy trials. Viewing key-gated compliance lets regulators verify funding sources without exposing donor identities.",
    category: "genomics",
    tier: "research",
    contributorCount: 1500,
    isActive: true,
    icon: "\u{1F9EA}",
  },
  {
    id: "project-climate-data",
    title: "Climate Data",
    description:
      "Open climate research data platform. Anonymous contribution proofs let scientists fund controversial research without career risk.",
    category: "climate",
    tier: "micro",
    contributorCount: 3100,
    isActive: true,
    icon: "\u{1F30D}",
  },
  {
    id: "project-drug-discovery",
    title: "Drug Discovery",
    description:
      "AI-accelerated drug discovery. Stealth transfers protect intellectual property — fund IP-sensitive research without competitive exposure.",
    category: "pharma",
    tier: "grant",
    contributorCount: 670,
    isActive: true,
    icon: "\u{1F48A}",
  },
]

export const SAMPLE_CONTRIBUTIONS: Contribution[] = [
  {
    projectId: "project-climate-data",
    tier: "micro",
    commitmentHash: "0x5d2a...e3b1",
    contributedAt: now - 3 * DAY,
  },
  {
    projectId: "project-longevity-dao",
    tier: "grant",
    commitmentHash: "0x8f1c...b4d7",
    contributedAt: now - 1 * DAY,
  },
]

export const SIMULATION_DELAYS: Record<DeSciStep, number> = {
  selecting_project: 1200,
  generating_stealth_funding: 1500,
  funding: 1800,
  funded: 0,
  generating_proof: 1500,
  submitting_review: 2000,
  reviewed: 0,
  failed: 0,
}

export const MAX_DESCI_HISTORY = 50

export const CATEGORY_COLORS: Record<
  ResearchCategory,
  { label: string; color: string; bg: string }
> = {
  biotech: {
    label: "Biotech",
    color: "text-lime-300",
    bg: "bg-lime-500/20 border-lime-500/30",
  },
  neurotech: {
    label: "Neurotech",
    color: "text-purple-300",
    bg: "bg-purple-500/20 border-purple-500/30",
  },
  genomics: {
    label: "Genomics",
    color: "text-cyan-300",
    bg: "bg-cyan-500/20 border-cyan-500/30",
  },
  climate: {
    label: "Climate",
    color: "text-green-300",
    bg: "bg-green-500/20 border-green-500/30",
  },
  pharma: {
    label: "Pharma",
    color: "text-orange-300",
    bg: "bg-orange-500/20 border-orange-500/30",
  },
}

export const FUNDING_TIER_COLORS: Record<
  FundingTier,
  { label: string; color: string; bg: string }
> = {
  micro: {
    label: "Micro",
    color: "text-gray-300",
    bg: "bg-gray-400/20 border-gray-400/30",
  },
  seed: {
    label: "Seed",
    color: "text-blue-300",
    bg: "bg-blue-500/20 border-blue-500/30",
  },
  research: {
    label: "Research",
    color: "text-amber-300",
    bg: "bg-amber-500/20 border-amber-500/30",
  },
  grant: {
    label: "Grant",
    color: "text-yellow-300",
    bg: "bg-yellow-500/20 border-yellow-500/30",
  },
}

export const RESEARCH_CATEGORY_LABELS: Record<ResearchCategory, string> = {
  biotech: "Biotech",
  neurotech: "Neurotech",
  genomics: "Genomics",
  climate: "Climate",
  pharma: "Pharma",
}

export function getProject(id: string): Project | undefined {
  return SAMPLE_PROJECTS.find((p) => p.id === id)
}

export function getProjectsByCategory(category: ResearchCategory): Project[] {
  return SAMPLE_PROJECTS.filter((p) => p.category === category)
}

export function getAllProjects(): Project[] {
  return SAMPLE_PROJECTS
}

export function getContribution(projectId: string): Contribution | undefined {
  return SAMPLE_CONTRIBUTIONS.find((c) => c.projectId === projectId)
}
