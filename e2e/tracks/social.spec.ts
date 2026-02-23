import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Social",
  route: "/social/profile",
  submitButton: /Create|Generate|Profile/i,
  completedText: /created|profile|stealth/i,
  fillFields: async (page) => {
    const usernameInput = page.getByPlaceholder(/username|name/i).first()
    if (await usernameInput.isVisible().catch(() => false)) {
      await usernameInput.fill("e2e_test_user")
    }
  },
})
