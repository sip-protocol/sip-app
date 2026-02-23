import { createMainnetTrackTest } from "../helpers/mainnet-track-test"
import { enableDemoMode } from "../helpers/demo-mode"

createMainnetTrackTest({
  name: "Migrations",
  route: "/migrations",
  completedText: /Migrate Again/i,
  interact: async (page) => {
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Select a protocol
    const protocolBtn = page.locator("button").filter({ hasText: /Manual SOL Entry/i }).first()
    await protocolBtn.click()

    // Fill amount
    const amountInput = page.getByPlaceholder(/amount|0\.0/i).first()
    await amountInput.fill("0.1")

    // Migrate to Sunrise
    const submitBtn = page.getByRole("button", { name: /Migrate to Sunrise/i })
    await submitBtn.click()
  },
})
