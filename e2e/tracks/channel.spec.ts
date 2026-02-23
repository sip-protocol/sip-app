import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Channel",
  route: "/channel/create",
  submitButton: /Publish Drop/i,
  completedText: /Create Another Drop/i,
  fillFields: async (page) => {
    // Fill title (required)
    const titleInput = page.getByPlaceholder("Enter drop title...")
    await titleInput.fill("E2E Test Drop")

    // Fill content (required)
    const contentInput = page.getByPlaceholder("Write your privacy education content...")
    await contentInput.fill("This is test content for the E2E demo flow.")
  },
})
