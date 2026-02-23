import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "DEX",
  route: "/dex",
  submitButton: /Swap|Trade|Exchange/i,
  completedText: /swapped|traded|confirmed/i,
})
