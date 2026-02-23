import { createMainnetTrackTest } from "../helpers/mainnet-track-test"
import { enableDemoMode } from "../helpers/demo-mode"

createMainnetTrackTest({
  name: "Metaverse",
  route: "/metaverse/teleport",
  completedText: /Teleport Again/i,
  interact: async (page) => {
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Teleport
    const submitBtn = page.getByRole("button", { name: /^Teleport$/i })
    await submitBtn.click()
  },
})
