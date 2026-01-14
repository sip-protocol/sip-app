/**
 * LangChain Privacy Advisor
 *
 * Production advisor using LangChain + OpenAI for intelligent responses.
 */

import {
  AdvisorProvider,
  AdvisorMessage,
  AdvisorContext,
  AdvisorResponse,
  AdvisorRecommendation,
  WalletAnalysis,
  AdvisorConfig,
  createAdvisorMessage,
} from "./types"
import { DEFAULT_ADVISOR_CONFIG, PRIVACY_ADVISOR_SYSTEM_PROMPT } from "./index"

/** LangChain message format */
interface LangChainMessage {
  role: "system" | "user" | "assistant"
  content: string
}

/** Convert our messages to LangChain format */
function toLangChainMessages(
  messages: AdvisorMessage[],
  systemPrompt: string
): LangChainMessage[] {
  const lcMessages: LangChainMessage[] = [
    { role: "system", content: systemPrompt },
  ]

  for (const msg of messages) {
    if (msg.role === "user") {
      lcMessages.push({ role: "user", content: msg.content })
    } else if (msg.role === "advisor") {
      lcMessages.push({ role: "assistant", content: msg.content })
    }
  }

  return lcMessages
}

/** Add context to the last user message */
function addContextToMessages(
  messages: LangChainMessage[],
  context?: AdvisorContext
): LangChainMessage[] {
  if (!context) return messages

  const contextParts: string[] = []

  if (context.walletAddress) {
    contextParts.push(`Current wallet: ${context.walletAddress}`)
  }
  if (context.currentPrivacyScore !== undefined) {
    contextParts.push(
      `Current privacy score: ${context.currentPrivacyScore}/100`
    )
  }
  if (context.breakdown) {
    contextParts.push(`Score breakdown: ${JSON.stringify(context.breakdown)}`)
  }

  if (contextParts.length === 0) return messages

  // Find the last user message and append context
  const result = [...messages]
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i].role === "user") {
      result[i] = {
        ...result[i],
        content: `${result[i].content}\n\n[Context: ${contextParts.join(", ")}]`,
      }
      break
    }
  }

  return result
}

/** LangChain-based Privacy Advisor */
export class LangChainAdvisor implements AdvisorProvider {
  readonly name = "langchain"
  private config: AdvisorConfig
  private apiKey: string

  constructor(apiKey: string, config: Partial<AdvisorConfig> = {}) {
    this.apiKey = apiKey
    this.config = { ...DEFAULT_ADVISOR_CONFIG, ...config }
  }

  async chat(
    messages: AdvisorMessage[],
    context?: AdvisorContext
  ): Promise<AdvisorResponse> {
    const systemPrompt =
      this.config.systemPrompt || PRIVACY_ADVISOR_SYSTEM_PROMPT

    let lcMessages = toLangChainMessages(messages, systemPrompt)
    lcMessages = addContextToMessages(lcMessages, context)

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: lcMessages,
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenAI API error: ${error}`)
      }

      const data = await response.json()
      const content =
        data.choices?.[0]?.message?.content ||
        "I apologize, I couldn't generate a response."

      // Extract recommendations if the response contains analysis
      const recommendations = this.extractRecommendations(content)

      return {
        message: createAdvisorMessage(content, {
          walletAddress: context?.walletAddress,
          privacyScore: context?.currentPrivacyScore,
          recommendations:
            recommendations.length > 0 ? recommendations : undefined,
        }),
        recommendations:
          recommendations.length > 0 ? recommendations : undefined,
      }
    } catch (error) {
      console.error("LangChain advisor error:", error)
      return {
        message: createAdvisorMessage(
          "I'm having trouble connecting to the AI service. Please try again in a moment.",
          { error: error instanceof Error ? error.message : "Unknown error" }
        ),
      }
    }
  }

  async analyzeWallet(address: string): Promise<WalletAnalysis> {
    // For real analysis, we would call the privacy-score API
    // For now, generate a mock analysis and enhance with LLM
    const messages: AdvisorMessage[] = [
      {
        id: "analyze",
        role: "user",
        content: `Analyze the privacy exposure of wallet ${address}. Provide a detailed breakdown.`,
        timestamp: new Date(),
      },
    ]

    // TODO: Parse response into structured format using tool calls
    const _response = await this.chat(messages, { walletAddress: address })

    // For now, return mock data - in production we'd extract from _response
    return {
      address,
      overallScore: 50, // Would be extracted from actual analysis
      riskLevel: "medium",
      breakdown: {
        addressReuse: 10,
        clusterExposure: 15,
        exchangeExposure: 10,
        temporalPatterns: 8,
        socialLinks: 7,
      },
      findings: [],
    }
  }

  async getRecommendations(
    analysis: WalletAnalysis
  ): Promise<AdvisorRecommendation[]> {
    const messages: AdvisorMessage[] = [
      {
        id: "recommend",
        role: "user",
        content: `Based on this wallet analysis, what are the top 3-5 recommendations to improve privacy?

Analysis:
- Overall Score: ${analysis.overallScore}/100
- Risk Level: ${analysis.riskLevel}
- Address Reuse: ${analysis.breakdown.addressReuse}/25
- Cluster Exposure: ${analysis.breakdown.clusterExposure}/25
- Exchange Exposure: ${analysis.breakdown.exchangeExposure}/20
- Temporal Patterns: ${analysis.breakdown.temporalPatterns}/15
- Social Links: ${analysis.breakdown.socialLinks}/15`,
        timestamp: new Date(),
      },
    ]

    const response = await this.chat(messages)
    return response.recommendations || []
  }

  /** Extract recommendations from response text */
  private extractRecommendations(content: string): AdvisorRecommendation[] {
    // Simple extraction - in production would use structured output
    const recommendations: AdvisorRecommendation[] = []

    // Look for numbered recommendations
    const lines = content.split("\n")
    let currentRec: Partial<AdvisorRecommendation> | null = null

    for (const line of lines) {
      const numMatch = line.match(/^(\d+)\.\s+\*\*([^*]+)\*\*/)
      if (numMatch) {
        if (currentRec && currentRec.title) {
          recommendations.push({
            id: `rec_${recommendations.length}`,
            priority: "medium",
            category: "general",
            title: currentRec.title,
            description: currentRec.description || "",
            action: currentRec.action || "Take action",
            potentialGain: 10,
            ...currentRec,
          } as AdvisorRecommendation)
        }
        currentRec = { title: numMatch[2].trim() }
      } else if (currentRec && line.trim() && !line.startsWith("#")) {
        currentRec.description =
          (currentRec.description || "") + line.trim() + " "
      }
    }

    // Add last recommendation
    if (currentRec && currentRec.title) {
      recommendations.push({
        id: `rec_${recommendations.length}`,
        priority: "medium",
        category: "general",
        title: currentRec.title,
        description: currentRec.description?.trim() || "",
        action: "Take action",
        potentialGain: 10,
      })
    }

    return recommendations.slice(0, 5)
  }
}

/** Create a LangChain advisor if API key is available */
export function createLangChainAdvisor(
  config?: Partial<AdvisorConfig>
): LangChainAdvisor | null {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.warn("OPENAI_API_KEY not set, LangChain advisor unavailable")
    return null
  }

  return new LangChainAdvisor(apiKey, config)
}
