import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Social",
  route: "/social/profile",
  submitButton: /Create Stealth Identity/i,
  completedText: /Create Another Identity/i,
  fillFields: async (page) => {
    const usernameInput = page.getByPlaceholder(/username|name|handle/i).first()
    if (await usernameInput.isVisible().catch(() => false)) {
      await usernameInput.fill("e2e_test_user")
    }
  },
})
