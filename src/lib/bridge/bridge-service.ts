import type {
  BridgeTransfer,
  BridgeStep,
  BridgeParams,
  BridgeStepChangeCallback,
  BridgeMode,
} from "./types"
import { SIMULATION_DELAYS, getRoute } from "./constants"
import { generateBridgeStealthAddress } from "./stealth-bridge"

function generateId(): string {
  return `bridge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function generateMockTxHash(): string {
  return Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("")
}

function generateMockWormholeId(): string {
  return `${Math.floor(Math.random() * 100000)}/${generateMockTxHash().slice(0, 16)}`
}

const STEP_ORDER: BridgeStep[] = [
  "generating_stealth",
  "initiating_transfer",
  "awaiting_attestation",
  "relaying",
  "complete",
]

export interface BridgeServiceOptions {
  mode?: BridgeMode
  onStepChange?: BridgeStepChangeCallback
}

export class BridgeService {
  private mode: BridgeMode
  private onStepChange?: BridgeStepChangeCallback

  constructor(options: BridgeServiceOptions = {}) {
    this.mode = options.mode ?? "simulation"
    this.onStepChange = options.onStepChange
  }

  /**
   * Validate bridge params before execution
   */
  validate(params: BridgeParams): string | null {
    if (params.sourceChain === params.destChain) {
      return "Source and destination chains must be different"
    }

    const route = getRoute(params.sourceChain, params.destChain)
    if (!route) {
      return `No route available from ${params.sourceChain} to ${params.destChain}`
    }

    if (!route.tokens.includes(params.token)) {
      return `${params.token} is not supported on this route`
    }

    const amount = parseFloat(params.amount)
    if (isNaN(amount) || amount <= 0) {
      return "Amount must be greater than 0"
    }

    return null
  }

  /**
   * Execute a bridge transfer through the step state machine.
   * In simulation mode: realistic delays with real stealth address generation.
   * In NTT mode: would call Wormhole NTT SDK (future).
   */
  async executeBridge(params: BridgeParams): Promise<BridgeTransfer> {
    const validationError = this.validate(params)
    if (validationError) {
      throw new Error(validationError)
    }

    const transfer: BridgeTransfer = {
      id: generateId(),
      sourceChain: params.sourceChain,
      destChain: params.destChain,
      token: params.token,
      amount: params.amount,
      stealthAddress: "",
      stealthMetaAddress: "",
      privacyLevel: params.privacyLevel,
      status: "generating_stealth",
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      for (const step of STEP_ORDER) {
        transfer.status = step
        transfer.stepTimestamps[step] = Date.now()
        this.onStepChange?.(step, { ...transfer })

        if (step === "complete") {
          transfer.completedAt = Date.now()
          break
        }

        if (this.mode === "simulation") {
          await this.executeSimulationStep(step, transfer)
        } else {
          await this.executeNttStep(step, transfer)
        }
      }

      return transfer
    } catch (error) {
      transfer.status = "failed"
      transfer.error =
        error instanceof Error ? error.message : "Bridge transfer failed"
      transfer.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...transfer })
      throw error
    }
  }

  private async executeSimulationStep(
    step: BridgeStep,
    transfer: BridgeTransfer
  ): Promise<void> {
    const delay = SIMULATION_DELAYS[step]

    switch (step) {
      case "generating_stealth": {
        // Real stealth address generation via SDK
        const stealth = await generateBridgeStealthAddress(transfer.destChain)
        transfer.stealthAddress = stealth.stealthAddress
        transfer.stealthMetaAddress = stealth.stealthMetaAddress
        // Wait remaining delay if stealth gen was fast
        if (delay > 0) {
          await new Promise((r) => setTimeout(r, delay))
        }
        break
      }

      case "initiating_transfer": {
        await new Promise((r) => setTimeout(r, delay))
        transfer.sourceTxHash = generateMockTxHash()
        break
      }

      case "awaiting_attestation": {
        await new Promise((r) => setTimeout(r, delay))
        transfer.wormholeMessageId = generateMockWormholeId()
        break
      }

      case "relaying": {
        await new Promise((r) => setTimeout(r, delay))
        transfer.destTxHash = generateMockTxHash()
        break
      }
    }
  }

  private async executeNttStep(
    _step: BridgeStep,
    _transfer: BridgeTransfer
  ): Promise<void> {
    // Future: Wormhole NTT SDK integration
    // For now, throw to indicate NTT mode is not yet available
    throw new Error("NTT mode is not yet implemented. Use simulation mode.")
  }
}
