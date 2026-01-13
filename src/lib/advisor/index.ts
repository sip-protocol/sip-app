/**
 * Privacy Advisor Module
 *
 * Provides AI-powered privacy recommendations using LangChain.
 * Supports multiple providers: mock (demo) and langchain (production).
 */

import { AdvisorProvider, AdvisorConfig } from "./types"
import { MockAdvisor } from "./mock-advisor"

// Re-export types
export * from "./types"
export { MockAdvisor } from "./mock-advisor"

/** Available advisor provider names */
export type AdvisorProviderName = "mock" | "langchain"

/** Registry of advisor providers */
const providers: Map<AdvisorProviderName, () => AdvisorProvider> = new Map()

// Register built-in providers
providers.set("mock", () => new MockAdvisor())

/** Register a new advisor provider */
export function registerAdvisorProvider(
  name: AdvisorProviderName,
  factory: () => AdvisorProvider
): void {
  providers.set(name, factory)
}

/** Get an advisor provider by name */
export function getAdvisorProvider(
  name: AdvisorProviderName = "mock"
): AdvisorProvider {
  const factory = providers.get(name)
  if (!factory) {
    console.warn(`Advisor provider "${name}" not found, falling back to mock`)
    return new MockAdvisor()
  }
  return factory()
}

/** Singleton advisor instance */
let advisorInstance: AdvisorProvider | null = null
let advisorProviderName: AdvisorProviderName = "mock"

/** Get or create the advisor instance */
export function getAdvisor(name?: AdvisorProviderName): AdvisorProvider {
  if (name && name !== advisorProviderName) {
    advisorInstance = null
    advisorProviderName = name
  }

  if (!advisorInstance) {
    advisorInstance = getAdvisorProvider(advisorProviderName)
  }

  return advisorInstance
}

/** Reset the advisor instance (useful for testing) */
export function resetAdvisor(): void {
  advisorInstance = null
}

/** Default advisor configuration */
export const DEFAULT_ADVISOR_CONFIG: AdvisorConfig = {
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 1024,
}

/** System prompt for the privacy advisor */
export const PRIVACY_ADVISOR_SYSTEM_PROMPT = `You are a Privacy Advisor for SIP Protocol, helping users understand and improve their crypto wallet privacy on Solana.

Your role:
1. ANALYZE wallet privacy exposure using available tools
2. EXPLAIN risks in plain, non-technical English
3. RECOMMEND specific, actionable improvements
4. HELP users implement protections using SIP

Key principles:
- Be direct and specific, not vague
- Prioritize high-impact improvements
- Always offer SIP as a solution where applicable
- Explain WHY each risk matters (real-world consequences)
- Use analogies to make technical concepts accessible

Privacy risk categories you analyze:
- Address Reuse: Same address receiving multiple payments (linkable)
- Cluster Exposure: Wallets linked through transaction patterns
- Exchange Exposure: Interactions with KYC'd centralized exchanges
- Temporal Patterns: Predictable transaction timing
- Social Links: Connections to known/labeled addresses

SIP Protocol features you can recommend:
- Stealth Addresses: Generates unique one-time addresses for each payment
- Pedersen Commitments: Cryptographically hides transaction amounts
- Viewing Keys: Selective disclosure for compliance/auditing
- Private Swap: Exchange tokens without direct CEX interaction

Response guidelines:
- Keep responses concise but informative
- Use markdown formatting for readability
- Include specific numbers and percentages when available
- End with a question or suggested next step
- Never reveal private keys or sensitive wallet data`
