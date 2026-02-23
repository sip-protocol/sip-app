import { test, expect } from "@playwright/test"
import { enableDemoMode, waitForHydration } from "../helpers/demo-mode"
import { collectConsoleErrors, assertNoConsoleErrors } from "../helpers/assertions"

test.describe("Governance Track", () => {
  test("page loads without errors", async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto("/governance")
    await waitForHydration(page)
    await expect(page).not.toHaveTitle(/error|500|404/i)
    assertNoConsoleErrors(errors)
  })

  test("completes full demo flow", async ({ page }) => {
    const errors = collectConsoleErrors(page)
    // Start at /governance (dashboard with proposal list)
    await page.goto("/governance")
    await waitForHydration(page)

    // Enable demo mode on the list page to populate proposals
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Click "Vote" on the first proposal card
    const voteBtn = page.getByRole("button", { name: /^Vote$/i }).first()
    await expect(voteBtn).toBeVisible({ timeout: 10_000 })
    await voteBtn.click()

    // We've navigated to the vote detail page — need to re-enable demo mode
    await page.waitForTimeout(1000)
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Select the first vote choice (e.g., "For")
    const forChoice = page.getByText("For", { exact: true }).first()
    await expect(forChoice).toBeVisible({ timeout: 10_000 })
    await forChoice.click()

    // Click "Commit Vote"
    const commitBtn = page.getByRole("button", { name: /Commit Vote/i })
    await expect(commitBtn).toBeEnabled({ timeout: 10_000 })
    await commitBtn.click()

    // Wait for completion
    await expect(
      page.getByText(/Vote on Another Proposal/i).first()
    ).toBeVisible({ timeout: 30_000 })

    assertNoConsoleErrors(errors)
  })
})
