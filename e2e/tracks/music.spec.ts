import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Music",
  route: "/music/playlist",
  submitButton: /Create Playlist/i,
  completedText: /Create Another Playlist/i,
})
