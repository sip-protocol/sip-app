import { createMainnetTrackTest } from "../helpers/mainnet-track-test"
import { enableDemoMode } from "../helpers/demo-mode"

createMainnetTrackTest({
  name: "Channel",
  route: "/channel/create",
  completedText: /Create Another Drop/i,
  interact: async (page) => {
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Fill title
    const titleInput = page.getByPlaceholder("Enter drop title...")
    await titleInput.fill("E2E Mainnet Drop")

    // Fill content
    const contentInput = page.getByPlaceholder("Write your privacy education content...")
    await contentInput.fill("Mainnet E2E test content for privacy education drop.")

    // Publish Drop
    const submitBtn = page.getByRole("button", { name: /Publish Drop/i })
    await submitBtn.click()
  },
})
