import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Loyalty",
  route: "/loyalty/rewards",
  submitButton: /Claim/i,
  completedText: /Claim Another Reward/i,
})
