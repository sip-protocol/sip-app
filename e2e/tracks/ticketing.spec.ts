import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Ticketing",
  route: "/ticketing",
  submitButton: /Purchase Ticket/i,
  completedText: /Purchase Another|purchased/i,
})
