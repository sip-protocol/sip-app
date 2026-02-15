import type { Project, ResearchCategory, DeSciMode } from "./types"
import { SAMPLE_PROJECTS } from "./constants"

export class BioReader {
  private mode: DeSciMode

  constructor(mode: DeSciMode = "simulation") {
    this.mode = mode
  }

  async getProjects(): Promise<Project[]> {
    if (this.mode === "simulation") {
      return SAMPLE_PROJECTS
    }
    throw new Error(
      "BIO Protocol mode is not yet implemented. Use simulation mode."
    )
  }

  async getProject(id: string): Promise<Project | undefined> {
    if (this.mode === "simulation") {
      return SAMPLE_PROJECTS.find((p) => p.id === id)
    }
    throw new Error(
      "BIO Protocol mode is not yet implemented. Use simulation mode."
    )
  }

  async getContributions(): Promise<
    { address: string; projects: number; tier: string }[]
  > {
    if (this.mode === "simulation") {
      return [
        { address: "S1P...x7a", projects: 12, tier: "grant" },
        { address: "7Kz...m3b", projects: 9, tier: "research" },
        { address: "Fg2...p9c", projects: 7, tier: "seed" },
        { address: "Bx8...k1d", projects: 5, tier: "micro" },
        { address: "Qm5...r4e", projects: 3, tier: "micro" },
      ]
    }
    throw new Error(
      "BIO Protocol mode is not yet implemented. Use simulation mode."
    )
  }

  async getProjectsByCategory(category: ResearchCategory): Promise<Project[]> {
    if (this.mode === "simulation") {
      return SAMPLE_PROJECTS.filter((p) => p.category === category)
    }
    throw new Error(
      "BIO Protocol mode is not yet implemented. Use simulation mode."
    )
  }
}
