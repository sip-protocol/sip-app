import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "DeSci",
  route: "/desci/review",
  submitButton: /Review|Submit|Fund/i,
  completedText: /reviewed|submitted|funded/i,
})
