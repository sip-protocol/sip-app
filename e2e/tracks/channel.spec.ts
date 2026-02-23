import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Channel",
  route: "/channel/create",
  submitButton: /Publish Drop/i,
  completedText: /Create Another Drop/i,
})
