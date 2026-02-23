import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "DEX",
  route: "/dex",
  submitButton: /Swap|Shielded Swap/i,
  completedText: /swapped|confirmed|Swap Again/i,
})
