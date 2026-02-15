"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { usePurchaseTicket } from "@/hooks/use-purchase-ticket"
import { TicketingPrivacyToggle } from "./ticketing-privacy-toggle"
import { TicketingStatus } from "./ticketing-status"
import { StealthTicketDisplay } from "./stealth-ticket-display"
import { TierBadge } from "./tier-badge"
import { EVENT_CATEGORY_LABELS } from "@/lib/ticketing/constants"
import type { Event, TicketTier } from "@/lib/ticketing/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

const TICKET_TIERS: { value: TicketTier; label: string }[] = [
  { value: "general", label: "General" },
  { value: "early_bird", label: "Early Bird" },
  { value: "vip", label: "VIP" },
  { value: "backstage", label: "Backstage" },
]

interface PurchaseFormProps {
  event: Event
  onPurchased?: () => void
}

export function PurchaseForm({ event, onPurchased }: PurchaseFormProps) {
  const { connected } = useWallet()

  const [tier, setTier] = useState<TicketTier>(event.tier)
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const {
    status,
    activeRecord,
    error,
    purchaseTicket,
    reset: resetPurchase,
  } = usePurchaseTicket()

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = {
    shielded: PrivacyLevel.SHIELDED,
    compliant: PrivacyLevel.COMPLIANT,
    transparent: PrivacyLevel.TRANSPARENT,
  }

  const privacyLabel: Record<PrivacyOption, string> = {
    shielded: "\u{1F512} Shielded",
    compliant: "\u{1F441}\uFE0F Compliant",
    transparent: "\u{1F513} Transparent",
  }

  const isFormReady = connected && status === "idle"
  const isPurchasing =
    status === "selecting_event" ||
    status === "generating_stealth_ticket" ||
    status === "purchasing"
  const isPurchased = status === "purchased"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady) return

      await purchaseTicket({
        eventId: event.id,
        tier,
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [isFormReady, event.id, tier, privacyLevel, purchaseTicket, privacyMap]
  )

  const handleReset = useCallback(() => {
    resetPurchase()
    onPurchased?.()
  }, [resetPurchase, onPurchased])

  // Purchased state
  if (isPurchased && activeRecord) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <TicketingStatus currentStep="purchased" mode="purchase" />
        <StealthTicketDisplay
          stealthAddress={activeRecord.stealthAddress ?? ""}
          metaAddress={activeRecord.stealthMetaAddress ?? ""}
          eventTitle={activeRecord.eventTitle ?? ""}
          tier={activeRecord.tier ?? "general"}
        />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Event</span>
            <span className="text-teal-400 font-medium">{event.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Category</span>
            <span className="text-[var(--text-primary)]">
              {EVENT_CATEGORY_LABELS[event.category]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Tier</span>
            <TierBadge tier={tier} />
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Privacy</span>
            <span className="text-sip-green-500 font-medium">
              {privacyLabel[privacyLevel]}
            </span>
          </div>
          {activeRecord.commitmentHash && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Ticket ID</span>
              <code className="text-xs font-mono text-[var(--text-tertiary)]">
                {activeRecord.commitmentHash}
              </code>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Back to Events
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{event.icon}</span>
          <h2 className="text-lg font-semibold">{event.title}</h2>
        </div>
        <p className="text-sm text-[var(--text-tertiary)]">
          {event.description}
        </p>
      </div>

      {/* Event details */}
      <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[var(--text-tertiary)]">Category</p>
            <p className="font-semibold">
              {EVENT_CATEGORY_LABELS[event.category]}
            </p>
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Default Tier</p>
            <TierBadge tier={event.tier} />
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Attendees</p>
            <p className="font-semibold">{event.attendeeCount}</p>
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Status</p>
            <p className="font-semibold text-teal-400">
              {event.isActive ? "Active" : "Closed"}
            </p>
          </div>
        </div>
      </div>

      {/* Tier selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Ticket Tier
        </label>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as TicketTier)}
          disabled={isPurchasing}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-teal-500 transition-colors"
        >
          {TICKET_TIERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <TicketingPrivacyToggle
          value={privacyLevel}
          onChange={setPrivacyLevel}
          disabled={isPurchasing}
        />
      </div>

      {/* Status (during purchase) */}
      {isPurchasing && (
        <div className="mb-6">
          <TicketingStatus
            currentStep={
              status as
                | "selecting_event"
                | "generating_stealth_ticket"
                | "purchasing"
            }
            mode="purchase"
          />
        </div>
      )}

      {/* Error state */}
      {status === "failed" && (
        <div className="mb-6">
          <TicketingStatus currentStep="failed" mode="purchase" error={error} />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormReady}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-colors",
          isFormReady
            ? "bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:from-teal-400 hover:to-teal-600"
            : "bg-teal-600/30 text-white/50 cursor-not-allowed"
        )}
      >
        {!connected
          ? "Connect Wallet"
          : isPurchasing
            ? "Purchasing..."
            : "Purchase Ticket"}
      </button>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Privacy</span>
          <span className="text-sip-green-500 font-medium">
            {privacyLabel[privacyLevel]}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-[var(--text-secondary)]">Powered by</span>
          <span className="text-[var(--text-primary)]">KYD Labs</span>
        </div>
      </div>
    </form>
  )
}
