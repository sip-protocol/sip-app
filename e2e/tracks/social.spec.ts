import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Social",
  route: "/social/profile",
  submitButton: /Create Stealth Identity/i,
  completedText: /Create Another Identity/i,
  fillFields: async (page) => {
    // Fill username (>= 3 chars required for submit to enable)
    const usernameInput = page.getByPlaceholder("anonymous_builder")
    await usernameInput.fill("e2e_test_user")
  },
})
