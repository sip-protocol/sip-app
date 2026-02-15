"use client"

import { useState, useCallback } from "react"
import { TicketingStats } from "@/components/ticketing/ticketing-stats"
import { EventList } from "@/components/ticketing/event-list"
import { PurchaseForm } from "@/components/ticketing/purchase-form"
import type { Event } from "@/lib/ticketing/types"

type View = "events" | "purchase"

export function TicketingPageClient() {
  const [view, setView] = useState<View>("events")
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const handlePurchase = useCallback((event: Event) => {
    setSelectedEvent(event)
    setView("purchase")
  }, [])

  const handleBack = useCallback(() => {
    setView("events")
    setSelectedEvent(null)
  }, [])

  // Purchase view
  if (view === "purchase" && selectedEvent) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          &larr; Back to events
        </button>
        <PurchaseForm event={selectedEvent} onPurchased={handleBack} />
      </div>
    )
  }

  // Events view
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Privacy Ticketing
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Stealth tickets, private attendance, verifiable access — event privacy
          powered by real cryptography. Anti-scalping by default.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10">
        <TicketingStats />
      </div>

      {/* Event List */}
      <EventList onPurchase={handlePurchase} />

      {/* Info Banner */}
      <div className="mt-10 p-4 rounded-xl bg-teal-900/20 border border-teal-800">
        <div className="flex gap-3">
          <span className="text-xl">{"\u{1F3AB}"}</span>
          <div>
            <p className="font-medium text-teal-100">Powered by KYD Labs</p>
            <p className="text-sm text-teal-300 mt-1">
              Tickets use stealth addresses for unlinkable identity, Pedersen
              commitments for ticket IDs, and viewing keys for organizer
              verification. All cryptography is real — powered by
              @sip-protocol/sdk.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
