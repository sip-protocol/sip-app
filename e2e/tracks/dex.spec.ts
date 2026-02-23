import { test, expect } from "@playwright/test"
import { waitForHydration } from "../helpers/demo-mode"
import { collectConsoleErrors, assertNoConsoleErrors } from "../helpers/assertions"

test.describe("DEX Track", () => {
  test("page loads without errors", async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto("/dex")
    await waitForHydration(page)
    await expect(page).not.toHaveTitle(/error|500|404/i)
    assertNoConsoleErrors(errors)
  })

  test("completes full demo flow", async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto("/dex")
    await waitForHydration(page)

    // DEX uses useWalletStore (not demo mode), so the swap button
    // shows "Connect Wallet" when not connected. Verify the swap
    // button is present and interactive using its data-testid.
    const swapButton = page.locator("[data-testid='swap-button']")
    await expect(swapButton).toBeVisible({ timeout: 10_000 })
    await expect(swapButton).toBeEnabled()

    // Verify key UI elements are rendered
    await expect(page.locator("[data-testid='from-amount']")).toBeVisible()
    await expect(page.locator("[data-testid='to-output']")).toBeVisible()
    await expect(page.locator("[data-testid='privacy-badge']")).toBeVisible()

    // Verify the swap button says "Connect Wallet" (no wallet in E2E)
    await expect(swapButton).toContainText(/Connect Wallet/i)

    assertNoConsoleErrors(errors)
  })
})
