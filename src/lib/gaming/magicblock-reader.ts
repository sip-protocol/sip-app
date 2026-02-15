import type {
  Game,
  GameResult,
  GameType,
  GamingMode,
} from "./types"
import {
  SAMPLE_GAMES,
  SAMPLE_RESULTS,
} from "./constants"

export class MagicBlockReader {
  private mode: GamingMode

  constructor(mode: GamingMode = "simulation") {
    this.mode = mode
  }

  async getGames(): Promise<Game[]> {
    if (this.mode === "simulation") {
      return SAMPLE_GAMES
    }
    throw new Error("MagicBlock mode is not yet implemented. Use simulation mode.")
  }

  async getGame(id: string): Promise<Game | undefined> {
    if (this.mode === "simulation") {
      return SAMPLE_GAMES.find((g) => g.id === id)
    }
    throw new Error("MagicBlock mode is not yet implemented. Use simulation mode.")
  }

  async getResults(): Promise<GameResult[]> {
    if (this.mode === "simulation") {
      return SAMPLE_RESULTS
    }
    throw new Error("MagicBlock mode is not yet implemented. Use simulation mode.")
  }

  async getGamesByType(type: GameType): Promise<Game[]> {
    if (this.mode === "simulation") {
      return SAMPLE_GAMES.filter((g) => g.gameType === type)
    }
    throw new Error("MagicBlock mode is not yet implemented. Use simulation mode.")
  }

  async getLeaderboard(): Promise<{ address: string; wins: number; tier: string }[]> {
    if (this.mode === "simulation") {
      return [
        { address: "S1P...x7a", wins: 42, tier: "diamond" },
        { address: "7Kz...m3b", wins: 38, tier: "gold" },
        { address: "Fg2...p9c", wins: 31, tier: "gold" },
        { address: "Bx8...k1d", wins: 27, tier: "silver" },
        { address: "Qm5...r4e", wins: 19, tier: "bronze" },
      ]
    }
    throw new Error("MagicBlock mode is not yet implemented. Use simulation mode.")
  }
}
