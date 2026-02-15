import type { World, WorldCategory, MetaverseMode } from "./types"
import { SAMPLE_WORLDS } from "./constants"

export class PortalsReader {
  private mode: MetaverseMode

  constructor(mode: MetaverseMode = "simulation") {
    this.mode = mode
  }

  async getWorlds(): Promise<World[]> {
    if (this.mode === "simulation") {
      return SAMPLE_WORLDS
    }
    throw new Error("Portals mode is not yet implemented. Use simulation mode.")
  }

  async getWorld(id: string): Promise<World | undefined> {
    if (this.mode === "simulation") {
      return SAMPLE_WORLDS.find((w) => w.id === id)
    }
    throw new Error("Portals mode is not yet implemented. Use simulation mode.")
  }

  async getVisitors(): Promise<
    { address: string; worlds: number; tier: string }[]
  > {
    if (this.mode === "simulation") {
      return [
        { address: "S1P...x7a", worlds: 15, tier: "vip" },
        { address: "7Kz...m3b", worlds: 11, tier: "merchant" },
        { address: "Fg2...p9c", worlds: 8, tier: "citizen" },
        { address: "Bx8...k1d", worlds: 5, tier: "warrior" },
        { address: "Qm5...r4e", worlds: 3, tier: "explorer" },
      ]
    }
    throw new Error("Portals mode is not yet implemented. Use simulation mode.")
  }

  async getWorldsByCategory(category: WorldCategory): Promise<World[]> {
    if (this.mode === "simulation") {
      return SAMPLE_WORLDS.filter((w) => w.category === category)
    }
    throw new Error("Portals mode is not yet implemented. Use simulation mode.")
  }
}
