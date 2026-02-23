import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Gaming",
  route: "/gaming/play",
  submitButton: /Claim Reward/i,
  completedText: /Claim Another Reward/i,
})
