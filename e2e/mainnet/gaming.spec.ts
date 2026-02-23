import { createMainnetTrackTest } from "../helpers/mainnet-track-test"
import { enableDemoMode } from "../helpers/demo-mode"

createMainnetTrackTest({
  name: "Gaming",
  route: "/gaming/play",
  completedText: /Claim Another Reward/i,
  interact: async (page) => {
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Claim Reward
    const submitBtn = page.getByRole("button", { name: /Claim Reward/i })
    await submitBtn.click()
  },
})
