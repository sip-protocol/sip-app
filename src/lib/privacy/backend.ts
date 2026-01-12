/**
 * PrivacyBackend Interface
 *
 * Abstract interface for privacy backends. Implementations provide
 * different privacy mechanisms:
 *
 * - SIP Native: Pedersen commitments + stealth addresses + ZK proofs
 * - PrivacyCash: Pool mixing (Tornado-style)
 * - Inco: Fully Homomorphic Encryption (FHE) + TEE
 * - Arcium: Multi-Party Computation (MPC)
 *
 * This abstraction enables:
 * 1. Users to choose their preferred privacy backend
 * 2. SmartRouter to auto-select optimal backend
 * 3. Easy integration of new privacy technologies
 *
 * @see https://github.com/sip-protocol/sip-protocol/issues/483
 */

import type {
  BackendName,
  BackendFeatures,
  BackendStatus,
  Quote,
  QuoteParams,
  TransferParams,
  TransferResult,
  ScannedPayment,
  TransferEventCallback,
} from "./types"

/**
 * Privacy Backend Interface
 *
 * All privacy backends must implement this interface to be compatible
 * with SIP's privacy abstraction layer.
 */
export interface PrivacyBackend {
  /**
   * Unique identifier for this backend
   */
  readonly name: BackendName

  /**
   * Human-readable display name
   */
  readonly displayName: string

  /**
   * Short description of this backend's privacy approach
   */
  readonly description: string

  /**
   * Features supported by this backend
   */
  readonly features: BackendFeatures

  /**
   * Check if this backend is available and healthy
   *
   * @returns Backend status including availability and latency
   */
  getStatus(): Promise<BackendStatus>

  /**
   * Check if this backend is available (convenience method)
   *
   * @returns true if the backend is available and operational
   */
  isAvailable(): Promise<boolean>

  /**
   * Get a quote for a private transfer
   *
   * @param params - Quote parameters
   * @returns Quote with estimated fees and timing
   */
  getQuote(params: QuoteParams): Promise<Quote>

  /**
   * Execute a private transfer
   *
   * @param params - Transfer parameters
   * @param onEvent - Optional callback for transfer events
   * @returns Transfer result with transaction details
   */
  transfer(
    params: TransferParams,
    onEvent?: TransferEventCallback
  ): Promise<TransferResult>

  /**
   * Scan for incoming payments using a viewing key
   *
   * Only available for backends that support viewing keys.
   *
   * @param viewingKey - Viewing key to scan with
   * @param fromBlock - Optional starting block number
   * @returns Array of scanned payments
   */
  scanPayments?(
    viewingKey: string,
    fromBlock?: number
  ): Promise<ScannedPayment[]>

  /**
   * Get the balance of a stealth address
   *
   * Only available for certain backends.
   *
   * @param address - Address to check
   * @returns Balance in base units
   */
  getBalance?(address: string): Promise<bigint>

  /**
   * Generate a stealth address for receiving payments
   *
   * Only available for backends that support stealth addresses.
   *
   * @param metaAddress - SIP meta-address (spending + viewing public keys)
   * @returns One-time stealth address
   */
  generateStealthAddress?(metaAddress: string): Promise<string>
}

/**
 * Backend registry for managing multiple backends
 */
export class BackendRegistry {
  private backends: Map<BackendName, PrivacyBackend> = new Map()
  private defaultBackend: BackendName = "mock"

  /**
   * Register a privacy backend
   *
   * @param backend - Backend instance to register
   */
  register(backend: PrivacyBackend): void {
    this.backends.set(backend.name, backend)
  }

  /**
   * Unregister a privacy backend
   *
   * @param name - Backend name to unregister
   */
  unregister(name: BackendName): void {
    this.backends.delete(name)
  }

  /**
   * Get a specific backend by name
   *
   * @param name - Backend name
   * @returns Backend instance or undefined
   */
  get(name: BackendName): PrivacyBackend | undefined {
    return this.backends.get(name)
  }

  /**
   * Get all registered backends
   *
   * @returns Array of all registered backends
   */
  getAll(): PrivacyBackend[] {
    return Array.from(this.backends.values())
  }

  /**
   * Get all available (healthy) backends
   *
   * @returns Array of available backends
   */
  async getAvailable(): Promise<PrivacyBackend[]> {
    const backends = this.getAll()
    const available: PrivacyBackend[] = []

    for (const backend of backends) {
      try {
        if (await backend.isAvailable()) {
          available.push(backend)
        }
      } catch {
        // Backend not available, skip
      }
    }

    return available
  }

  /**
   * Set the default backend
   *
   * @param name - Backend name to set as default
   */
  setDefault(name: BackendName): void {
    if (!this.backends.has(name)) {
      throw new Error(`Backend '${name}' is not registered`)
    }
    this.defaultBackend = name
  }

  /**
   * Get the default backend
   *
   * @returns Default backend instance
   */
  getDefault(): PrivacyBackend {
    const backend = this.backends.get(this.defaultBackend)
    if (!backend) {
      throw new Error(
        `Default backend '${this.defaultBackend}' is not registered`
      )
    }
    return backend
  }

  /**
   * Check if a backend is registered
   *
   * @param name - Backend name
   * @returns true if the backend is registered
   */
  has(name: BackendName): boolean {
    return this.backends.has(name)
  }

  /**
   * Get the number of registered backends
   */
  get size(): number {
    return this.backends.size
  }
}

/**
 * Global backend registry instance
 */
export const backendRegistry = new BackendRegistry()

/**
 * Helper function to get the best available backend
 *
 * Selection priority:
 * 1. SIP Native (if available) - best privacy guarantees
 * 2. Arcium - MPC security model
 * 3. Inco - FHE encryption
 * 4. PrivacyCash - pool mixing
 * 5. Mock - development only
 *
 * @param requireViewingKeys - If true, only return backends with viewing key support
 * @returns Best available backend
 */
export async function getBestBackend(
  requireViewingKeys = false
): Promise<PrivacyBackend> {
  const priority: BackendName[] = [
    "sip-native",
    "arcium",
    "inco",
    "privacycash",
    "mock",
  ]

  const available = await backendRegistry.getAvailable()

  for (const name of priority) {
    const backend = available.find((b) => b.name === name)
    if (backend) {
      if (requireViewingKeys && !backend.features.viewingKeys) {
        continue
      }
      return backend
    }
  }

  throw new Error("No privacy backend available")
}

/**
 * Helper function to get backend by features
 *
 * @param features - Required features
 * @returns First backend matching all required features
 */
export async function getBackendByFeatures(
  features: Partial<BackendFeatures>
): Promise<PrivacyBackend | undefined> {
  const available = await backendRegistry.getAvailable()

  return available.find((backend) => {
    const bf = backend.features
    if (
      features.amountHiding !== undefined &&
      bf.amountHiding !== features.amountHiding
    ) {
      return false
    }
    if (
      features.recipientHiding !== undefined &&
      bf.recipientHiding !== features.recipientHiding
    ) {
      return false
    }
    if (
      features.viewingKeys !== undefined &&
      bf.viewingKeys !== features.viewingKeys
    ) {
      return false
    }
    if (
      features.sameChainOnly !== undefined &&
      bf.sameChainOnly !== features.sameChainOnly
    ) {
      return false
    }
    return true
  })
}
