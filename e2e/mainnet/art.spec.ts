import { createMainnetTrackTest } from "../helpers/mainnet-track-test"
import { enableDemoMode } from "../helpers/demo-mode"

createMainnetTrackTest({
  name: "Art",
  route: "/art/create",
  completedText: /Generate Another/i,
  interact: async (page) => {
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Select art style
    const styleButton = page.getByText("Cipher Bloom").first()
    await styleButton.click()

    // Generate Art
    const submitBtn = page.getByRole("button", { name: /Generate Art/i })
    await submitBtn.click()
  },
})
