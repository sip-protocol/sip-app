import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Music",
  route: "/music/playlist",
  submitButton: /Create|Playlist|Generate/i,
  completedText: /created|playlist|encrypted/i,
})
