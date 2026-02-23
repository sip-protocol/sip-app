import { test, expect } from "@playwright/test"
import { enableDemoMode, waitForHydration } from "../helpers/demo-mode"
import { collectConsoleErrors, assertNoConsoleErrors } from "../helpers/assertions"

test.describe("Ticketing Track", () => {
  test("page loads without errors", async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto("/ticketing")
    await waitForHydration(page)
    await expect(page).not.toHaveTitle(/error|500|404/i)
    assertNoConsoleErrors(errors)
  })

  test("completes full demo flow", async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto("/ticketing")
    await waitForHydration(page)

    // Enable demo mode on the list page to populate events
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Click "Purchase" on the first event card
    const purchaseBtn = page.getByRole("button", { name: /^Purchase$/i }).first()
    await expect(purchaseBtn).toBeVisible({ timeout: 10_000 })
    await purchaseBtn.click()

    // We've navigated to the purchase detail page — need to re-enable demo mode
    await page.waitForTimeout(1000)
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Now PurchaseForm should be visible with "Purchase Ticket" button
    const submitBtn = page.getByRole("button", { name: /Purchase Ticket/i })
    await expect(submitBtn).toBeEnabled({ timeout: 10_000 })
    await submitBtn.click()

    // Wait for completion
    await expect(
      page.getByText(/Back to Events/i).first()
    ).toBeVisible({ timeout: 30_000 })

    assertNoConsoleErrors(errors)
  })
})
