import type {
  DeSciActionRecord,
  DeSciStepChangeCallback,
  DeSciMode,
  FundProjectParams,
  ReviewProjectParams,
} from "./types"
import { SIMULATION_DELAYS, getProject } from "./constants"
import { generateDeSciStealthAddress } from "./stealth-desci"

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export interface DeSciServiceOptions {
  mode?: DeSciMode
  onStepChange?: DeSciStepChangeCallback
}

export class DeSciService {
  private mode: DeSciMode
  private onStepChange?: DeSciStepChangeCallback

  constructor(options: DeSciServiceOptions = {}) {
    this.mode = options.mode ?? "simulation"
    this.onStepChange = options.onStepChange
  }

  validate(
    type: "fund" | "review",
    params: FundProjectParams | ReviewProjectParams
  ): string | null {
    switch (type) {
      case "fund": {
        const p = params as FundProjectParams
        if (!p.projectId) {
          return "Project ID is required"
        }
        const project = getProject(p.projectId)
        if (!project) {
          return "Project not found"
        }
        if (!project.isActive) {
          return "Project is not active"
        }
        if (!p.tier) {
          return "Funding tier is required"
        }
        return null
      }
      case "review": {
        const p = params as ReviewProjectParams
        if (!p.projectId) {
          return "Project ID is required"
        }
        if (!p.tier) {
          return "Funding tier is required"
        }
        return null
      }
      default:
        return "Unknown action type"
    }
  }

  /**
   * Fund a project with stealth address.
   * selecting_project -> generating_stealth_funding -> funding -> funded
   */
  async fundProject(params: FundProjectParams): Promise<DeSciActionRecord> {
    const validationError = this.validate("fund", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const project = getProject(params.projectId)

    const record: DeSciActionRecord = {
      id: generateId("fund"),
      type: "fund",
      projectId: params.projectId,
      status: "selecting_project",
      privacyLevel: params.privacyLevel,
      projectTitle: project?.title,
      category: project?.category,
      tier: params.tier,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Selecting project
      record.status = "selecting_project"
      record.stepTimestamps.selecting_project = Date.now()
      this.onStepChange?.("selecting_project", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.selecting_project)
        )
      }

      // Step 2: Generating stealth funding (real SDK)
      record.status = "generating_stealth_funding"
      record.stepTimestamps.generating_stealth_funding = Date.now()
      this.onStepChange?.("generating_stealth_funding", { ...record })

      const stealth = await generateDeSciStealthAddress()
      record.stealthAddress = stealth.stealthAddress
      record.stealthMetaAddress = stealth.metaAddress

      // Generate a simulated commitment hash for funding ID
      const commitBytes = new Uint8Array(32)
      crypto.getRandomValues(commitBytes)
      record.commitmentHash = `0x${Array.from(commitBytes.slice(0, 4))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}...${Array.from(commitBytes.slice(28))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.generating_stealth_funding)
        )
      }

      // Step 3: Funding
      record.status = "funding"
      record.stepTimestamps.funding = Date.now()
      this.onStepChange?.("funding", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.funding))
      }

      // Step 4: Funded
      record.status = "funded"
      record.completedAt = Date.now()
      record.stepTimestamps.funded = Date.now()
      this.onStepChange?.("funded", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Funding failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }

  /**
   * Review a project anonymously.
   * generating_proof -> submitting_review -> reviewed
   */
  async reviewProject(params: ReviewProjectParams): Promise<DeSciActionRecord> {
    const validationError = this.validate("review", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const project = getProject(params.projectId)

    const record: DeSciActionRecord = {
      id: generateId("review"),
      type: "review",
      projectId: params.projectId,
      status: "generating_proof",
      privacyLevel: params.privacyLevel,
      projectTitle: project?.title,
      tier: params.tier,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Generate reviewer proof
      record.status = "generating_proof"
      record.stepTimestamps.generating_proof = Date.now()
      this.onStepChange?.("generating_proof", { ...record })

      const stealth = await generateDeSciStealthAddress()
      record.stealthAddress = stealth.stealthAddress
      record.stealthMetaAddress = stealth.metaAddress

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.generating_proof)
        )
      }

      // Step 2: Submitting review
      record.status = "submitting_review"
      record.stepTimestamps.submitting_review = Date.now()
      this.onStepChange?.("submitting_review", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.submitting_review)
        )
      }

      // Step 3: Reviewed
      record.reviewVerified = true
      record.status = "reviewed"
      record.completedAt = Date.now()
      record.stepTimestamps.reviewed = Date.now()
      this.onStepChange?.("reviewed", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Review failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }
}
