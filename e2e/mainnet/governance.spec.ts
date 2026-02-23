import { createMainnetTrackTest } from "../helpers/mainnet-track-test"
import { enableDemoMode } from "../helpers/demo-mode"

createMainnetTrackTest({
  name: "Governance",
  route: "/governance",
  completedText: /Vote on Another Proposal/i,
  interact: async (page) => {
    // Enable demo mode to populate proposals
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Click "Vote" on the first proposal card
    const voteBtn = page.getByRole("button", { name: /^Vote$/i }).first()
    await voteBtn.click()

    // Re-enable demo mode on detail page
    await page.waitForTimeout(1000)
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Select "For"
    const forChoice = page.getByText("For", { exact: true }).first()
    await forChoice.click()

    // Commit Vote
    const commitBtn = page.getByRole("button", { name: /Commit Vote/i })
    await commitBtn.click()
  },
})
