"use client"

interface SIPComparisonProps {
  currentScore: number
  projectedScore: number
  improvements: Array<{
    category: string
    currentScore: number
    projectedScore: number
    reason: string
  }>
}

const categoryLabels: Record<string, string> = {
  addressReuse: "Address Reuse",
  clusterExposure: "Cluster Exposure",
  exchangeExposure: "Exchange Exposure",
  temporalPatterns: "Temporal Patterns",
  socialLinks: "Social Links",
}

export function SIPComparison({
  currentScore,
  projectedScore,
  improvements,
}: SIPComparisonProps) {
  const improvement = projectedScore - currentScore

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-sip-purple-900/30 to-sip-green-900/30 border border-sip-purple-500/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sip-purple-500 to-sip-green-500 flex items-center justify-center">
          <span className="text-2xl">🛡️</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            With SIP Protection
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            See how SIP would improve your privacy score
          </p>
        </div>
      </div>

      {/* Score Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Current Score */}
        <div className="p-4 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-default)]">
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Current</p>
          <p className="text-3xl font-bold text-red-400">{currentScore}</p>
          <p className="text-xs text-[var(--text-tertiary)]">/100</p>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-sip-green-500/20 text-sip-green-400">
            <span className="text-lg">→</span>
            <span className="font-medium">+{improvement}</span>
          </div>
        </div>

        {/* Projected Score */}
        <div className="p-4 rounded-xl bg-sip-green-500/10 border border-sip-green-500/30">
          <p className="text-xs text-[var(--text-tertiary)] mb-1">With SIP</p>
          <p className="text-3xl font-bold text-sip-green-400">
            {projectedScore}
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">/100</p>
        </div>
      </div>

      {/* Improvement Details */}
      {improvements.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            How SIP helps:
          </p>
          {improvements.map((imp, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-primary)]/50"
            >
              <span className="text-sip-green-500">✓</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {categoryLabels[imp.category] || imp.category}
                  </span>
                  <span className="text-xs text-sip-green-400">
                    {imp.currentScore} → {imp.projectedScore}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {imp.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <a
          href="/payments"
          className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-sip-purple-500 to-sip-green-500 text-white font-medium text-center hover:opacity-90 transition-opacity"
        >
          Try SIP Now
        </a>
        <a
          href="https://docs.sip-protocol.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-6 py-3 rounded-xl border border-[var(--border-default)] text-white font-medium text-center hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Learn More
        </a>
      </div>
    </div>
  )
}
