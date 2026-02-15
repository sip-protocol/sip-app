import type {
  MetaverseActionRecord,
  MetaverseStepChangeCallback,
  MetaverseMode,
  ExploreWorldParams,
  TeleportParams,
} from "./types"
import { SIMULATION_DELAYS, getWorld } from "./constants"
import { generateMetaverseStealthAddress } from "./stealth-metaverse"

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export interface MetaverseServiceOptions {
  mode?: MetaverseMode
  onStepChange?: MetaverseStepChangeCallback
}

export class MetaverseService {
  private mode: MetaverseMode
  private onStepChange?: MetaverseStepChangeCallback

  constructor(options: MetaverseServiceOptions = {}) {
    this.mode = options.mode ?? "simulation"
    this.onStepChange = options.onStepChange
  }

  validate(
    type: "explore" | "teleport",
    params: ExploreWorldParams | TeleportParams
  ): string | null {
    switch (type) {
      case "explore": {
        const p = params as ExploreWorldParams
        if (!p.worldId) {
          return "World ID is required"
        }
        const world = getWorld(p.worldId)
        if (!world) {
          return "World not found"
        }
        if (!world.isActive) {
          return "World is not active"
        }
        if (!p.tier) {
          return "Avatar tier is required"
        }
        return null
      }
      case "teleport": {
        const p = params as TeleportParams
        if (!p.worldId) {
          return "World ID is required"
        }
        if (!p.tier) {
          return "Avatar tier is required"
        }
        return null
      }
      default:
        return "Unknown action type"
    }
  }

  /**
   * Explore a world with stealth avatar.
   * selecting_world -> generating_stealth_avatar -> entering_world -> entered
   */
  async exploreWorld(
    params: ExploreWorldParams
  ): Promise<MetaverseActionRecord> {
    const validationError = this.validate("explore", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const world = getWorld(params.worldId)

    const record: MetaverseActionRecord = {
      id: generateId("explore"),
      type: "explore",
      worldId: params.worldId,
      status: "selecting_world",
      privacyLevel: params.privacyLevel,
      worldTitle: world?.title,
      category: world?.category,
      tier: params.tier,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Selecting world
      record.status = "selecting_world"
      record.stepTimestamps.selecting_world = Date.now()
      this.onStepChange?.("selecting_world", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.selecting_world)
        )
      }

      // Step 2: Generating stealth avatar (real SDK)
      record.status = "generating_stealth_avatar"
      record.stepTimestamps.generating_stealth_avatar = Date.now()
      this.onStepChange?.("generating_stealth_avatar", { ...record })

      const stealth = await generateMetaverseStealthAddress()
      record.stealthAddress = stealth.stealthAddress
      record.stealthMetaAddress = stealth.metaAddress

      // Generate a simulated commitment hash for avatar ID
      const commitBytes = new Uint8Array(32)
      crypto.getRandomValues(commitBytes)
      record.commitmentHash = `0x${Array.from(commitBytes.slice(0, 4))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}...${Array.from(commitBytes.slice(28))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.generating_stealth_avatar)
        )
      }

      // Step 3: Entering world
      record.status = "entering_world"
      record.stepTimestamps.entering_world = Date.now()
      this.onStepChange?.("entering_world", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.entering_world)
        )
      }

      // Step 4: Entered
      record.status = "entered"
      record.completedAt = Date.now()
      record.stepTimestamps.entered = Date.now()
      this.onStepChange?.("entered", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error =
        error instanceof Error ? error.message : "Exploration failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }

  /**
   * Teleport to a destination privately.
   * generating_proof -> teleporting -> arrived
   */
  async teleport(params: TeleportParams): Promise<MetaverseActionRecord> {
    const validationError = this.validate("teleport", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const world = getWorld(params.worldId)

    const record: MetaverseActionRecord = {
      id: generateId("teleport"),
      type: "teleport",
      worldId: params.worldId,
      status: "generating_proof",
      privacyLevel: params.privacyLevel,
      worldTitle: world?.title,
      tier: params.tier,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Generate private teleport proof
      record.status = "generating_proof"
      record.stepTimestamps.generating_proof = Date.now()
      this.onStepChange?.("generating_proof", { ...record })

      const stealth = await generateMetaverseStealthAddress()
      record.stealthAddress = stealth.stealthAddress
      record.stealthMetaAddress = stealth.metaAddress

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.generating_proof)
        )
      }

      // Step 2: Teleporting
      record.status = "teleporting"
      record.stepTimestamps.teleporting = Date.now()
      this.onStepChange?.("teleporting", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.teleporting))
      }

      // Step 3: Arrived
      record.teleportVerified = true
      record.status = "arrived"
      record.completedAt = Date.now()
      record.stepTimestamps.arrived = Date.now()
      this.onStepChange?.("arrived", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Teleport failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }
}
