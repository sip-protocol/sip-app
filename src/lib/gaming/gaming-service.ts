import type {
  GamingActionRecord,
  GamingStepChangeCallback,
  GamingMode,
  PlayGameParams,
  ClaimRewardParams,
} from "./types"
import { SIMULATION_DELAYS, getGame } from "./constants"
import { generateGamingStealthAddress } from "./stealth-gaming"
import {
  createRealCommitment,
  encryptForViewingKey,
  encryptContent,
} from "@/lib/crypto-helpers"

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export interface GamingServiceOptions {
  mode?: GamingMode
  onStepChange?: GamingStepChangeCallback
  onCommitTransaction?: (gameId: string, move: string) => Promise<string | null>
  onRevealTransaction?: (gameId: string, move: string, salt: string) => Promise<string | null>
}

export class GamingService {
  private mode: GamingMode
  private onStepChange?: GamingStepChangeCallback
  private onCommitTransaction?: (
    gameId: string,
    move: string
  ) => Promise<string | null>
  private onRevealTransaction?: (
    gameId: string,
    move: string,
    salt: string
  ) => Promise<string | null>

  constructor(options: GamingServiceOptions = {}) {
    this.mode = options.mode ?? "simulation"
    this.onStepChange = options.onStepChange
    this.onCommitTransaction = options.onCommitTransaction
    this.onRevealTransaction = options.onRevealTransaction
  }

  validate(
    type: "play" | "claim",
    params: PlayGameParams | ClaimRewardParams
  ): string | null {
    switch (type) {
      case "play": {
        const p = params as PlayGameParams
        if (!p.gameId) {
          return "Game ID is required"
        }
        const game = getGame(p.gameId)
        if (!game) {
          return "Game not found"
        }
        if (!game.isActive) {
          return "Game is not active"
        }
        if (!p.move) {
          return "Move is required"
        }
        return null
      }
      case "claim": {
        const p = params as ClaimRewardParams
        if (!p.gameId) {
          return "Game ID is required"
        }
        if (!p.rewardTier) {
          return "Reward tier is required"
        }
        return null
      }
      default:
        return "Unknown action type"
    }
  }

  /**
   * Play a game with commit-reveal.
   * committing_move -> generating_commitment -> revealing -> resolved
   */
  async playGame(params: PlayGameParams): Promise<GamingActionRecord> {
    const validationError = this.validate("play", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const game = getGame(params.gameId)

    const record: GamingActionRecord = {
      id: generateId("play"),
      type: "play",
      gameId: params.gameId,
      status: "committing_move",
      privacyLevel: params.privacyLevel,
      gameTitle: game?.title,
      gameType: game?.gameType,
      difficulty: game?.difficulty,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Committing move
      record.status = "committing_move"
      record.stepTimestamps.committing_move = Date.now()
      this.onStepChange?.("committing_move", { ...record })

      if (this.onCommitTransaction) {
        const signature = await this.onCommitTransaction(
          params.gameId,
          params.move
        )
        if (signature) {
          record.txSignature = signature
        }
      } else if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.committing_move)
        )
      }

      // Step 2: Generating cryptographic commitment
      record.status = "generating_commitment"
      record.stepTimestamps.generating_commitment = Date.now()
      this.onStepChange?.("generating_commitment", { ...record })

      // Real Pedersen commitment via SDK
      const commitment = await createRealCommitment()
      record.commitmentHash = commitment.commitmentDisplay

      // Phase 1C: Encrypt game move
      const encryptedMove = await encryptContent(params.move)
      record.encryptedContent = encryptedMove.ciphertext
      record.encryptionNonce = encryptedMove.nonce

      // Phase 1B: Viewing key for compliant mode
      if (params.privacyLevel === "compliant") {
        const vk = await encryptForViewingKey({
          gameId: params.gameId,
          move: params.move,
          commitment: commitment.commitmentDisplay,
          timestamp: Date.now(),
        })
        record.viewingKeyHash = vk.viewingKeyHash
        record.encryptedForAuditor = vk.ciphertext
      }

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.generating_commitment)
        )
      }

      // Step 3: Revealing — send on-chain reveal transaction
      record.status = "revealing"
      record.stepTimestamps.revealing = Date.now()
      this.onStepChange?.("revealing", { ...record })

      if (this.onRevealTransaction) {
        try {
          const revealSig = await this.onRevealTransaction(
            params.gameId,
            params.move,
            commitment.blindingFactor
          )
          if (revealSig) {
            record.revealTxSignature = revealSig
          }
        } catch {
          // Non-fatal: reveal tx failure shouldn't block game resolution
        }
      } else if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.revealing))
      }

      // Step 4: Resolved — deterministic RPS or random for other game types
      const normalizedMove = params.move.toLowerCase().trim()
      const rpsMap: Record<string, string> = {
        rock: "scissors",
        paper: "rock",
        scissors: "paper",
      }
      if (rpsMap[normalizedMove] && record.commitmentHash) {
        // Deterministic opponent from commitment hash
        const hash = record.commitmentHash
          .split("")
          .reduce((a, c) => a + c.charCodeAt(0), 0)
        const oppMoves = ["rock", "paper", "scissors"]
        const opponentMove = oppMoves[hash % 3]
        record.won =
          normalizedMove === opponentMove
            ? false
            : rpsMap[normalizedMove] === opponentMove
      } else {
        record.won = Math.random() > 0.4 // 60% win rate for non-RPS games
      }
      record.status = "resolved"
      record.completedAt = Date.now()
      record.stepTimestamps.resolved = Date.now()
      this.onStepChange?.("resolved", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Play failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }

  /**
   * Claim a game reward privately.
   * generating_stealth (real SDK) -> claiming_reward -> claimed
   */
  async claimReward(params: ClaimRewardParams): Promise<GamingActionRecord> {
    const validationError = this.validate("claim", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const game = getGame(params.gameId)

    const record: GamingActionRecord = {
      id: generateId("claim"),
      type: "claim",
      gameId: params.gameId,
      status: "generating_stealth",
      privacyLevel: params.privacyLevel,
      gameTitle: game?.title,
      rewardTier: params.rewardTier,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Generate stealth address (real SDK)
      record.status = "generating_stealth"
      record.stepTimestamps.generating_stealth = Date.now()
      this.onStepChange?.("generating_stealth", { ...record })

      const stealth = await generateGamingStealthAddress()
      record.stealthAddress = stealth.stealthAddress
      record.stealthMetaAddress = stealth.metaAddress

      // Phase 1B: Viewing key for compliant mode
      if (params.privacyLevel === "compliant") {
        const vk = await encryptForViewingKey({
          gameId: params.gameId,
          rewardTier: params.rewardTier,
          stealthAddress: stealth.stealthAddress,
          timestamp: Date.now(),
        })
        record.viewingKeyHash = vk.viewingKeyHash
        record.encryptedForAuditor = vk.ciphertext
      }

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.generating_stealth)
        )
      }

      // Step 2: Claiming reward
      record.status = "claiming_reward"
      record.stepTimestamps.claiming_reward = Date.now()
      this.onStepChange?.("claiming_reward", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.claiming_reward)
        )
      }

      // Step 3: Claimed
      record.status = "claimed"
      record.completedAt = Date.now()
      record.stepTimestamps.claimed = Date.now()
      this.onStepChange?.("claimed", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Claim failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }
}
