import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Art",
  route: "/art/create",
  submitButton: /Generate|Create|Mint/i,
  completedText: /generated|created|minted/i,
})
