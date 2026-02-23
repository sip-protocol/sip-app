import { createMainnetTrackTest } from "../helpers/mainnet-track-test"
import { enableDemoMode } from "../helpers/demo-mode"

createMainnetTrackTest({
  name: "Loyalty",
  route: "/loyalty/rewards",
  completedText: /Claim Another Reward/i,
  interact: async (page) => {
    // Enable demo mode to populate rewards
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Click "Claim to Stealth Address" on the first reward
    const claimBtn = page.getByRole("button", { name: /Claim to Stealth Address/i }).first()
    await claimBtn.click()

    // Re-enable demo mode on detail page
    await page.waitForTimeout(1000)
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Click "Claim {amount} {token}" button
    const submitBtn = page.getByRole("button", { name: /^Claim \d/i }).first()
    await submitBtn.click()
  },
})
