import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Governance",
  route: "/governance/vote",
  submitButton: /Vote|Cast|Submit/i,
  completedText: /voted|cast|confirmed|committed/i,
})
