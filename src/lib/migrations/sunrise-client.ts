import { CARBON_OFFSET_KG_PER_SOL_PER_YEAR, GSOL_MINT } from "./constants"

export interface SunriseDepositResult {
  gsolAmount: string
  carbonOffsetKg: number
  txHash: string
}

export interface SunriseDetails {
  gsolMint: string
  tvl: number
  apy: number
}

/**
 * Thin wrapper around Sunrise Stake operations.
 * In simulation mode, returns mock data.
 * Future: integrates with @sunrisestake/client SDK.
 */
export class SunriseClient {
  private mode: "simulation" | "devnet"

  constructor(mode: "simulation" | "devnet" = "simulation") {
    this.mode = mode
  }

  /**
   * Deposit SOL into Sunrise Stake, receiving gSOL.
   * gSOL yield is used to purchase carbon offsets.
   */
  async deposit(
    amount: string,
    _fromAddress: string
  ): Promise<SunriseDepositResult> {
    if (this.mode === "simulation") {
      return this.simulateDeposit(amount)
    }

    // Future: real Sunrise SDK integration
    throw new Error("Devnet mode not yet implemented")
  }

  /**
   * Get Sunrise Stake protocol details.
   */
  async getDetails(): Promise<SunriseDetails> {
    // Sunrise Stake details (public info)
    return {
      gsolMint: GSOL_MINT,
      tvl: 125000,
      apy: 7.2,
    }
  }

  /**
   * Estimate carbon offset for a given SOL amount.
   */
  estimateCarbonOffset(solAmount: number): number {
    return solAmount * CARBON_OFFSET_KG_PER_SOL_PER_YEAR
  }

  private async simulateDeposit(amount: string): Promise<SunriseDepositResult> {
    const solAmount = parseFloat(amount)

    // gSOL is 1:1 with SOL (liquid staking token)
    const gsolAmount = solAmount.toFixed(4)
    const carbonOffsetKg = this.estimateCarbonOffset(solAmount)

    // Mock transaction hash
    const txHash = Array.from(
      { length: 88 },
      () =>
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[
          Math.floor(Math.random() * 62)
        ]
    ).join("")

    return { gsolAmount, carbonOffsetKg, txHash }
  }
}
