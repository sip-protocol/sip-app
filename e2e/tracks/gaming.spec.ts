import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Gaming",
  route: "/gaming/play",
  submitButton: /Play|Start|Rock|Paper|Scissors/i,
  completedText: /won|lost|draw|revealed|result/i,
})
