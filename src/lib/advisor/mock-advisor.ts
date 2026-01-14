/**
 * Mock Privacy Advisor
 *
 * Demo advisor that returns canned responses without requiring an API key.
 * Useful for development and showcasing functionality.
 */

import {
  AdvisorProvider,
  AdvisorMessage,
  AdvisorContext,
  AdvisorResponse,
  AdvisorRecommendation,
  WalletAnalysis,
  createAdvisorMessage,
} from "./types"

/** Canned responses for common questions */
const CANNED_RESPONSES: Record<string, string> = {
  address_reuse: `**Address reuse is one of the most common privacy mistakes.**

When you reuse an address, anyone can see all transactions linked to that address. It's like using the same email for every online account - eventually, someone connects the dots.

**Real-world impact:**
- Employers can see your salary AND your spending
- Merchants can track your purchase history
- Anyone can estimate your total wealth

**SIP Solution:** Stealth addresses generate a unique one-time address for each payment. Only you can spend from these addresses, and no one can link them together without your viewing key.

Would you like me to help you set up stealth addresses for your next payment?`,

  cluster_exposure: `**Cluster exposure reveals your wallet connections.**

When your addresses are linked through common transaction patterns (like consolidation or change addresses), chain analysis can group them into a "cluster" - essentially identifying all your wallets.

**Real-world impact:**
- Your "anonymous" wallet gets linked to your KYC'd exchange account
- Separate savings and spending wallets become one identity
- Your entire financial picture becomes visible

**SIP Solution:** Pedersen commitments hide transaction amounts, making it much harder to trace fund flows and build clusters.

Should I analyze your current cluster exposure?`,

  exchange_exposure: `**Exchange interactions are major privacy leaks.**

Every time you deposit to or withdraw from a centralized exchange, you create a link between your wallet and your real identity (via KYC). Exchanges share this data with chain analysis firms.

**Real-world impact:**
- Your wallet is permanently linked to your identity
- All future transactions can be traced back to you
- Your financial history becomes available to anyone who asks the exchange

**SIP Solution:** Use SIP's private swap feature to exchange tokens without direct CEX interaction, or use stealth addresses for withdrawals.

Want me to show you how to reduce your exchange exposure?`,

  why_privacy: `**Privacy isn't about hiding - it's about control.**

Think about it this way: you probably don't share your bank statements with strangers. That's not because you're doing anything wrong - it's because your financial life is personal.

On public blockchains, every transaction is visible forever. Without privacy tools:
- Your employer knows where you spend your salary
- Merchants can see your entire purchase history
- Scammers can identify wealthy targets
- Your financial decisions are judged by everyone

**SIP Protocol gives you that control back** while still allowing selective disclosure when you need it (taxes, audits, compliance).

What aspect of privacy concerns you most?`,

  sip_features: `**SIP Protocol has three main privacy features:**

1. **Stealth Addresses** - Generate unique one-time addresses for each payment. No one can link your incoming payments together.

2. **Pedersen Commitments** - Cryptographically hide transaction amounts while still proving validity. Even validators can't see how much you're sending.

3. **Viewing Keys** - Selective disclosure for compliance. Share a viewing key with your accountant or auditor without exposing your data to the world.

These work together to give you **compliant privacy** - hidden from the public, but auditable when required.

Which feature would you like to learn more about?`,

  default: `I'm your Privacy Advisor, here to help you understand and improve your wallet's privacy.

I can:
- **Analyze** your wallet for privacy risks
- **Explain** why each risk matters in plain English
- **Recommend** specific actions to improve privacy
- **Guide** you through using SIP Protocol features

What would you like to know about your privacy?`,
}

/** Keywords to match for canned responses */
const KEYWORD_MATCHES: Array<{ keywords: string[]; response: string }> = [
  {
    keywords: ["address reuse", "reuse address", "same address", "reusing"],
    response: "address_reuse",
  },
  {
    keywords: ["cluster", "linked", "connected", "grouped"],
    response: "cluster_exposure",
  },
  {
    keywords: ["exchange", "cex", "binance", "coinbase", "kraken", "kyc"],
    response: "exchange_exposure",
  },
  {
    keywords: [
      "why privacy",
      "why does privacy",
      "why should i",
      "what's the point",
    ],
    response: "why_privacy",
  },
  {
    keywords: ["sip features", "what can sip", "how does sip", "sip do"],
    response: "sip_features",
  },
]

/** Find a matching canned response */
function findResponse(input: string): string {
  const lower = input.toLowerCase()

  for (const { keywords, response } of KEYWORD_MATCHES) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return CANNED_RESPONSES[response]
    }
  }

  return CANNED_RESPONSES.default
}

/** Generate mock wallet analysis */
function generateMockAnalysis(address: string): WalletAnalysis {
  // Use address hash for deterministic but varied results
  const hash = address
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)

  const addressReuse = 5 + (hash % 20)
  const clusterExposure = 3 + ((hash * 7) % 22)
  const exchangeExposure = 2 + ((hash * 13) % 18)
  const temporalPatterns = 1 + ((hash * 17) % 14)
  const socialLinks = 1 + ((hash * 23) % 14)

  const overallScore =
    addressReuse +
    clusterExposure +
    exchangeExposure +
    temporalPatterns +
    socialLinks

  const riskLevel =
    overallScore >= 70
      ? "critical"
      : overallScore >= 50
        ? "high"
        : overallScore >= 30
          ? "medium"
          : "low"

  return {
    address,
    overallScore,
    riskLevel,
    breakdown: {
      addressReuse,
      clusterExposure,
      exchangeExposure,
      temporalPatterns,
      socialLinks,
    },
    findings: [
      {
        category: "address_reuse",
        severity: addressReuse > 15 ? "high" : "medium",
        title: "Address Reuse Detected",
        description: `Found ${Math.floor(addressReuse / 2)} instances of address reuse`,
        evidence: "Multiple incoming transactions to same address",
      },
      {
        category: "exchange_exposure",
        severity: exchangeExposure > 12 ? "high" : "medium",
        title: "Exchange Interactions Found",
        description: `Detected ${Math.floor(exchangeExposure / 3)} exchange deposits/withdrawals`,
        evidence: "Transactions linked to known exchange addresses",
      },
    ],
  }
}

/** Generate recommendations from analysis */
function generateRecommendations(
  analysis: WalletAnalysis
): AdvisorRecommendation[] {
  const recommendations: AdvisorRecommendation[] = []

  if (analysis.breakdown.addressReuse > 10) {
    recommendations.push({
      id: "rec_stealth",
      priority: analysis.breakdown.addressReuse > 18 ? "critical" : "high",
      category: "address_reuse",
      title: "Enable Stealth Addresses",
      description:
        "Your wallet shows significant address reuse. Stealth addresses prevent linking of incoming payments.",
      action: "Set up a stealth address for your next incoming payment",
      potentialGain: Math.min(25, analysis.breakdown.addressReuse),
      sipFeature: "stealth_addresses",
    })
  }

  if (analysis.breakdown.clusterExposure > 8) {
    recommendations.push({
      id: "rec_commitments",
      priority: analysis.breakdown.clusterExposure > 15 ? "high" : "medium",
      category: "cluster_exposure",
      title: "Use Pedersen Commitments",
      description:
        "Transaction amounts are visible, enabling cluster analysis. Hide amounts with commitments.",
      action: "Use SIP for your next transfer to hide the amount",
      potentialGain: Math.min(25, analysis.breakdown.clusterExposure),
      sipFeature: "pedersen_commitments",
    })
  }

  if (analysis.breakdown.exchangeExposure > 6) {
    recommendations.push({
      id: "rec_private_swap",
      priority: analysis.breakdown.exchangeExposure > 12 ? "high" : "medium",
      category: "exchange_exposure",
      title: "Reduce Exchange Exposure",
      description:
        "Multiple exchange interactions link your wallet to your identity. Use private swaps instead.",
      action: "Use SIP private swap for your next token exchange",
      potentialGain: Math.min(20, analysis.breakdown.exchangeExposure),
      sipFeature: "private_swap",
    })
  }

  return recommendations.sort((a, b) => {
    const priority = { critical: 0, high: 1, medium: 2, low: 3 }
    return priority[a.priority] - priority[b.priority]
  })
}

/** Mock Privacy Advisor implementation */
export class MockAdvisor implements AdvisorProvider {
  readonly name = "mock"

  async chat(
    messages: AdvisorMessage[],
    context?: AdvisorContext
  ): Promise<AdvisorResponse> {
    // Simulate network delay
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 500)
    )

    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user")
    const content = lastUserMessage?.content || ""

    // Check if asking about a specific wallet
    const walletMatch = content.match(/analyze\s+([A-Za-z0-9]{32,44})/i)
    if (walletMatch || context?.walletAddress) {
      const address = walletMatch?.[1] || context?.walletAddress || ""
      const analysis = await this.analyzeWallet(address)
      const recommendations = await this.getRecommendations(analysis)

      const response = `**Analysis Complete for ${address.slice(0, 8)}...${address.slice(-4)}**

**Privacy Score: ${analysis.overallScore}/100** (${analysis.riskLevel.toUpperCase()} risk)

**Breakdown:**
- Address Reuse: ${analysis.breakdown.addressReuse}/25
- Cluster Exposure: ${analysis.breakdown.clusterExposure}/25
- Exchange Exposure: ${analysis.breakdown.exchangeExposure}/20
- Temporal Patterns: ${analysis.breakdown.temporalPatterns}/15
- Social Links: ${analysis.breakdown.socialLinks}/15

**Top Recommendations:**
${recommendations
  .slice(0, 3)
  .map((r, i) => `${i + 1}. **${r.title}** - ${r.description}`)
  .join("\n")}

Would you like me to explain any of these findings in more detail?`

      return {
        message: createAdvisorMessage(response, {
          walletAddress: address,
          privacyScore: analysis.overallScore,
          recommendations,
        }),
        recommendations,
      }
    }

    // Return canned response for general questions
    const responseContent = findResponse(content)

    return {
      message: createAdvisorMessage(responseContent),
    }
  }

  async analyzeWallet(address: string): Promise<WalletAnalysis> {
    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    return generateMockAnalysis(address)
  }

  async getRecommendations(
    analysis: WalletAnalysis
  ): Promise<AdvisorRecommendation[]> {
    return generateRecommendations(analysis)
  }
}
