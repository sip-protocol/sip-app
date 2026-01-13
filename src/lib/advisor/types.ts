/**
 * Privacy Advisor Agent Types
 *
 * Type definitions for the LangChain-powered privacy recommendation system.
 */

/** Chat message roles */
export type MessageRole = "user" | "advisor" | "system"

/** Message in the advisor chat */
export interface AdvisorMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  metadata?: MessageMetadata
}

/** Optional metadata attached to messages */
export interface MessageMetadata {
  walletAddress?: string
  privacyScore?: number
  recommendations?: AdvisorRecommendation[]
  toolCalls?: ToolCall[]
  error?: string
}

/** Tool call made by the advisor */
export interface ToolCall {
  name: string
  input: Record<string, unknown>
  output?: string
}

/** Privacy recommendation from the advisor */
export interface AdvisorRecommendation {
  id: string
  priority: "critical" | "high" | "medium" | "low"
  category: AdvisorCategory
  title: string
  description: string
  action: string
  potentialGain: number
  sipFeature?: SIPFeature
}

/** Categories of privacy advice */
export type AdvisorCategory =
  | "address_reuse"
  | "cluster_exposure"
  | "exchange_exposure"
  | "temporal_patterns"
  | "social_links"
  | "general"

/** SIP features that can help */
export type SIPFeature =
  | "stealth_addresses"
  | "pedersen_commitments"
  | "viewing_keys"
  | "private_swap"

/** Configuration for the advisor */
export interface AdvisorConfig {
  /** Model to use (e.g., 'gpt-4o-mini') */
  model?: string
  /** Temperature for responses (0-1) */
  temperature?: number
  /** Maximum tokens in response */
  maxTokens?: number
  /** System prompt override */
  systemPrompt?: string
}

/** Advisor provider interface */
export interface AdvisorProvider {
  /** Provider name */
  readonly name: string

  /** Send a message and get a response */
  chat(
    messages: AdvisorMessage[],
    context?: AdvisorContext
  ): Promise<AdvisorResponse>

  /** Analyze a wallet and provide recommendations */
  analyzeWallet(address: string): Promise<WalletAnalysis>

  /** Get recommendations based on analysis */
  getRecommendations(analysis: WalletAnalysis): Promise<AdvisorRecommendation[]>
}

/** Context provided to the advisor */
export interface AdvisorContext {
  walletAddress?: string
  currentPrivacyScore?: number
  breakdown?: Record<string, number>
}

/** Response from the advisor */
export interface AdvisorResponse {
  message: AdvisorMessage
  recommendations?: AdvisorRecommendation[]
  suggestedActions?: string[]
}

/** Wallet analysis result */
export interface WalletAnalysis {
  address: string
  overallScore: number
  riskLevel: "critical" | "high" | "medium" | "low"
  breakdown: {
    addressReuse: number
    clusterExposure: number
    exchangeExposure: number
    temporalPatterns: number
    socialLinks: number
  }
  findings: AnalysisFinding[]
}

/** Individual finding from wallet analysis */
export interface AnalysisFinding {
  category: AdvisorCategory
  severity: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  evidence?: string
}

/** Labels for categories */
export const CATEGORY_LABELS: Record<AdvisorCategory, string> = {
  address_reuse: "Address Reuse",
  cluster_exposure: "Cluster Exposure",
  exchange_exposure: "Exchange Exposure",
  temporal_patterns: "Temporal Patterns",
  social_links: "Social Links",
  general: "General",
}

/** Labels for SIP features */
export const SIP_FEATURE_LABELS: Record<SIPFeature, string> = {
  stealth_addresses: "Stealth Addresses",
  pedersen_commitments: "Pedersen Commitments",
  viewing_keys: "Viewing Keys",
  private_swap: "Private Swap",
}

/** Generate a unique message ID */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/** Create a user message */
export function createUserMessage(content: string): AdvisorMessage {
  return {
    id: generateMessageId(),
    role: "user",
    content,
    timestamp: new Date(),
  }
}

/** Create an advisor message */
export function createAdvisorMessage(
  content: string,
  metadata?: MessageMetadata
): AdvisorMessage {
  return {
    id: generateMessageId(),
    role: "advisor",
    content,
    timestamp: new Date(),
    metadata,
  }
}
