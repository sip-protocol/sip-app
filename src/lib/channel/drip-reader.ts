import type {
  Drop,
  ChannelSubscription,
  AccessTier,
  ChannelMode,
} from "./types"
import { SAMPLE_DROPS, SAMPLE_SUBSCRIPTIONS } from "./constants"

export class DripReader {
  private mode: ChannelMode

  constructor(mode: ChannelMode = "simulation") {
    this.mode = mode
  }

  async getDrops(): Promise<Drop[]> {
    if (this.mode === "simulation") {
      return SAMPLE_DROPS
    }
    throw new Error("DRiP mode is not yet implemented. Use simulation mode.")
  }

  async getDrop(id: string): Promise<Drop | undefined> {
    if (this.mode === "simulation") {
      return SAMPLE_DROPS.find((d) => d.id === id)
    }
    throw new Error("DRiP mode is not yet implemented. Use simulation mode.")
  }

  async getSubscriptions(): Promise<ChannelSubscription[]> {
    if (this.mode === "simulation") {
      return SAMPLE_SUBSCRIPTIONS
    }
    throw new Error("DRiP mode is not yet implemented. Use simulation mode.")
  }

  async getDropsByTier(tier: AccessTier): Promise<Drop[]> {
    if (this.mode === "simulation") {
      return SAMPLE_DROPS.filter((d) => d.accessTier === tier)
    }
    throw new Error("DRiP mode is not yet implemented. Use simulation mode.")
  }
}
