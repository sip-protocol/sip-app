import { test, expect } from "@playwright/test"
import { enableDemoMode, waitForHydration } from "../helpers/demo-mode"
import { collectConsoleErrors, assertNoConsoleErrors } from "../helpers/assertions"

test.describe("Loyalty Track", () => {
  test("page loads without errors", async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto("/loyalty/rewards")
    await waitForHydration(page)
    await expect(page).not.toHaveTitle(/error|500|404/i)
    assertNoConsoleErrors(errors)
  })

  test("completes full demo flow", async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto("/loyalty/rewards")
    await waitForHydration(page)

    // Enable demo mode on the list page to populate rewards
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Click "Claim to Stealth Address" on the first unclaimed reward card
    const claimBtn = page.getByRole("button", { name: /Claim to Stealth Address/i }).first()
    await expect(claimBtn).toBeVisible({ timeout: 10_000 })
    await claimBtn.click()

    // We've navigated to the claim detail page — need to re-enable demo mode
    await page.waitForTimeout(1000)
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Now ClaimRewardForm should be visible with "Claim X TOKEN" button
    // The button text is dynamic: "Claim {amount} {token}"
    const submitBtn = page.getByRole("button", { name: /^Claim \d/i }).first()
    await expect(submitBtn).toBeEnabled({ timeout: 10_000 })
    await submitBtn.click()

    // Wait for completion
    await expect(
      page.getByText(/Claim Another Reward/i).first()
    ).toBeVisible({ timeout: 30_000 })

    assertNoConsoleErrors(errors)
  })
})
