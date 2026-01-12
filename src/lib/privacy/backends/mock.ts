/**
 * Mock Privacy Backend
 *
 * A mock implementation of the PrivacyBackend interface for development
 * and testing. Simulates all privacy operations without making real
 * blockchain transactions.
 *
 * Features:
 * - Configurable latency to simulate real backends
 * - Simulated stealth address generation
 * - Simulated Pedersen commitments
 * - Optional failure injection for testing
 */

import type { PrivacyBackend } from "../backend"
import type {
  BackendName,
  BackendFeatures,
  BackendStatus,
  Quote,
  QuoteParams,
  TransferParams,
  TransferResult,
  TransferEventCallback,
  ScannedPayment,
  TransferEvent,
} from "../types"
import { PrivacyLevel } from "@sip-protocol/types"

/**
 * Configuration options for the mock backend
 */
export interface MockBackendConfig {
  /** Simulated latency in milliseconds (default: 500) */
  latencyMs?: number
  /** Probability of failure (0-1, default: 0) */
  failureRate?: number
  /** Network to simulate (default: "devnet") */
  network?: "mainnet" | "devnet" | "testnet"
  /** Whether the backend should report as available (default: true) */
  available?: boolean
}

/**
 * Mock Privacy Backend Implementation
 */
export class MockBackend implements PrivacyBackend {
  readonly name: BackendName = "mock"
  readonly displayName = "Mock Backend"
  readonly description =
    "Development backend for testing. Simulates privacy operations without real transactions."

  readonly features: BackendFeatures = {
    amountHiding: true,
    recipientHiding: true,
    viewingKeys: true,
    sameChainOnly: true,
    averageLatencyMs: 500,
    privacyModel: "cryptographic",
  }

  private config: Required<MockBackendConfig>
  private transferCounter = 0
  private mockPayments: ScannedPayment[] = []

  constructor(config: MockBackendConfig = {}) {
    this.config = {
      latencyMs: config.latencyMs ?? 500,
      failureRate: config.failureRate ?? 0,
      network: config.network ?? "devnet",
      available: config.available ?? true,
    }
  }

  /**
   * Simulate network latency
   */
  private async simulateLatency(multiplier = 1): Promise<void> {
    const jitter = Math.random() * 0.2 - 0.1 // +-10% jitter
    const latency = this.config.latencyMs * multiplier * (1 + jitter)
    await new Promise((resolve) => setTimeout(resolve, latency))
  }

  /**
   * Check if should fail based on failure rate
   */
  private shouldFail(): boolean {
    return Math.random() < this.config.failureRate
  }

  /**
   * Generate a mock transaction hash
   */
  private generateTxHash(): string {
    const chars = "0123456789abcdef"
    let hash = ""
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)]
    }
    return hash
  }

  /**
   * Generate a mock stealth address
   */
  private generateMockStealthAddress(): string {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    let address = ""
    for (let i = 0; i < 44; i++) {
      address += chars[Math.floor(Math.random() * chars.length)]
    }
    return address
  }

  /**
   * Generate a mock Pedersen commitment
   */
  private generateMockCommitment(): string {
    const chars = "0123456789abcdef"
    let commitment = "0x"
    for (let i = 0; i < 64; i++) {
      commitment += chars[Math.floor(Math.random() * chars.length)]
    }
    return commitment
  }

  /**
   * Emit a transfer event
   */
  private emitEvent(
    callback: TransferEventCallback | undefined,
    event: Omit<TransferEvent, "timestamp">
  ): void {
    if (callback) {
      callback({
        ...event,
        timestamp: new Date(),
      })
    }
  }

  async getStatus(): Promise<BackendStatus> {
    await this.simulateLatency(0.2)

    return {
      available: this.config.available,
      network: this.config.network,
      latencyMs: this.config.latencyMs,
      lastChecked: new Date(),
      error: this.config.available ? undefined : "Backend unavailable (mock)",
    }
  }

  async isAvailable(): Promise<boolean> {
    const status = await this.getStatus()
    return status.available
  }

  async getQuote(params: QuoteParams): Promise<Quote> {
    await this.simulateLatency(0.5)

    if (this.shouldFail()) {
      throw new Error("Mock: Failed to get quote (simulated failure)")
    }

    // Calculate mock fee (0.3% for mock)
    const feePercent = 0.3
    const feeAmount =
      (params.amount * BigInt(Math.floor(feePercent * 100))) / BigInt(10000)
    const outputAmount = params.amount - feeAmount

    // Estimate time based on privacy level
    let estimatedTimeSeconds = 2 // Base time
    if (params.privacyLevel === PrivacyLevel.SHIELDED) {
      estimatedTimeSeconds = 5
    } else if (params.privacyLevel === PrivacyLevel.COMPLIANT) {
      estimatedTimeSeconds = 4
    }

    return {
      id: `mock-quote-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      backend: this.name,
      inputAmount: params.amount,
      outputAmount,
      feeAmount,
      feePercent,
      estimatedTimeSeconds,
      expiresAt: new Date(Date.now() + 60000), // 1 minute expiry
      isValid: true,
    }
  }

  async transfer(
    params: TransferParams,
    onEvent?: TransferEventCallback
  ): Promise<TransferResult> {
    this.transferCounter++
    const transferId = this.transferCounter

    // Status: pending
    this.emitEvent(onEvent, {
      type: "status_change",
      status: "pending",
    })

    await this.simulateLatency(0.3)

    // Check for simulated failure
    if (this.shouldFail()) {
      this.emitEvent(onEvent, {
        type: "error",
        error: "Mock: Transfer failed (simulated failure)",
      })

      return {
        status: "failed",
        error: "Mock: Transfer failed (simulated failure)",
      }
    }

    // Status: signing
    this.emitEvent(onEvent, {
      type: "status_change",
      status: "signing",
    })

    await this.simulateLatency(0.5)

    // Generate mock transaction
    const txHash = this.generateTxHash()
    const stealthAddress = this.generateMockStealthAddress()
    const commitment = this.generateMockCommitment()

    // Status: confirming
    this.emitEvent(onEvent, {
      type: "status_change",
      status: "confirming",
    })

    this.emitEvent(onEvent, {
      type: "tx_submitted",
      txHash,
    })

    await this.simulateLatency(1.5)

    // Tx confirmed
    this.emitEvent(onEvent, {
      type: "tx_confirmed",
      txHash,
    })

    // Generate proof for shielded/compliant
    if (params.privacyLevel !== PrivacyLevel.TRANSPARENT) {
      await this.simulateLatency(0.8)

      this.emitEvent(onEvent, {
        type: "proof_generated",
        data: { commitment },
      })
    }

    // Status: success
    this.emitEvent(onEvent, {
      type: "status_change",
      status: "success",
    })

    // Create mock payment record for scanning
    const mockPayment: ScannedPayment = {
      id: `payment-${transferId}`,
      amount: params.amount,
      token: params.toToken,
      sender: params.sender,
      stealthAddress,
      txHash,
      timestamp: new Date(),
      claimed: false,
    }
    this.mockPayments.push(mockPayment)

    return {
      status: "success",
      txHash,
      explorerUrl: `https://explorer.solana.com/tx/${txHash}?cluster=${this.config.network}`,
      stealthAddress,
      commitment,
      viewingKey:
        params.privacyLevel === PrivacyLevel.COMPLIANT
          ? params.viewingKey
          : undefined,
      metadata: {
        transferId,
        simulatedAt: new Date().toISOString(),
      },
    }
  }

  async scanPayments(
    _viewingKey: string,
    _fromBlock?: number
  ): Promise<ScannedPayment[]> {
    await this.simulateLatency(1)

    // Return mock payments (in real impl, would filter by viewing key)
    return [...this.mockPayments]
  }

  async getBalance(_address: string): Promise<bigint> {
    await this.simulateLatency(0.3)

    // Return random mock balance
    const balanceSol = Math.random() * 10
    return BigInt(Math.floor(balanceSol * 1e9))
  }

  async generateStealthAddress(_metaAddress: string): Promise<string> {
    await this.simulateLatency(0.2)

    return this.generateMockStealthAddress()
  }

  /**
   * Add a mock payment (for testing)
   */
  addMockPayment(payment: ScannedPayment): void {
    this.mockPayments.push(payment)
  }

  /**
   * Clear all mock payments (for testing)
   */
  clearMockPayments(): void {
    this.mockPayments = []
  }

  /**
   * Update configuration
   */
  configure(config: Partial<MockBackendConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

/**
 * Default mock backend instance
 */
export const mockBackend = new MockBackend()
