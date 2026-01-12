/**
 * Privacy Backend Module
 *
 * Unified privacy abstraction layer for SIP Protocol.
 * Supports multiple privacy backends:
 *
 * - SIP Native: Pedersen commitments + stealth addresses + ZK proofs
 * - PrivacyCash: Pool mixing (Tornado-style)
 * - Inco: Fully Homomorphic Encryption (FHE) + TEE
 * - Arcium: Multi-Party Computation (MPC)
 *
 * @example
 * ```typescript
 * import { backendRegistry, mockBackend, getBestBackend } from "@/lib/privacy"
 *
 * // Register backends
 * backendRegistry.register(mockBackend)
 *
 * // Get best available backend
 * const backend = await getBestBackend()
 *
 * // Execute private transfer
 * const result = await backend.transfer({
 *   fromToken: TOKENS.SOL,
 *   toToken: TOKENS.SOL,
 *   amount: BigInt(1e9), // 1 SOL
 *   privacyLevel: PrivacyLevel.SHIELDED,
 *   sender: "...",
 *   recipient: "sip:solana:...",
 * })
 * ```
 *
 * @see https://github.com/sip-protocol/sip-protocol/issues/483
 */

// Types
export type {
  BackendName,
  TokenInfo,
  BackendFeatures,
  QuoteParams,
  Quote,
  TransferParams,
  TransferStatus,
  TransferResult,
  ScannedPayment,
  BackendStatus,
  TransferEvent,
  TransferEventCallback,
} from "./types"

export { TOKENS } from "./types"

// Backend interface and registry
export type { PrivacyBackend } from "./backend"
export {
  BackendRegistry,
  backendRegistry,
  getBestBackend,
  getBackendByFeatures,
} from "./backend"

// Backend implementations
export { MockBackend, mockBackend } from "./backends"
export type { MockBackendConfig } from "./backends"

/**
 * Initialize the privacy module with default backends
 *
 * Call this at app startup to register all available backends.
 */
export async function initializePrivacy(): Promise<void> {
  // Dynamic imports to avoid circular dependencies
  const [{ backendRegistry }, { mockBackend }] = await Promise.all([
    import("./backend"),
    import("./backends/mock"),
  ])

  // Always register mock backend for development
  if (!backendRegistry.has("mock")) {
    backendRegistry.register(mockBackend)
  }

  // Set default backend based on environment
  if (process.env.NODE_ENV === "development") {
    backendRegistry.setDefault("mock")
  }

  // TODO: Register real backends when available
  // if (sipNativeBackend) backendRegistry.register(sipNativeBackend)
  // if (privacyCashBackend) backendRegistry.register(privacyCashBackend)
  // if (incoBackend) backendRegistry.register(incoBackend)
  // if (arciumBackend) backendRegistry.register(arciumBackend)
}
