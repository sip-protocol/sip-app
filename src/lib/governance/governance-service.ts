import type {
  VoteParams,
  PrivateVoteRecord,
  SerializedEncryptedVote,
  VoteStepChangeCallback,
  GovernanceMode,
} from "./types"
import { SIMULATION_DELAYS, getProposal } from "./constants"

function generateId(): string {
  return `vote_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export interface GovernanceServiceOptions {
  mode?: GovernanceMode
  onStepChange?: VoteStepChangeCallback
}

export class GovernanceService {
  private mode: GovernanceMode
  private onStepChange?: VoteStepChangeCallback

  constructor(options: GovernanceServiceOptions = {}) {
    this.mode = options.mode ?? "simulation"
    this.onStepChange = options.onStepChange
  }

  validate(params: VoteParams): string | null {
    if (!params.proposalId) {
      return "Proposal ID is required"
    }

    const proposal = getProposal(params.proposalId)
    if (!proposal) {
      return "Proposal not found"
    }

    if (proposal.status !== "voting") {
      return "Proposal is not in voting phase"
    }

    if (typeof params.choice !== "number" || params.choice < 0 || params.choice >= proposal.choices.length) {
      return `Invalid choice. Must be 0-${proposal.choices.length - 1}`
    }

    const weight = BigInt(params.weight || "0")
    if (weight <= 0n) {
      return "Voting weight must be greater than 0"
    }

    return null
  }

  /**
   * Phase 1: Commit a vote (encrypting -> committing -> committed)
   */
  async commitVote(params: VoteParams): Promise<PrivateVoteRecord> {
    const validationError = this.validate(params)
    if (validationError) {
      throw new Error(validationError)
    }

    const proposal = getProposal(params.proposalId)!

    const vote: PrivateVoteRecord = {
      id: generateId(),
      proposalId: params.proposalId,
      daoName: proposal.daoName,
      proposalTitle: proposal.title,
      choice: params.choice,
      choiceLabel: proposal.choices[params.choice],
      weight: params.weight,
      encryptedVote: {
        ciphertext: "",
        nonce: "",
        encryptionKeyHash: "",
        proposalId: params.proposalId,
        voter: "",
        timestamp: 0,
      },
      encryptionKey: proposal.encryptionKey,
      status: "encrypting",
      privacyLevel: params.privacyLevel,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Encrypting (real SDK encryption)
      vote.status = "encrypting"
      vote.stepTimestamps.encrypting = Date.now()
      this.onStepChange?.("encrypting", { ...vote })

      const encrypted = await this.encryptVote(params, proposal.encryptionKey)
      vote.encryptedVote = encrypted

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.encrypting))
      }

      // Step 2: Committing (on-chain submission)
      vote.status = "committing"
      vote.stepTimestamps.committing = Date.now()
      this.onStepChange?.("committing", { ...vote })

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.committing))
      }

      // Step 3: Committed
      vote.status = "committed"
      vote.committedAt = Date.now()
      vote.stepTimestamps.committed = Date.now()
      this.onStepChange?.("committed", { ...vote })

      return vote
    } catch (error) {
      vote.status = "failed"
      vote.error = error instanceof Error ? error.message : "Vote commit failed"
      vote.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...vote })
      throw error
    }
  }

  /**
   * Phase 2: Reveal a committed vote (revealing -> revealed)
   */
  async revealVote(
    voteId: string,
    encryptionKey: string,
    encryptedVote: SerializedEncryptedVote,
  ): Promise<PrivateVoteRecord> {
    const proposal = getProposal(encryptedVote.proposalId)
    if (!proposal) {
      throw new Error("Proposal not found")
    }

    const vote: PrivateVoteRecord = {
      id: voteId,
      proposalId: encryptedVote.proposalId,
      daoName: proposal.daoName,
      proposalTitle: proposal.title,
      choice: -1,
      choiceLabel: "",
      weight: "0",
      encryptedVote,
      encryptionKey,
      status: "revealing",
      privacyLevel: "shielded" as PrivateVoteRecord["privacyLevel"],
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Revealing (real SDK decryption)
      vote.status = "revealing"
      vote.stepTimestamps.revealing = Date.now()
      this.onStepChange?.("revealing", { ...vote })

      const revealed = await this.decryptVote(encryptedVote, encryptionKey)
      vote.revealedChoice = revealed.choice
      vote.revealedWeight = revealed.weight
      vote.choice = revealed.choice
      vote.choiceLabel = proposal.choices[revealed.choice] ?? `Choice ${revealed.choice}`
      vote.weight = revealed.weight

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.revealing))
      }

      // Step 2: Revealed
      vote.status = "revealed"
      vote.revealedAt = Date.now()
      vote.stepTimestamps.revealed = Date.now()
      this.onStepChange?.("revealed", { ...vote })

      return vote
    } catch (error) {
      vote.status = "failed"
      vote.error = error instanceof Error ? error.message : "Vote reveal failed"
      vote.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...vote })
      throw error
    }
  }

  private async encryptVote(
    params: VoteParams,
    encryptionKey: string,
  ): Promise<SerializedEncryptedVote> {
    try {
      const { createPrivateVoting } = await import("@sip-protocol/sdk")
      const voting = createPrivateVoting()

      const encrypted = voting.castVote({
        proposalId: params.proposalId,
        choice: params.choice,
        weight: BigInt(params.weight),
        encryptionKey,
      })

      return {
        ciphertext: encrypted.ciphertext,
        nonce: encrypted.nonce,
        encryptionKeyHash: encrypted.encryptionKeyHash,
        proposalId: encrypted.proposalId,
        voter: encrypted.voter,
        timestamp: encrypted.timestamp,
      }
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  private async decryptVote(
    encryptedVote: SerializedEncryptedVote,
    encryptionKey: string,
  ): Promise<{ choice: number; weight: string }> {
    try {
      const { createPrivateVoting } = await import("@sip-protocol/sdk")
      const voting = createPrivateVoting()

      const sdkVote = {
        ciphertext: encryptedVote.ciphertext as `0x${string}`,
        nonce: encryptedVote.nonce as `0x${string}`,
        encryptionKeyHash: encryptedVote.encryptionKeyHash as `0x${string}`,
        proposalId: encryptedVote.proposalId,
        voter: encryptedVote.voter,
        timestamp: encryptedVote.timestamp,
      }

      const revealed = voting.revealVote(sdkVote, encryptionKey)

      return {
        choice: revealed.choice,
        weight: revealed.weight.toString(),
      }
    } catch (error) {
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }
}
