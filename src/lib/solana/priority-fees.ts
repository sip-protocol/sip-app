import type { Connection } from "@solana/web3.js"

const MIN_FEE = 50_000
const MAX_FEE = 500_000

export async function estimatePriorityFee(
  connection: Connection
): Promise<number> {
  try {
    const fees = await connection.getRecentPrioritizationFees()

    if (!fees.length) return MIN_FEE

    const sorted = fees
      .map((f) => f.prioritizationFee)
      .filter((f) => f > 0)
      .sort((a, b) => a - b)

    if (!sorted.length) return MIN_FEE

    const idx = Math.floor(sorted.length * 0.75)
    const estimate = sorted[idx]

    return Math.min(Math.max(estimate, MIN_FEE), MAX_FEE)
  } catch {
    return MIN_FEE
  }
}
