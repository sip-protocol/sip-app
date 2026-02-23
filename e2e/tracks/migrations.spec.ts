import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Migrations",
  route: "/migrations",
  submitButton: /Migrate to Sunrise/i,
  completedText: /Migrate Again/i,
})
