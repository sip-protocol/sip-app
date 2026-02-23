import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Loyalty",
  route: "/loyalty/rewards",
  submitButton: /Claim|Reward|Redeem/i,
  completedText: /claimed|redeemed|reward/i,
})
