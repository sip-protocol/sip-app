import type { Event, Ticket, EventCategory, TicketingMode } from "./types"
import { SAMPLE_EVENTS, SAMPLE_TICKETS } from "./constants"

export class KYDReader {
  private mode: TicketingMode

  constructor(mode: TicketingMode = "simulation") {
    this.mode = mode
  }

  async getEvents(): Promise<Event[]> {
    if (this.mode === "simulation") {
      return SAMPLE_EVENTS
    }
    throw new Error("KYD mode is not yet implemented. Use simulation mode.")
  }

  async getEvent(id: string): Promise<Event | undefined> {
    if (this.mode === "simulation") {
      return SAMPLE_EVENTS.find((e) => e.id === id)
    }
    throw new Error("KYD mode is not yet implemented. Use simulation mode.")
  }

  async getTickets(): Promise<Ticket[]> {
    if (this.mode === "simulation") {
      return SAMPLE_TICKETS
    }
    throw new Error("KYD mode is not yet implemented. Use simulation mode.")
  }

  async getEventsByCategory(category: EventCategory): Promise<Event[]> {
    if (this.mode === "simulation") {
      return SAMPLE_EVENTS.filter((e) => e.category === category)
    }
    throw new Error("KYD mode is not yet implemented. Use simulation mode.")
  }

  async getAttendees(): Promise<
    { address: string; events: number; tier: string }[]
  > {
    if (this.mode === "simulation") {
      return [
        { address: "S1P...x7a", events: 12, tier: "vip" },
        { address: "7Kz...m3b", events: 9, tier: "vip" },
        { address: "Fg2...p9c", events: 7, tier: "general" },
        { address: "Bx8...k1d", events: 5, tier: "early_bird" },
        { address: "Qm5...r4e", events: 3, tier: "general" },
      ]
    }
    throw new Error("KYD mode is not yet implemented. Use simulation mode.")
  }
}
