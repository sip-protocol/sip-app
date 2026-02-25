import { createMainnetTrackTest } from "../helpers/mainnet-track-test"
import { enableDemoMode } from "../helpers/demo-mode"

createMainnetTrackTest({
  name: "DeSci",
  route: "/desci/review",
  completedText: /Review Another Project/i,
  expectsCommit: false, // Review flow doesn't trigger useOnChainCommit (fund flow does)
  interact: async (page) => {
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Submit Review
    const submitBtn = page.getByRole("button", { name: /Submit Review/i })
    await submitBtn.click()
  },
})
