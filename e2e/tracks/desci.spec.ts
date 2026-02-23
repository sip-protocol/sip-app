import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "DeSci",
  route: "/desci/review",
  submitButton: /Submit Review/i,
  completedText: /Review Another Project/i,
})
