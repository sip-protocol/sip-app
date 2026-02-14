import type { MigrationSource, DeadProtocol } from "./types"

export interface WalletScanResult {
  solBalance: number
  sources: MigrationSource[]
}

/**
 * Scan wallet for available migration sources.
 * Currently returns SOL balance for manual entry.
 * Future: scan for token accounts in dead protocols.
 */
export async function scanWallet(
  _walletAddress: string
): Promise<WalletScanResult> {
  // Manual entry is always available — just report SOL balance
  // In simulation mode, use a mock balance
  const mockSolBalance = 12.5

  const manualSource: MigrationSource = {
    protocol: null,
    type: "manual",
    balance: mockSolBalance.toFixed(4),
    token: "SOL",
  }

  return {
    solBalance: mockSolBalance,
    sources: [manualSource],
  }
}

/**
 * Create a migration source for a selected dead protocol.
 * In simulation mode, returns a mock balance.
 */
export function createProtocolSource(
  protocol: DeadProtocol,
  balance?: string
): MigrationSource {
  return {
    protocol,
    type: "protocol",
    balance: balance ?? "0",
    token: "SOL",
  }
}

/**
 * Create a manual SOL migration source.
 */
export function createManualSource(balance: string): MigrationSource {
  return {
    protocol: null,
    type: "manual",
    balance,
    token: "SOL",
  }
}
