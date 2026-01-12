"use client"

interface Recommendation {
  id: string
  severity: "critical" | "high" | "medium" | "low"
  category: string
  title: string
  description: string
  action: string
  potentialGain: number
}

interface RecommendationsProps {
  recommendations: Recommendation[]
}

const severityConfig = {
  critical: {
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    icon: "🚨",
  },
  high: {
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    icon: "⚠️",
  },
  medium: {
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    icon: "📋",
  },
  low: {
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: "💡",
  },
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h3 className="text-lg font-semibold text-green-400">
              Excellent Privacy!
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              No major privacy concerns detected. Keep up the good work!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-2xl bg-[var(--surface-primary)] border border-[var(--border-default)]">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>💡</span>
        Recommendations
        <span className="text-sm font-normal text-[var(--text-secondary)]">
          ({recommendations.length} issues found)
        </span>
      </h3>

      <div className="space-y-3">
        {recommendations.slice(0, 5).map((rec) => {
          const config = severityConfig[rec.severity]

          return (
            <div
              key={rec.id}
              className={`
                p-4 rounded-xl
                ${config.bgColor}
                border ${config.borderColor}
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{config.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`font-medium ${config.color}`}>
                      {rec.title}
                    </h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-sip-purple-500/20 text-sip-purple-400 whitespace-nowrap flex-shrink-0">
                      +{rec.potentialGain} pts
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">
                    {rec.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-sip-green-500">→</span>
                    <span className="text-[var(--text-primary)]">
                      {rec.action}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {recommendations.length > 5 && (
        <button className="mt-4 w-full py-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
          Show {recommendations.length - 5} more recommendations...
        </button>
      )}
    </div>
  )
}
