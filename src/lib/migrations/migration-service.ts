import type {
  Migration,
  MigrationStep,
  MigrationParams,
  MigrationStepChangeCallback,
  MigrationMode,
} from "./types"
import { SIMULATION_DELAYS } from "./constants"
import { generateMigrationStealthAddress } from "./stealth-migration"
import { SunriseClient } from "./sunrise-client"

function generateId(): string {
  return `migration_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function generateMockTxHash(): string {
  return Array.from({ length: 88 }, () =>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[
      Math.floor(Math.random() * 62)
    ]
  ).join("")
}

const STEP_ORDER: MigrationStep[] = [
  "scanning_wallet",
  "generating_stealth",
  "withdrawing_from_source",
  "depositing_to_sunrise",
  "complete",
]

export interface MigrationServiceOptions {
  mode?: MigrationMode
  onStepChange?: MigrationStepChangeCallback
}

export class MigrationService {
  private mode: MigrationMode
  private onStepChange?: MigrationStepChangeCallback
  private sunriseClient: SunriseClient

  constructor(options: MigrationServiceOptions = {}) {
    this.mode = options.mode ?? "simulation"
    this.onStepChange = options.onStepChange
    this.sunriseClient = new SunriseClient(this.mode)
  }

  validate(params: MigrationParams): string | null {
    const amount = parseFloat(params.amount)
    if (isNaN(amount) || amount <= 0) {
      return "Amount must be greater than 0"
    }

    if (amount < 0.01) {
      return "Minimum migration amount is 0.01 SOL"
    }

    if (params.source.type === "protocol" && !params.source.protocol) {
      return "Please select a source protocol"
    }

    return null
  }

  async executeMigration(params: MigrationParams): Promise<Migration> {
    const validationError = this.validate(params)
    if (validationError) {
      throw new Error(validationError)
    }

    const migration: Migration = {
      id: generateId(),
      source: params.source,
      amount: params.amount,
      stealthAddress: "",
      stealthMetaAddress: "",
      privacyLevel: params.privacyLevel,
      status: "scanning_wallet",
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      for (const step of STEP_ORDER) {
        migration.status = step
        migration.stepTimestamps[step] = Date.now()
        this.onStepChange?.(step, { ...migration })

        if (step === "complete") {
          migration.completedAt = Date.now()
          break
        }

        if (this.mode === "simulation") {
          await this.executeSimulationStep(step, migration)
        } else {
          await this.executeDevnetStep(step, migration)
        }
      }

      return migration
    } catch (error) {
      migration.status = "failed"
      migration.error =
        error instanceof Error ? error.message : "Migration failed"
      migration.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...migration })
      throw error
    }
  }

  private async executeSimulationStep(
    step: MigrationStep,
    migration: Migration
  ): Promise<void> {
    const delay = SIMULATION_DELAYS[step]

    switch (step) {
      case "scanning_wallet": {
        await new Promise((r) => setTimeout(r, delay))
        break
      }

      case "generating_stealth": {
        // Real stealth address generation via SDK
        const stealth = await generateMigrationStealthAddress()
        migration.stealthAddress = stealth.stealthAddress
        migration.stealthMetaAddress = stealth.stealthMetaAddress
        if (delay > 0) {
          await new Promise((r) => setTimeout(r, delay))
        }
        break
      }

      case "withdrawing_from_source": {
        await new Promise((r) => setTimeout(r, delay))
        migration.withdrawTxHash = generateMockTxHash()
        break
      }

      case "depositing_to_sunrise": {
        // Simulate Sunrise deposit
        const deposit = await this.sunriseClient.deposit(
          migration.amount,
          migration.stealthAddress
        )
        migration.gsolAmount = deposit.gsolAmount
        migration.carbonOffsetKg = deposit.carbonOffsetKg
        migration.depositTxHash = deposit.txHash
        if (delay > 0) {
          await new Promise((r) => setTimeout(r, delay))
        }
        break
      }
    }
  }

  private async executeDevnetStep(
    _step: MigrationStep,
    _migration: Migration
  ): Promise<void> {
    throw new Error("Devnet mode is not yet implemented. Use simulation mode.")
  }
}
