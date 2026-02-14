import type { DeadProtocol, MigrationStep } from "./types"

export const SUNRISE_PROGRAM_ID = "sunzv8N3A8dRHwUBvxgRDEbWKk8t7yiHR4FLRgFsTX6"
export const GSOL_MINT = "gso1xA56hacfgTHTF4F7wN5r4jbnJsKh99vR595uybA"

export const DEAD_PROTOCOLS: DeadProtocol[] = [
  {
    id: "saber",
    name: "Saber",
    icon: "/protocols/saber.png",
    description: "Stablecoin DEX — deprecated, low liquidity",
    status: "inactive",
    category: "defi",
  },
  {
    id: "raydium-legacy",
    name: "Raydium Legacy Pools",
    icon: "/protocols/raydium.png",
    description: "Legacy liquidity pools with stranded tokens",
    status: "deprecated",
    category: "defi",
  },
  {
    id: "solend-v1",
    name: "Solend v1",
    icon: "/protocols/solend.png",
    description: "Original lending pools — migrated to Save",
    status: "deprecated",
    category: "defi",
  },
  {
    id: "port-finance",
    name: "Port Finance",
    icon: "/protocols/port.png",
    description: "Lending protocol — ceased operations",
    status: "dead",
    category: "defi",
  },
  {
    id: "jet-protocol-v1",
    name: "Jet Protocol v1",
    icon: "/protocols/jet.png",
    description: "Lending protocol — migrated to v2, v1 deprecated",
    status: "deprecated",
    category: "defi",
  },
  {
    id: "mercurial",
    name: "Mercurial Finance",
    icon: "/protocols/mercurial.png",
    description: "Stablecoin AMM — merged into Meteora",
    status: "dead",
    category: "defi",
  },
  {
    id: "manual",
    name: "Manual SOL Entry",
    icon: "",
    description: "Enter SOL amount directly from your wallet",
    status: "inactive",
    category: "other",
  },
]

export const SIMULATION_DELAYS: Record<MigrationStep, number> = {
  scanning_wallet: 1200,
  generating_stealth: 1500,
  withdrawing_from_source: 2000,
  depositing_to_sunrise: 2500,
  complete: 0,
  failed: 0,
}

export const MAX_MIGRATION_HISTORY = 50

export const MIGRATION_FEE_BPS = 10

// ~0.012 kg CO2 offset per SOL staked per year (estimated)
export const CARBON_OFFSET_KG_PER_SOL_PER_YEAR = 0.012

export function estimateCarbonOffset(solAmount: number): number {
  return solAmount * CARBON_OFFSET_KG_PER_SOL_PER_YEAR
}

export function getProtocol(id: string): DeadProtocol | undefined {
  return DEAD_PROTOCOLS.find((p) => p.id === id)
}

export function getSelectableProtocols(): DeadProtocol[] {
  return DEAD_PROTOCOLS.filter((p) => p.id !== "manual")
}
