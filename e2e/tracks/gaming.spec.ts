import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Gaming",
  route: "/gaming/play",
  submitButton: /Commit Move/i,
  completedText: /Play Again|result|revealed/i,
})
