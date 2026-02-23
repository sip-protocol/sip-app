import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Metaverse",
  route: "/metaverse/teleport",
  submitButton: /Teleport|Enter|Go/i,
  completedText: /teleported|arrived|entered/i,
})
