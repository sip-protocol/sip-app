import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Art",
  route: "/art/create",
  submitButton: /Generate Art/i,
  completedText: /Generate Another/i,
})
