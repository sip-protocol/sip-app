"use client"

interface ScoreGaugeProps {
  score: number
  risk: "critical" | "high" | "medium" | "low"
}

const riskConfig = {
  critical: {
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    gradientFrom: "from-red-500",
    gradientTo: "to-red-700",
    label: "Critical Risk",
    emoji: "🚨",
  },
  high: {
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    gradientFrom: "from-orange-500",
    gradientTo: "to-orange-700",
    label: "High Risk",
    emoji: "⚠️",
  },
  medium: {
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    gradientFrom: "from-yellow-500",
    gradientTo: "to-yellow-700",
    label: "Medium Risk",
    emoji: "📊",
  },
  low: {
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    gradientFrom: "from-green-500",
    gradientTo: "to-green-700",
    label: "Low Risk",
    emoji: "✅",
  },
}

export function ScoreGauge({ score, risk }: ScoreGaugeProps) {
  const config = riskConfig[risk]
  const circumference = 2 * Math.PI * 45 // radius = 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div
      className={`
      p-6 rounded-2xl
      ${config.bgColor}
      border ${config.borderColor}
    `}
    >
      <div className="flex flex-col items-center">
        {/* Circular Progress */}
        <div className="relative w-40 h-40 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-800"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient
                id="scoreGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  className={`${config.gradientFrom.replace("from-", "stop-")}`}
                  stopColor={
                    risk === "critical"
                      ? "#ef4444"
                      : risk === "high"
                        ? "#f97316"
                        : risk === "medium"
                          ? "#eab308"
                          : "#22c55e"
                  }
                />
                <stop
                  offset="100%"
                  stopColor={
                    risk === "critical"
                      ? "#dc2626"
                      : risk === "high"
                        ? "#ea580c"
                        : risk === "medium"
                          ? "#ca8a04"
                          : "#16a34a"
                  }
                />
              </linearGradient>
            </defs>
          </svg>

          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${config.color}`}>
              {score}
            </span>
            <span className="text-sm text-[var(--text-tertiary)]">/100</span>
          </div>
        </div>

        {/* Risk Badge */}
        <div
          className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full
          ${config.bgColor} ${config.color}
          font-medium text-sm
        `}
        >
          <span>{config.emoji}</span>
          <span>{config.label}</span>
        </div>

        {/* Description */}
        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          {risk === "critical" &&
            "Your wallet is highly exposed. Immediate privacy improvements needed."}
          {risk === "high" &&
            "Significant privacy vulnerabilities detected. Consider using SIP."}
          {risk === "medium" &&
            "Some privacy concerns found. Room for improvement."}
          {risk === "low" &&
            "Good privacy practices! Minor improvements possible."}
        </p>
      </div>
    </div>
  )
}
