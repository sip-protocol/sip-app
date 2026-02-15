import type { PrivacyLevel } from "@sip-protocol/types"

export type PurchaseStep =
  | "selecting_event"
  | "generating_stealth_ticket"
  | "purchasing"
  | "purchased"
  | "failed"

export type VerifyStep =
  | "generating_proof"
  | "verifying_attendance"
  | "verified"
  | "failed"

export type TicketingStep = PurchaseStep | VerifyStep

export type EventCategory =
  | "conference"
  | "hackathon"
  | "workshop"
  | "meetup"
  | "concert"

export type TicketTier = "general" | "early_bird" | "vip" | "backstage"

export interface Event {
  id: string
  title: string
  description: string
  category: EventCategory
  tier: TicketTier
  attendeeCount: number
  isActive: boolean
  icon: string
}

export interface Ticket {
  eventId: string
  tier: TicketTier
  commitmentHash: string
  purchasedAt: number
}

export interface TicketingActionRecord {
  id: string
  type: "purchase" | "verify"
  eventId: string
  status: TicketingStep
  privacyLevel: PrivacyLevel
  // Purchase-specific
  eventTitle?: string
  category?: EventCategory
  tier?: TicketTier
  commitmentHash?: string
  // Verify-specific
  stealthAddress?: string
  stealthMetaAddress?: string
  attendanceVerified?: boolean
  // Timestamps
  startedAt: number
  completedAt?: number
  error?: string
  stepTimestamps: Partial<Record<TicketingStep, number>>
}

export interface PurchaseTicketParams {
  eventId: string
  tier: TicketTier
  privacyLevel: PrivacyLevel
}

export interface VerifyTicketParams {
  eventId: string
  tier: TicketTier
  privacyLevel: PrivacyLevel
}

export type TicketingStepChangeCallback = (
  step: TicketingStep,
  record: TicketingActionRecord
) => void

export type TicketingMode = "simulation" | "kyd"
