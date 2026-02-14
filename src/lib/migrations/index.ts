export { MigrationService } from "./migration-service"
export type { MigrationServiceOptions } from "./migration-service"

export { generateMigrationStealthAddress } from "./stealth-migration"
export type { StealthMigrationResult } from "./stealth-migration"

export {
  scanWallet,
  createProtocolSource,
  createManualSource,
} from "./dead-protocol-scanner"
export type { WalletScanResult } from "./dead-protocol-scanner"

export { SunriseClient } from "./sunrise-client"
export type { SunriseDepositResult, SunriseDetails } from "./sunrise-client"

export {
  DEAD_PROTOCOLS,
  SIMULATION_DELAYS,
  MAX_MIGRATION_HISTORY,
  MIGRATION_FEE_BPS,
  CARBON_OFFSET_KG_PER_SOL_PER_YEAR,
  SUNRISE_PROGRAM_ID,
  GSOL_MINT,
  estimateCarbonOffset,
  getProtocol,
  getSelectableProtocols,
} from "./constants"

export type {
  MigrationStep,
  Migration,
  MigrationSource,
  MigrationParams,
  MigrationStepChangeCallback,
  MigrationMode,
  DeadProtocol,
} from "./types"
