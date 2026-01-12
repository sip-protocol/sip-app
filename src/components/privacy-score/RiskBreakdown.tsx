"use client"

interface RiskBreakdownProps {
  breakdown: {
    addressReuse: number
    clusterExposure: number
    exchangeExposure: number
    temporalPatterns: number
    socialLinks: number
  }
}

const categories = [
  {
    key: "addressReuse" as const,
    label: "Address Reuse",
    maxScore: 25,
    icon: "🔄",
    description: "Using same address multiple times creates linkability",
  },
  {
    key: "clusterExposure" as const,
    label: "Cluster Exposure",
    maxScore: 25,
    icon: "🕸️",
    description: "Addresses linked via transaction patterns",
  },
  {
    key: "exchangeExposure" as const,
    label: "Exchange Exposure",
    maxScore: 20,
    icon: "🏦",
    description: "Interactions with KYC exchanges",
  },
  {
    key: "temporalPatterns" as const,
    label: "Temporal Patterns",
    maxScore: 15,
    icon: "⏰",
    description: "Predictable transaction timing",
  },
  {
    key: "socialLinks" as const,
    label: "Social Links",
    maxScore: 15,
    icon: "👤",
    description: "Public identity connections",
  },
]

function getScoreColor(score: number, maxScore: number): string {
  const percentage = score / maxScore
  if (percentage >= 0.8) return "bg-green-500"
  if (percentage >= 0.5) return "bg-yellow-500"
  if (percentage >= 0.25) return "bg-orange-500"
  return "bg-red-500"
}

function getScoreLabel(score: number, maxScore: number): string {
  const percentage = score / maxScore
  if (percentage >= 0.8) return "Good"
  if (percentage >= 0.5) return "Fair"
  if (percentage >= 0.25) return "Poor"
  return "Critical"
}

export function RiskBreakdown({ breakdown }: RiskBreakdownProps) {
  return (
    <div className="p-6 rounded-2xl bg-[var(--surface-primary)] border border-[var(--border-default)]">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>📊</span>
        Risk Breakdown
      </h3>

      <div className="space-y-4">
        {categories.map((category) => {
          const score = breakdown[category.key]
          const percentage = (score / category.maxScore) * 100
          const color = getScoreColor(score, category.maxScore)
          const label = getScoreLabel(score, category.maxScore)

          return (
            <div key={category.key} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm font-medium text-white">
                    {category.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      label === "Good"
                        ? "bg-green-500/20 text-green-400"
                        : label === "Fair"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : label === "Poor"
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {label}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {score}/{category.maxScore}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} transition-all duration-700 ease-out rounded-full`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Description on hover */}
              <p className="text-xs text-[var(--text-tertiary)] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {category.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Total Score */}
      <div className="mt-6 pt-4 border-t border-[var(--border-default)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-secondary)]">
            Total Privacy Score
          </span>
          <span className="text-lg font-bold text-white">
            {breakdown.addressReuse +
              breakdown.clusterExposure +
              breakdown.exchangeExposure +
              breakdown.temporalPatterns +
              breakdown.socialLinks}
            /100
          </span>
        </div>
      </div>
    </div>
  )
}
