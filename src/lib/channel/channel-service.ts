import type {
  ChannelActionRecord,
  ChannelStepChangeCallback,
  ChannelMode,
  SubscribeParams,
  PublishDropParams,
} from "./types"
import { SIMULATION_DELAYS, getDrop } from "./constants"
import { generateChannelStealthAddress } from "./stealth-channel"
import { encryptForViewingKey, encryptContent } from "@/lib/crypto-helpers"
import type { Transaction } from "@solana/web3.js"

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Callback to build a Bubblegum cNFT mint transaction for drop content.
 * Returns a signable Transaction to be sent via wallet adapter.
 */
export type BuildCNFTMintFn = (params: {
  recipient: string
  name: string
  metadataUri: string
}) => Promise<Transaction | null>

export interface ChannelServiceOptions {
  mode?: ChannelMode
  onStepChange?: ChannelStepChangeCallback
  onCommitTransaction?: (id: string, data: string) => Promise<string | null>
  /** Build a Bubblegum cNFT mint transaction (provided by hook when tree is configured) */
  buildCNFTMint?: BuildCNFTMintFn
  /** Send a signed transaction, returns signature or null */
  onSendTransaction?: (tx: Transaction) => Promise<string | null>
}

export class ChannelService {
  private mode: ChannelMode
  private onStepChange?: ChannelStepChangeCallback
  private onCommitTransaction?: (
    id: string,
    data: string
  ) => Promise<string | null>
  private buildCNFTMint?: BuildCNFTMintFn
  private onSendTransaction?: (tx: Transaction) => Promise<string | null>

  constructor(options: ChannelServiceOptions = {}) {
    this.mode = options.mode ?? "simulation"
    this.onStepChange = options.onStepChange
    this.onCommitTransaction = options.onCommitTransaction
    this.buildCNFTMint = options.buildCNFTMint
    this.onSendTransaction = options.onSendTransaction
  }

  validate(
    type: "subscribe" | "publish",
    params: SubscribeParams | PublishDropParams
  ): string | null {
    switch (type) {
      case "subscribe": {
        const p = params as SubscribeParams
        if (!p.dropId) {
          return "Drop ID is required"
        }
        const drop = getDrop(p.dropId)
        if (!drop) {
          return "Drop not found"
        }
        return null
      }
      case "publish": {
        const p = params as PublishDropParams
        if (!p.title) {
          return "Title is required"
        }
        if (!p.content) {
          return "Content is required"
        }
        if (!p.contentType) {
          return "Content type is required"
        }
        if (!p.accessTier) {
          return "Access tier is required"
        }
        return null
      }
      default:
        return "Unknown action type"
    }
  }

  /**
   * Subscribe to a drop.
   * selecting_channel -> subscribing (simulated DRiP) -> subscribed
   */
  async subscribe(params: SubscribeParams): Promise<ChannelActionRecord> {
    const validationError = this.validate("subscribe", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const drop = getDrop(params.dropId)

    const record: ChannelActionRecord = {
      id: generateId("sub"),
      type: "subscribe",
      dropId: params.dropId,
      status: "selecting_channel",
      privacyLevel: params.privacyLevel,
      dropTitle: drop?.title,
      accessTier: drop?.accessTier,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Selecting channel
      record.status = "selecting_channel"
      record.stepTimestamps.selecting_channel = Date.now()
      this.onStepChange?.("selecting_channel", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.selecting_channel)
        )
      }

      // Step 2: Subscribing
      record.status = "subscribing"
      record.stepTimestamps.subscribing = Date.now()
      this.onStepChange?.("subscribing", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.subscribing))
      }

      // Phase 1B: Viewing key for compliant mode
      if (params.privacyLevel === "compliant") {
        const vk = await encryptForViewingKey({
          dropId: params.dropId,
          timestamp: Date.now(),
        })
        record.viewingKeyHash = vk.viewingKeyHash
        record.encryptedForAuditor = vk.ciphertext
      }

      // Step 3: Subscribed
      record.status = "subscribed"
      record.completedAt = Date.now()
      record.stepTimestamps.subscribed = Date.now()
      this.onStepChange?.("subscribed", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Subscribe failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }

  /**
   * Publish a drop with encryption.
   * encrypting_content -> generating_stealth (real SDK) -> publishing -> published
   */
  async publishDrop(params: PublishDropParams): Promise<ChannelActionRecord> {
    const validationError = this.validate("publish", params)
    if (validationError) {
      throw new Error(validationError)
    }

    const record: ChannelActionRecord = {
      id: generateId("pub"),
      type: "publish",
      dropId: generateId("drop"),
      status: "encrypting_content",
      privacyLevel: params.privacyLevel,
      contentType: params.contentType,
      title: params.title,
      accessTier: params.accessTier,
      startedAt: Date.now(),
      stepTimestamps: {},
    }

    try {
      // Step 1: Encrypting content
      record.status = "encrypting_content"
      record.stepTimestamps.encrypting_content = Date.now()
      this.onStepChange?.("encrypting_content", { ...record })

      if (this.mode === "simulation") {
        await new Promise((r) =>
          setTimeout(r, SIMULATION_DELAYS.encrypting_content)
        )
      }

      // Step 2: Generate stealth address (real SDK)
      record.status = "generating_stealth"
      record.stepTimestamps.generating_stealth = Date.now()
      this.onStepChange?.("generating_stealth", { ...record })

      const stealth = await generateChannelStealthAddress()
      record.stealthAddress = stealth.stealthAddress
      record.stealthMetaAddress = stealth.metaAddress

      // Phase 1C: Real content encryption
      const encryptedDrop = await encryptContent(
        JSON.stringify({
          dropId: record.dropId,
          title: params.title,
          contentType: params.contentType,
        })
      )
      record.encryptedContent = encryptedDrop.ciphertext
      record.encryptionNonce = encryptedDrop.nonce

      // Phase 1B: Viewing key for compliant mode
      if (params.privacyLevel === "compliant") {
        const vk = await encryptForViewingKey({
          dropId: record.dropId,
          title: params.title,
          contentType: params.contentType,
          accessTier: params.accessTier,
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

      // Step 3: Publishing — build and send Bubblegum cNFT mint if configured
      record.status = "publishing"
      record.stepTimestamps.publishing = Date.now()
      this.onStepChange?.("publishing", { ...record })

      const metadataUri = `https://arweave.net/${generateId("drop").replace(/_/g, "")}`

      // Try real Bubblegum cNFT mint when builder + sender + stealth address are available
      if (
        this.buildCNFTMint &&
        this.onSendTransaction &&
        record.stealthAddress
      ) {
        const mintTx = await this.buildCNFTMint({
          recipient: record.stealthAddress,
          name: params.title,
          metadataUri,
        })

        if (mintTx) {
          const txSignature = await this.onSendTransaction(mintTx)
          if (txSignature) record.txSignature = txSignature
        }
      } else if (this.onCommitTransaction) {
        const signature = await this.onCommitTransaction(
          record.id,
          `${record.dropId}:${record.title}`
        )
        if (signature) record.txSignature = signature
      } else if (this.mode === "simulation") {
        await new Promise((r) => setTimeout(r, SIMULATION_DELAYS.publishing))
      }

      // Step 4: Published
      record.status = "published"
      record.completedAt = Date.now()
      record.stepTimestamps.published = Date.now()
      this.onStepChange?.("published", { ...record })

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "Publish failed"
      record.stepTimestamps.failed = Date.now()
      this.onStepChange?.("failed", { ...record })
      throw error
    }
  }
}
