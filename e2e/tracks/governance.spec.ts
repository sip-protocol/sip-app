import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Governance",
  route: "/governance/vote",
  submitButton: /Commit Vote/i,
  completedText: /Vote on Another Proposal/i,
})
