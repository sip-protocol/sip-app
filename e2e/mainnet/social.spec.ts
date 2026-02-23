import { createMainnetTrackTest } from "../helpers/mainnet-track-test"
import { enableDemoMode } from "../helpers/demo-mode"

createMainnetTrackTest({
  name: "Social",
  route: "/social/profile",
  completedText: /Create Another Identity/i,
  interact: async (page) => {
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Fill username
    const usernameInput = page.getByPlaceholder("anonymous_builder")
    await usernameInput.fill("e2e_mainnet_user")

    // Create Stealth Identity
    const submitBtn = page.getByRole("button", { name: /Create Stealth Identity/i })
    await submitBtn.click()
  },
})
