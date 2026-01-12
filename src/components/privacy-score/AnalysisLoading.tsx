"use client"

const loadingSteps = [
  { icon: "🔍", label: "Fetching transaction history..." },
  { icon: "🔗", label: "Detecting address clusters..." },
  { icon: "🏦", label: "Checking exchange interactions..." },
  { icon: "⏰", label: "Analyzing temporal patterns..." },
  { icon: "📊", label: "Calculating privacy score..." },
]

export function AnalysisLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 mb-12">
      <div className="p-8 rounded-2xl bg-[var(--surface-primary)] border border-[var(--border-default)]">
        <div className="flex flex-col items-center mb-8">
          {/* Animated Scanner */}
          <div className="relative w-24 h-24 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-sip-purple-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sip-purple-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-sip-green-500 animate-spin animation-delay-150" />
            <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-orange-500 animate-spin animation-delay-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">
            Analyzing Wallet Privacy
          </h3>
          <p className="text-sm text-[var(--text-secondary)] text-center">
            Scanning transaction history and detecting surveillance patterns...
          </p>
        </div>

        {/* Loading Steps */}
        <div className="space-y-3">
          {loadingSteps.map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-secondary)]"
              style={{
                animation: `fadeIn 0.5s ease-out ${index * 0.3}s both`,
              }}
            >
              <span className="text-lg">{step.icon}</span>
              <span className="text-sm text-[var(--text-secondary)]">
                {step.label}
              </span>
              <div className="ml-auto">
                <div className="w-4 h-4 border-2 border-sip-purple-500/30 border-t-sip-purple-500 rounded-full animate-spin" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animation-delay-150 {
          animation-delay: 0.15s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  )
}
