/**
 * SIP App Library
 *
 * Re-exports utility functions and modules.
 */

// Utility functions
export * from "./utils"

// Privacy backend module
export * from "./privacy"

// Logger
export { logger } from "./logger"

// Network configuration
export {
  NETWORKS,
  TOKENS,
  getNetwork,
  getAllNetworks,
  getTokensForNetwork,
  getToken,
  getTransactionUrl,
  getAddressUrl,
  formatAmount,
  parseAmount,
  type NetworkId,
  type NetworkConfig,
  type TokenConfig,
} from "./networks"

// Price service
export {
  getUSDPrices,
  getExchangeRate,
  getExchangeRateSync,
  isCacheFresh,
  refreshPrices,
  clearPriceCache,
} from "./prices"

// SIP SDK client
export {
  createSIPClientAsync,
  getSIPClientAsync,
  getInitializedSIPClient,
  getProofProvider,
  resetSIPClient,
  isRealSwapsEnabled,
  getNearIntentsJwt,
  getSDK,
  preloadSDK,
  isSDKLoaded,
} from "./sip-client"

// Wallet deposit utilities
export {
  sendDeposit,
  createDepositCallback,
  type DepositParams,
  type DepositResult,
} from "./wallet-deposit"

// Zcash validation
export {
  validateZcashAddress,
  isShieldedAddress,
  getAddressTypeLabel,
  getPrivacyColorClass,
  type ZcashAddressType,
  type ZcashValidationResult,
} from "./zcash-validation"

// Price impact calculations
export {
  calculatePriceImpact,
  getImpactColorClass,
  getImpactBgClass,
  formatImpact,
  type PriceImpact,
  type PriceImpactSeverity,
} from "./price-impact"

// Error messages
export {
  parseError,
  getErrorMessage,
  getErrorTitle,
  ERROR_MESSAGES,
  type ErrorCode,
  type ErrorAction,
  type ErrorInfo,
} from "./error-messages"

// Constants
export {
  SDK_VERSION,
  TEST_COUNTS,
  PROJECT_STATUS,
  ACHIEVEMENTS,
  DEPLOYMENTS,
} from "./constants"
