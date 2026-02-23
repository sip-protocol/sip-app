import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Ticketing",
  route: "/ticketing",
  submitButton: /Purchase|Buy|Ticket/i,
  completedText: /purchased|confirmed|ticket/i,
})
