import { NextRequest, NextResponse } from "next/server"
import { createSurveillanceAnalyzer } from "@sip-protocol/sdk"

// Basic Solana address validation (base58, 32-44 chars)
function isValidSolanaAddress(address: string): boolean {
  if (typeof address !== "string") return false
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  return base58Regex.test(address)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const walletAddress = body?.walletAddress

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      )
    }

    if (!isValidSolanaAddress(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid Solana address format" },
        { status: 400 }
      )
    }

    // Check for Helius API key
    const heliusApiKey = process.env.HELIUS_API_KEY
    if (!heliusApiKey) {
      // Fall back to mock data if no API key configured
      console.warn("HELIUS_API_KEY not set, using mock data")
      const mockResult = generateMockResult(walletAddress)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return NextResponse.json(mockResult)
    }

    // Use real SDK analyzer
    const analyzer = createSurveillanceAnalyzer({
      heliusApiKey,
      cluster:
        process.env.SOLANA_CLUSTER === "devnet" ? "devnet" : "mainnet-beta",
      maxTransactions: 500,
      includeSocialLinks: true,
    })

    const result = await analyzer.analyze(walletAddress)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Privacy score analysis error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to analyze wallet",
      },
      { status: 500 }
    )
  }
}

// Mock data fallback when HELIUS_API_KEY is not configured
function generateMockResult(walletAddress: string) {
  const seed = walletAddress.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
  const random = (min: number, max: number) =>
    min + ((seed * 9301 + 49297) % (max - min + 1))

  const addressReuse = random(5, 25)
  const clusterExposure = random(5, 25)
  const exchangeExposure = random(0, 20)
  const temporalPatterns = random(5, 15)
  const socialLinks = random(0, 15)

  const overall =
    addressReuse +
    clusterExposure +
    exchangeExposure +
    temporalPatterns +
    socialLinks

  const risk =
    overall < 30
      ? "critical"
      : overall < 50
        ? "high"
        : overall < 70
          ? "medium"
          : "low"

  const recommendations = []

  if (addressReuse < 20) {
    recommendations.push({
      id: "address-reuse-001",
      severity: addressReuse < 10 ? "critical" : "high",
      category: "addressReuse",
      title: `Address reused ${25 - addressReuse} times`,
      description:
        "Reusing the same address for multiple transactions creates linkability between your transactions.",
      action:
        "Use SIP stealth addresses for each transaction. Each payment uses a unique one-time address.",
      potentialGain: 25 - addressReuse,
    })
  }

  if (clusterExposure < 20) {
    recommendations.push({
      id: "cluster-001",
      severity: clusterExposure < 10 ? "critical" : "high",
      category: "clusterExposure",
      title: `${25 - clusterExposure} addresses linked to your wallet`,
      description:
        "Transaction analysis has linked multiple addresses to your wallet through common input ownership patterns.",
      action:
        "Use SIP for all transactions to prevent cluster analysis. Stealth addresses break the link.",
      potentialGain: 25 - clusterExposure,
    })
  }

  if (exchangeExposure < 15) {
    recommendations.push({
      id: "exchange-cex-001",
      severity: exchangeExposure < 5 ? "critical" : "medium",
      category: "exchangeExposure",
      title: "Interacted with KYC exchanges",
      description:
        "Deposits to centralized exchanges link your on-chain activity to your verified identity.",
      action:
        "Use SIP viewing keys for selective disclosure. Prove compliance without exposing full history.",
      potentialGain: 20 - exchangeExposure,
    })
  }

  if (temporalPatterns < 12) {
    recommendations.push({
      id: "temporal-schedule-001",
      severity: "medium" as const,
      category: "temporalPatterns",
      title: "Regular transaction schedule detected",
      description:
        "Predictable patterns make your activity easier to track and attribute.",
      action:
        "Vary your transaction timing. Use scheduled private transactions through SIP.",
      potentialGain: 15 - temporalPatterns,
    })
  }

  if (socialLinks < 10) {
    recommendations.push({
      id: "social-partial-001",
      severity: socialLinks < 5 ? "high" : "medium",
      category: "socialLinks",
      title: "Partial identity exposure detected",
      description:
        "Some identifying information is linked to your wallet through ENS names or labeled addresses.",
      action:
        "Consider using a separate wallet for private activities. SIP stealth addresses prevent linking.",
      potentialGain: 15 - socialLinks,
    })
  }

  recommendations.sort((a, b) => b.potentialGain - a.potentialGain)

  const projectedAddressReuse = 25
  const projectedCluster = 25
  const projectedExchange = Math.min(exchangeExposure + 10, 20)
  const projectedTemporal = Math.min(temporalPatterns + 5, 15)
  const projectedScore =
    projectedAddressReuse +
    projectedCluster +
    projectedExchange +
    projectedTemporal +
    socialLinks

  const improvements = []

  if (addressReuse < 25) {
    improvements.push({
      category: "addressReuse",
      currentScore: addressReuse,
      projectedScore: 25,
      reason: "Stealth addresses prevent any address reuse",
    })
  }

  if (clusterExposure < 25) {
    improvements.push({
      category: "clusterExposure",
      currentScore: clusterExposure,
      projectedScore: 25,
      reason: "Stealth addresses cannot be linked via common input analysis",
    })
  }

  if (exchangeExposure < 20) {
    improvements.push({
      category: "exchangeExposure",
      currentScore: exchangeExposure,
      projectedScore: projectedExchange,
      reason:
        "Viewing keys allow selective disclosure without exposing full history",
    })
  }

  return {
    privacyScore: {
      overall,
      risk,
      breakdown: {
        addressReuse,
        clusterExposure,
        exchangeExposure,
        temporalPatterns,
        socialLinks,
      },
      recommendations,
      analyzedAt: Date.now(),
      walletAddress,
    },
    sipComparison: {
      currentScore: overall,
      projectedScore,
      improvement: projectedScore - overall,
      improvements,
    },
    transactionCount: random(50, 500),
    analysisDurationMs: random(1000, 3000),
  }
}
