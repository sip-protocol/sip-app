"use client"

import { useState } from "react"
import {
  PrivacyScoreInput,
  ScoreGauge,
  RiskBreakdown,
  Recommendations,
  SIPComparison,
  AnalysisLoading,
} from "@/components/privacy-score"

export default function PrivacyScorePage() {
  const [, setWalletAddress] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

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
          </div>

          {/* SIP Comparison */}
          <SIPComparison
            currentScore={result.sipComparison.currentScore}
            projectedScore={result.sipComparison.projectedScore}
            improvements={result.sipComparison.improvements}
          />
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
