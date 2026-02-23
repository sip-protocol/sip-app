import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Migrations",
  route: "/migrations",
  submitButton: /Migrate|Start|Begin/i,
  completedText: /migrated|complete|finished/i,
})
