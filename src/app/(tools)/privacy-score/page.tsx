"use client"

import { useState, useMemo, useEffect } from "react"
import { useAdvisor } from "@/hooks/use-advisor"
import {
  PrivacyScoreInput,
  ScoreGauge,
  RiskBreakdown,
  Recommendations,
  SIPComparison,
  AnalysisLoading,
} from "@/components/privacy-score"
import {
  NetworkGraph,
  RiskHeatmap,
  PrivacyTimeline,
  ProtectionComparison,
  transformBreakdownToHeatmap,
  generateMockTimeline,
  generateNetworkFromCluster,
} from "@/components/privacy-dashboard"
import type {
  GraphNode,
  GraphEdge,
  TimelinePoint,
} from "@/components/privacy-dashboard"

export default function PrivacyScorePage() {
  const [walletAddress, setWalletAddress] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Privacy Advisor integration
  const { setContext, open: openAdvisor } = useAdvisor()

  // Update advisor context when analysis completes
  useEffect(() => {
    if (result && walletAddress) {
      setContext({
        walletAddress,
        currentPrivacyScore: result.privacyScore.overall,
        breakdown: result.privacyScore.breakdown,
      })
    }
  }, [result, walletAddress, setContext])

  // Generate D3 visualization data from result
  const heatmapData = useMemo(() => {
    if (!result) return []
    return transformBreakdownToHeatmap(result.privacyScore.breakdown)
  }, [result])

  const timelineData = useMemo<TimelinePoint[]>(() => {
    if (!result) return []
    return generateMockTimeline(result.privacyScore.overall, 30)
  }, [result])

  const networkData = useMemo<{
    nodes: GraphNode[]
    edges: GraphEdge[]
  }>(() => {
    if (!result || !walletAddress) return { nodes: [], edges: [] }
    // Generate mock network data based on cluster exposure
    const clusterScore = result.privacyScore.breakdown.clusterExposure
    const exchangeScore = result.privacyScore.breakdown.exchangeExposure
    // Use deterministic transaction count based on wallet address
    const seed = walletAddress
      .split("")
      .reduce((a, b) => a + b.charCodeAt(0), 0)
    const txCount = (seed % 10) + 1
    return generateNetworkFromCluster(
      walletAddress,
      {
        linkedAddressCount: 25 - clusterScore,
        clusters: [
          {
            addresses: Array.from(
              { length: Math.max(1, Math.floor((25 - clusterScore) / 3)) },
              (_, i) => `${walletAddress.slice(0, 8)}...linked${i + 1}`
            ),
            linkType: "common-input" as const,
            transactionCount: txCount,
          },
        ],
      },
      exchangeScore < 15
        ? {
            exchanges: [
              {
                address: "BinanceXYZ...abc",
                name: "Binance",
                transactionCount: 20 - exchangeScore,
              },
            ],
          }
        : undefined
    )
  }, [result, walletAddress])

  const handleAnalyze = async (address: string) => {
    setWalletAddress(address)
    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      // In production, this would call the SDK's SurveillanceAnalyzer
      // For now, we'll use a mock API endpoint
      const response = await fetch("/api/privacy-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze wallet")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center px-4 pt-20 pb-12">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Privacy Analyzer
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            How{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Surveilled
            </span>{" "}
            Is Your Wallet?
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Analyze your Solana wallet&apos;s privacy exposure. See how
            trackers, exchanges, and on-chain analysis can monitor your
            activity.
          </p>
        </div>

        {/* Input Section */}
        <PrivacyScoreInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
      </section>

      {/* Results Section */}
      {isAnalyzing && <AnalysisLoading />}

      {error && (
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            <p className="font-medium">Analysis Failed</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </div>
      )}

      {result && !isAnalyzing && (
        <section className="max-w-6xl mx-auto px-4 pb-20 w-full">
          {/* Score Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
              <ScoreGauge
                score={result.privacyScore.overall}
                risk={result.privacyScore.risk}
              />
            </div>
            <div className="lg:col-span-2">
              <RiskBreakdown breakdown={result.privacyScore.breakdown} />
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-8">
            <Recommendations
              recommendations={result.privacyScore.recommendations}
            />
            {/* Ask Advisor CTA */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={openAdvisor}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-sip-purple-600/10 text-sip-purple-400 hover:bg-sip-purple-600/20 transition-colors border border-sip-purple-600/20"
              >
                <ChatIcon className="w-4 h-4" />
                Ask the Privacy Advisor about these risks
              </button>
            </div>
          </div>

          {/* SIP Comparison */}
          <SIPComparison
            currentScore={result.sipComparison.currentScore}
            projectedScore={result.sipComparison.projectedScore}
            improvements={result.sipComparison.improvements}
          />

          {/* Advanced Analytics Toggle */}
          <div className="mt-12 mb-8">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors group"
            >
              <span className="text-lg font-semibold">Advanced Analytics</span>
              <span
                className={`transform transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              >
                ▼
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                D3.js
              </span>
            </button>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">
              Interactive visualizations powered by D3.js for deeper analysis
            </p>
          </div>

          {/* Advanced D3.js Visualizations */}
          {showAdvanced && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              {/* Network Graph */}
              <div className="p-6 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-default)]">
                <h3 className="text-lg font-semibold mb-2">
                  Wallet Network Graph
                </h3>
                <p className="text-sm text-[var(--text-tertiary)] mb-4">
                  Visualize connections between your wallet and linked
                  addresses. Drag nodes to explore.
                </p>
                <NetworkGraph
                  nodes={networkData.nodes}
                  edges={networkData.edges}
                  width={Math.min(
                    800,
                    typeof window !== "undefined" ? window.innerWidth - 80 : 800
                  )}
                  height={400}
                />
              </div>

              {/* Risk Heatmap */}
              <div className="p-6 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-default)]">
                <h3 className="text-lg font-semibold mb-2">
                  Risk Category Breakdown
                </h3>
                <p className="text-sm text-[var(--text-tertiary)] mb-4">
                  Detailed analysis of privacy risks across different categories
                </p>
                <RiskHeatmap
                  data={heatmapData}
                  width={Math.min(
                    600,
                    typeof window !== "undefined" ? window.innerWidth - 80 : 600
                  )}
                  height={280}
                />
              </div>

              {/* Privacy Timeline */}
              <div className="p-6 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-default)]">
                <h3 className="text-lg font-semibold mb-2">
                  Privacy Score Over Time
                </h3>
                <p className="text-sm text-[var(--text-tertiary)] mb-4">
                  Track how your privacy score has changed based on transaction
                  patterns
                </p>
                <PrivacyTimeline
                  data={timelineData}
                  width={Math.min(
                    700,
                    typeof window !== "undefined" ? window.innerWidth - 80 : 700
                  )}
                  height={250}
                />
              </div>

              {/* Animated Protection Comparison */}
              <div className="p-6 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-default)]">
                <h3 className="text-lg font-semibold mb-2">
                  SIP Protection Impact
                </h3>
                <p className="text-sm text-[var(--text-tertiary)] mb-4">
                  See the animated improvement when using SIP for your
                  transactions
                </p>
                <ProtectionComparison
                  currentScore={result.sipComparison.currentScore}
                  projectedScore={result.sipComparison.projectedScore}
                  improvements={result.sipComparison.improvements}
                  width={500}
                  height={300}
                />
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

// Types for the analysis result
interface AnalysisResult {
  privacyScore: {
    overall: number
    risk: "critical" | "high" | "medium" | "low"
    breakdown: {
      addressReuse: number
      clusterExposure: number
      exchangeExposure: number
      temporalPatterns: number
      socialLinks: number
    }
    recommendations: Array<{
      id: string
      severity: "critical" | "high" | "medium" | "low"
      category: string
      title: string
      description: string
      action: string
      potentialGain: number
    }>
  }
  sipComparison: {
    currentScore: number
    projectedScore: number
    improvement: number
    improvements: Array<{
      category: string
      currentScore: number
      projectedScore: number
      reason: string
    }>
  }
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  )
}
