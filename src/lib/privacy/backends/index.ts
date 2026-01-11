/**
 * Privacy Backend Implementations
 *
 * Export all available privacy backend implementations.
 */

// Mock backend (always available, for development)
export { MockBackend, mockBackend } from "./mock"
export type { MockBackendConfig } from "./mock"

// SIP Native backend (Pedersen + Stealth + ZK)
// TODO: #401 - export { SIPNativeBackend, sipNativeBackend } from "./sip-native"

// PrivacyCash backend (pool mixing)
export { PrivacyCashAdapter, privacyCashAdapter } from "./privacycash"
export type { PrivacyCashConfig } from "./privacycash"

// Inco backend (TEE)
export { IncoAdapter, incoAdapter } from "./inco"
export type { IncoConfig } from "./inco"

// Arcium backend (MPC)
export { ArciumAdapter, arciumAdapter } from "./arcium"
export type { ArciumConfig } from "./arcium"
