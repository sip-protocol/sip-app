import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Channel",
  route: "/channel/create",
  submitButton: /Publish|Create|Drop/i,
  completedText: /published|created|drop/i,
})
