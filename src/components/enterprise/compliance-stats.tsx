interface ComplianceStatsProps {
  payments: number
  swaps: number
  votes: number
  viewingKeys: number
}

const stats = [
  { key: "payments", label: "Payments", icon: "\uD83D\uDCB8", color: "text-green-400" },
  { key: "swaps", label: "Swaps", icon: "\uD83D\uDD04", color: "text-blue-400" },
  { key: "votes", label: "Votes", icon: "\uD83D\uDDF3\uFE0F", color: "text-purple-400" },
  { key: "viewingKeys", label: "Viewing Keys", icon: "\uD83D\uDD11", color: "text-amber-400" },
] as const

export function ComplianceStats({ payments, swaps, votes, viewingKeys }: ComplianceStatsProps) {
  const values: Record<string, number> = { payments, swaps, votes, viewingKeys }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-4 text-center"
        >
          <span className={`text-2xl ${stat.color}`}>{stat.icon}</span>
          <p className="text-2xl font-bold mt-1">{values[stat.key]}</p>
          <p className="text-sm text-[var(--text-tertiary)]">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
