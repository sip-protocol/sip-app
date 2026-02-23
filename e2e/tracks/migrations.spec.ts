import { test, expect } from "@playwright/test"
import { enableDemoMode, waitForHydration } from "../helpers/demo-mode"
import { collectConsoleErrors, assertNoConsoleErrors } from "../helpers/assertions"

test.describe("Migrations Track", () => {
  test("page loads without errors", async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto("/migrations")
    await waitForHydration(page)
    await expect(page).not.toHaveTitle(/error|500|404/i)
    assertNoConsoleErrors(errors)
  })

  test("completes full demo flow", async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto("/migrations")
    await waitForHydration(page)

    // Enable demo mode
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Select a protocol from the ProtocolSelector (first protocol button)
    // Protocol cards are buttons with protocol names
    const protocolBtn = page.locator("button").filter({ hasText: /Manual SOL Entry/i }).first()
    await protocolBtn.click()

    // Fill the amount input
    const amountInput = page.getByPlaceholder(/amount|0\.0/i).first()
    await amountInput.fill("0.1")

    // Click "Migrate to Sunrise"
    const submitBtn = page.getByRole("button", { name: /Migrate to Sunrise/i })
    await expect(submitBtn).toBeEnabled({ timeout: 10_000 })
    await submitBtn.click()

    // Wait for completion
    await expect(
      page.getByText(/Migrate Again/i).first()
    ).toBeVisible({ timeout: 30_000 })

    assertNoConsoleErrors(errors)
  })
})
