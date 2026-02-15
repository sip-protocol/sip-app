import type {
  Event,
  Ticket,
  TicketingStep,
  EventCategory,
  TicketTier,
} from "./types"

const now = Date.now()
const DAY = 24 * 3600_000

export const SAMPLE_EVENTS: Event[] = [
  {
    id: "event-solana-breakpoint",
    title: "Solana Breakpoint",
    description:
      "The flagship Solana conference. Stealth ticket identity ensures attendees remain unlinkable — no wallet-based tracking.",
    category: "conference",
    tier: "vip",
    attendeeCount: 4200,
    isActive: true,
    icon: "\u{1F3DF}\uFE0F",
  },
  {
    id: "event-privacy-hackathon",
    title: "Privacy Hackathon",
    description:
      "Build privacy tools in 48 hours. Ticket IDs are Pedersen commitments — prove you have a ticket without revealing which one.",
    category: "hackathon",
    tier: "general",
    attendeeCount: 350,
    isActive: true,
    icon: "\u{1F4BB}",
  },
  {
    id: "event-zk-workshop",
    title: "ZK Workshop",
    description:
      "Hands-on zero-knowledge proofs workshop. Access gated by viewing key — organizers verify attendance without seeing your identity.",
    category: "workshop",
    tier: "early_bird",
    attendeeCount: 120,
    isActive: true,
    icon: "\u{1F9EA}",
  },
  {
    id: "event-dao-summit",
    title: "DAO Summit",
    description:
      "Decentralized governance summit. Private attendance proofs let you prove you were there without revealing your wallet.",
    category: "meetup",
    tier: "general",
    attendeeCount: 890,
    isActive: true,
    icon: "\u{1F91D}",
  },
  {
    id: "event-defi-concert",
    title: "DeFi Concert",
    description:
      "Live music meets DeFi. Stealth transfers for ticket resale prevent scalper bots — tickets are one-time unlinkable addresses.",
    category: "concert",
    tier: "vip",
    attendeeCount: 2500,
    isActive: true,
    icon: "\u{1F3B5}",
  },
]

export const SAMPLE_TICKETS: Ticket[] = [
  {
    eventId: "event-privacy-hackathon",
    tier: "general",
    commitmentHash: "0x3a8f...c2d1",
    purchasedAt: now - 3 * DAY,
  },
  {
    eventId: "event-dao-summit",
    tier: "general",
    commitmentHash: "0x7b2e...a9f3",
    purchasedAt: now - 1 * DAY,
  },
]

export const SIMULATION_DELAYS: Record<TicketingStep, number> = {
  selecting_event: 1200,
  generating_stealth_ticket: 1500,
  purchasing: 1800,
  purchased: 0,
  generating_proof: 1500,
  verifying_attendance: 2000,
  verified: 0,
  failed: 0,
}

export const MAX_TICKETING_HISTORY = 50

export const CATEGORY_COLORS: Record<
  EventCategory,
  { label: string; color: string; bg: string }
> = {
  conference: {
    label: "Conference",
    color: "text-teal-300",
    bg: "bg-teal-500/20 border-teal-500/30",
  },
  hackathon: {
    label: "Hackathon",
    color: "text-violet-300",
    bg: "bg-violet-500/20 border-violet-500/30",
  },
  workshop: {
    label: "Workshop",
    color: "text-blue-300",
    bg: "bg-blue-500/20 border-blue-500/30",
  },
  meetup: {
    label: "Meetup",
    color: "text-green-300",
    bg: "bg-green-500/20 border-green-500/30",
  },
  concert: {
    label: "Concert",
    color: "text-pink-300",
    bg: "bg-pink-500/20 border-pink-500/30",
  },
}

export const TIER_COLORS: Record<
  TicketTier,
  { label: string; color: string; bg: string }
> = {
  general: {
    label: "General",
    color: "text-gray-300",
    bg: "bg-gray-400/20 border-gray-400/30",
  },
  early_bird: {
    label: "Early Bird",
    color: "text-amber-300",
    bg: "bg-amber-500/20 border-amber-500/30",
  },
  vip: {
    label: "VIP",
    color: "text-yellow-300",
    bg: "bg-yellow-500/20 border-yellow-500/30",
  },
  backstage: {
    label: "Backstage",
    color: "text-red-300",
    bg: "bg-red-500/20 border-red-500/30",
  },
}

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  conference: "Conference",
  hackathon: "Hackathon",
  workshop: "Workshop",
  meetup: "Meetup",
  concert: "Concert",
}

export function getEvent(id: string): Event | undefined {
  return SAMPLE_EVENTS.find((e) => e.id === id)
}

export function getEventsByCategory(category: EventCategory): Event[] {
  return SAMPLE_EVENTS.filter((e) => e.category === category)
}

export function getAllEvents(): Event[] {
  return SAMPLE_EVENTS
}

export function getTicket(eventId: string): Ticket | undefined {
  return SAMPLE_TICKETS.find((t) => t.eventId === eventId)
}
