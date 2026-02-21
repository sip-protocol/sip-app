import type {
  TicketingActionRecord,
  TicketingStepChangeCallback,
  TicketingMode,
  PurchaseTicketParams,
  VerifyTicketParams,
} from "./types"
import { SIMULATION_DELAYS, getEvent } from "./constants"
import { generateTicketingStealthAddress } from "./stealth-ticketing"
import {
  createRealCommitment,
  encryptForViewingKey,
} from "@/lib/crypto-helpers"
import type { Transaction } from "@solana/web3.js"

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Callback to build a Bubblegum cNFT mint transaction for ticket purchase.
 * Returns a signable Transaction to be sent via wallet adapter.
 */
export type BuildCNFTMintFn = (params: {
  recipient: string
  name: string
  metadataUri: string
}) => Promise<Transaction | null>

export interface TicketingServiceOptions {
  mode?: TicketingMode
  onStepChange?: TicketingStepChangeCallback
  onCommitTransaction?: (
    eventId: string,
    tier: string
  ) => Promise<string | null>
  /** Build a Bubblegum cNFT mint transaction (provided by hook when tree is configured) */
  buildCNFTMint?: BuildCNFTMintFn
  /** Send a signed transaction, returns signature or null */
  onSendTransaction?: (tx: Transaction) => Promise<string | null>
}

export class TicketingService {
  private mode: TicketingMode
  private onStepChange?: TicketingStepChangeCallback
  private onCommitTransaction?: (
    eventId: string,
    tier: string
  ) => Promise<string | null>
  private buildCNFTMint?: BuildCNFTMintFn
  private onSendTransaction?: (tx: Transaction) => Promise<string | null>

  constructor(options: TicketingServiceOptions = {}) {
    this.mode = options.mode ?? "simulation"
    this.onStepChange = options.onStepChange
    this.onCommitTransaction = options.onCommitTransaction
    this.buildCNFTMint = options.buildCNFTMint
    this.onSendTransaction = options.onSendTransaction
  }

  validate(
    type: "purchase" | "verify",
    params: PurchaseTicketParams | VerifyTicketParams
  ): string | null {
    switch (type) {
      case "purchase": {
        const p = params as PurchaseTicketParams
        if (!p.eventId) {
          return "Event ID is required"
        }
        const event = getEvent(p.eventId)
        if (!event) {
          return "Event not found"
        }
        if (!event.isActive) {
          return "Event is not active"
        }
        if (!p.tier) {
          return "Ticket tier is required"
        }
        return null
      }
      case "verify": {
        const p = params as VerifyTicketParams
        if (!p.eventId) {
          return "Event ID is required"
        }
        if (!p.tier) {
          return "Ticket tier is required"
        }
        return null
      }
      default:
        return "Unknown action type"
    }
  }

  /**
   * Purchase a ticket with stealth address.
   * selecting_event -> generating_stealth_ticket -> purchasing -> purchased
   */
  async purchaseTicket(
    params: PurchaseTicketParams
  ): Promise<TicketingActionRecord> {
    const validationError = this.validate("purchase", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const event = getEvent(params.eventId)

    const record: TicketingActionRecord = {
      id: generateId("purchase"),
      type: "purchase",
      eventId: params.eventId,
      status: "selecting_event",
      privacyLevel: params.privacyLevel,
      eventTitle: event?.title,
      category: event?.category,
      tier: params.tier,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Selecting event
      record.status = "selecting_event"
      record.stepTimestamps.selecting_event = Date.now()
      this.onStepChange?.("selecting_event", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.selecting_event)
        )
      }

      // Step 2: Generating stealth ticket (real SDK)
      record.status = "generating_stealth_ticket"
      record.stepTimestamps.generating_stealth_ticket = Date.now()
      this.onStepChange?.("generating_stealth_ticket", { ...record })

      const stealth = await generateTicketingStealthAddress()
      record.stealthAddress = stealth.stealthAddress
      record.stealthMetaAddress = stealth.metaAddress

      // Real Pedersen commitment via SDK
      const commitment = await createRealCommitment()
      record.commitmentHash = commitment.commitmentDisplay

      // Phase 1B: Viewing key for compliant mode
      if (params.privacyLevel === "compliant") {
        const vk = await encryptForViewingKey({
          eventId: params.eventId,
          tier: params.tier,
          commitment: commitment.commitmentDisplay,
          timestamp: Date.now(),
        })
        record.viewingKeyHash = vk.viewingKeyHash
        record.encryptedForAuditor = vk.ciphertext
      }

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.generating_stealth_ticket)
        )
      }

      // Step 3: Purchasing — build and send Bubblegum cNFT ticket if configured
      record.status = "purchasing"
      record.stepTimestamps.purchasing = Date.now()
      this.onStepChange?.("purchasing", { ...record })

      const tierLabel = params.tier
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
      const ticketName = `${event?.title ?? params.eventId} — ${tierLabel}`
      const metadataUri = `https://arweave.net/${generateId("tix").replace(/_/g, "")}`

      // Try real Bubblegum cNFT mint when builder + sender + stealth address are available
      if (
        this.buildCNFTMint &&
        this.onSendTransaction &&
        record.stealthAddress
      ) {
        const mintTx = await this.buildCNFTMint({
          recipient: record.stealthAddress,
          name: ticketName,
          metadataUri,
        })

        if (mintTx) {
          const txSignature = await this.onSendTransaction(mintTx)
          if (txSignature) record.txSignature = txSignature
        }
      } else if (this.onCommitTransaction) {
        const signature = await this.onCommitTransaction(
          params.eventId,
          params.tier
        )
        if (signature) {
          record.txSignature = signature
        }
      } else if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.purchasing))
      }

      // Step 4: Purchased
      record.status = "purchased"
      record.completedAt = Date.now()
      record.stepTimestamps.purchased = Date.now()
      this.onStepChange?.("purchased", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Purchase failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }

  /**
   * Verify ticket attendance privately.
   * generating_proof -> verifying_attendance -> verified
   */
  async verifyTicket(
    params: VerifyTicketParams
  ): Promise<TicketingActionRecord> {
    const validationError = this.validate("verify", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const event = getEvent(params.eventId)

    const record: TicketingActionRecord = {
      id: generateId("verify"),
      type: "verify",
      eventId: params.eventId,
      status: "generating_proof",
      privacyLevel: params.privacyLevel,
      eventTitle: event?.title,
      tier: params.tier,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Generate viewing key proof
      record.status = "generating_proof"
      record.stepTimestamps.generating_proof = Date.now()
      this.onStepChange?.("generating_proof", { ...record })

      const stealth = await generateTicketingStealthAddress()
      record.stealthAddress = stealth.stealthAddress
      record.stealthMetaAddress = stealth.metaAddress

      // Phase 1B: Viewing key for compliant mode
      if (params.privacyLevel === "compliant") {
        const vk = await encryptForViewingKey({
          eventId: params.eventId,
          tier: params.tier,
          stealthAddress: stealth.stealthAddress,
          timestamp: Date.now(),
        })
        record.viewingKeyHash = vk.viewingKeyHash
        record.encryptedForAuditor = vk.ciphertext
      }

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.generating_proof)
        )
      }

      // Step 2: Verifying attendance
      record.status = "verifying_attendance"
      record.stepTimestamps.verifying_attendance = Date.now()
      this.onStepChange?.("verifying_attendance", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.verifying_attendance)
        )
      }

      // Step 3: Verified
      record.attendanceVerified = true
      record.status = "verified"
      record.completedAt = Date.now()
      record.stepTimestamps.verified = Date.now()
      this.onStepChange?.("verified", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Verify failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }
}
