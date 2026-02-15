"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { useVerifyTicket } from "@/hooks/use-verify-ticket"
import { TicketingPrivacyToggle } from "./ticketing-privacy-toggle"
import { TicketingStatus } from "./ticketing-status"
import { StealthTicketDisplay } from "./stealth-ticket-display"
import { TIER_COLORS, SAMPLE_TICKETS } from "@/lib/ticketing/constants"
import type { TicketTier } from "@/lib/ticketing/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

const TICKET_TIERS: { value: TicketTier; label: string }[] = [
  { value: "general", label: "General" },
  { value: "early_bird", label: "Early Bird" },
  { value: "vip", label: "VIP" },
  { value: "backstage", label: "Backstage" },
]

interface VerifyFormProps {
  onVerified?: () => void
}

export function VerifyForm({ onVerified }: VerifyFormProps) {
  const { connected } = useWallet()

  const [tier, setTier] = useState<TicketTier>("general")
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const {
    status,
    activeRecord,
    error,
    verifyTicket,
    reset: resetVerify,
  } = useVerifyTicket()

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = {
    shielded: PrivacyLevel.SHIELDED,
    compliant: PrivacyLevel.COMPLIANT,
    transparent: PrivacyLevel.TRANSPARENT,
  }

  // Use the first ticket as the verifiable ticket
  const verifiableTicket = SAMPLE_TICKETS[0]

  const isFormReady = connected && status === "idle" && verifiableTicket
  const isVerifying =
    status === "generating_proof" || status === "verifying_attendance"
  const isVerified = status === "verified"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady || !verifiableTicket) return

      await verifyTicket({
        eventId: verifiableTicket.eventId,
        tier,
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [
      isFormReady,
      verifiableTicket,
      tier,
      privacyLevel,
      verifyTicket,
      privacyMap,
    ]
  )

  const handleReset = useCallback(() => {
    resetVerify()
    setTier("general")
    onVerified?.()
  }, [resetVerify, onVerified])

  // Verified state
  if (isVerified && activeRecord) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <TicketingStatus currentStep="verified" mode="verify" />
        <StealthTicketDisplay
          stealthAddress={activeRecord.stealthAddress ?? ""}
          metaAddress={activeRecord.stealthMetaAddress ?? ""}
          eventTitle={activeRecord.eventTitle ?? ""}
          tier={activeRecord.tier ?? "general"}
        />

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Verify Another Ticket
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
        <h2 className="text-lg font-semibold mb-1">Verify Ticket</h2>
        <p className="text-sm text-[var(--text-tertiary)]">
          Prove attendance privately via viewing key — organizers verify without
          seeing your identity
        </p>
      </div>

      {/* Verifiable ticket */}
      {verifiableTicket ? (
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-sip-green-400">
                Ticket Available
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Event:{" "}
                {verifiableTicket.eventId
                  .replace("event-", "")
                  .replace(/-/g, " ")}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                TIER_COLORS[verifiableTicket.tier].bg,
                TIER_COLORS[verifiableTicket.tier].color
              )}
            >
              {TIER_COLORS[verifiableTicket.tier].label}
            </span>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            No tickets to verify. Purchase a ticket first!
          </p>
        </div>
      )}

      {/* Tier selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Ticket Tier
        </label>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as TicketTier)}
          disabled={isVerifying}
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
          disabled={isVerifying}
        />
      </div>

      {/* Status (during verify) */}
      {isVerifying && (
        <div className="mb-6">
          <TicketingStatus
            currentStep={status as "generating_proof" | "verifying_attendance"}
            mode="verify"
          />
        </div>
      )}

      {/* Error state */}
      {status === "failed" && (
        <div className="mb-6">
          <TicketingStatus currentStep="failed" mode="verify" error={error} />
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
          : isVerifying
            ? "Verifying..."
            : "Verify Ticket"}
      </button>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Verification</span>
          <span className="text-teal-400 font-medium">Viewing Key Proof</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-[var(--text-secondary)]">Powered by</span>
          <span className="text-[var(--text-primary)]">KYD Labs</span>
        </div>
      </div>
    </form>
  )
}
