import { createMainnetTrackTest } from "../helpers/mainnet-track-test"
import { enableDemoMode } from "../helpers/demo-mode"

createMainnetTrackTest({
  name: "Ticketing",
  route: "/ticketing",
  completedText: /Back to Events/i,
  interact: async (page) => {
    // Enable demo mode to populate events
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Click "Purchase" on the first event card
    const purchaseBtn = page.getByRole("button", { name: /^Purchase$/i }).first()
    await purchaseBtn.click()

    // Re-enable demo mode on detail page
    await page.waitForTimeout(1000)
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Purchase Ticket
    const submitBtn = page.getByRole("button", { name: /Purchase Ticket/i })
    await submitBtn.click()
  },
})
