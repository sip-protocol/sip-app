"use client"

import { useState, useEffect } from "react"
import { TicketIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { EventCard } from "./event-card"
import { SAMPLE_EVENTS } from "@/lib/ticketing/constants"
import { KYDReader } from "@/lib/ticketing/kyd-reader"
import type { Event, EventCategory } from "@/lib/ticketing/types"

type EventFilter = "all" | EventCategory

const FILTER_TABS: { value: EventFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "conference", label: "Conference" },
  { value: "hackathon", label: "Hackathon" },
  { value: "workshop", label: "Workshop" },
  { value: "meetup", label: "Meetup" },
  { value: "concert", label: "Concert" },
]

interface EventListProps {
  onPurchase?: (event: Event) => void
}

export function EventList({ onPurchase }: EventListProps) {
  const [filter, setFilter] = useState<EventFilter>("all")
  const [allEvents, setAllEvents] = useState<Event[]>(SAMPLE_EVENTS)

  useEffect(() => {
    const reader = new KYDReader("kyd")
    reader.getEvents().then(setAllEvents)
  }, [])

  const events =
    filter === "all"
      ? allEvents
      : allEvents.filter((e) => e.category === filter)

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              "flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              filter === tab.value
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Event grid */}
      {events.length === 0 ? (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <TicketIcon
              size={48}
              weight="duotone"
              className="text-[var(--text-tertiary)]"
            />
          </div>
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {filter === "all"
              ? "No events available yet. Check back soon for new privacy events."
              : `No ${filter} events. Try a different filter.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onPurchase={onPurchase} />
          ))}
        </div>
      )}
    </div>
  )
}
