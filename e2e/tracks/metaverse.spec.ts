import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Metaverse",
  route: "/metaverse/teleport",
  submitButton: /^Teleport$/i,
  completedText: /Teleport Again/i,
})
