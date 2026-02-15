"use client"

import { useTicketingHistoryStore } from "@/stores/ticketing-history"
import { SAMPLE_EVENTS } from "@/lib/ticketing/constants"

export function TicketingStats() {
  const { tickets, actions } = useTicketingHistoryStore()

  const ticketsHeld = tickets.length
  const eventsAttended = actions.filter(
    (a) => a.type === "verify" && a.status === "verified"
  ).length
  const activeEvents = SAMPLE_EVENTS.filter((e) => e.isActive).length
  const bestTier =
    tickets.length > 0
      ? tickets.some((t) => t.tier === "backstage")
        ? "Backstage"
        : tickets.some((t) => t.tier === "vip")
          ? "VIP"
          : tickets.some((t) => t.tier === "early_bird")
            ? "Early Bird"
            : "General"
      : "None"

  const stats = [
    { label: "Tickets Held", value: ticketsHeld.toString() },
    { label: "Events Attended", value: eventsAttended.toString() },
    { label: "Active Events", value: activeEvents.toString() },
    { label: "Best Tier", value: bestTier },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-4 text-center"
        >
          <p className="text-2xl font-bold mb-1">{stat.value}</p>
          <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
