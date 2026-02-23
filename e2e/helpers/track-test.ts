import { test, expect, type Page } from "@playwright/test"
import { enableDemoMode, waitForHydration } from "./demo-mode"
import { collectConsoleErrors, assertNoConsoleErrors } from "./assertions"

export interface TrackTestConfig {
  name: string
  route: string
  submitButton: string | RegExp
  completedText: string | RegExp
  fillFields?: (page: Page) => Promise<void>
  extraAssertions?: (page: Page) => Promise<void>
  /** Use locator instead of getByRole for submit button (e.g., data-testid) */
  submitLocator?: (page: Page) => ReturnType<Page["locator"]>
}

/**
 * Generate a standard demo-mode E2E test for a graveyard track.
 */
export function createTrackTest(config: TrackTestConfig) {
  test.describe(`${config.name} Track`, () => {
    test("page loads without errors", async ({ page }) => {
      const errors = collectConsoleErrors(page)
      await page.goto(config.route)
      await waitForHydration(page)
      await expect(page).not.toHaveTitle(/error|500|404/i)
      assertNoConsoleErrors(errors)
    })

    test("completes full demo flow", async ({ page }) => {
      const errors = collectConsoleErrors(page)
      await page.goto(config.route)
      await waitForHydration(page)

      // Enable demo mode
      await enableDemoMode(page)
      await page.waitForTimeout(2000)

      // Fill any required fields
      if (config.fillFields) {
        await config.fillFields(page)
      }

      // Click submit
      const submitBtn = config.submitLocator
        ? config.submitLocator(page)
        : page.getByRole("button", { name: config.submitButton })
      await expect(submitBtn).toBeEnabled({ timeout: 10_000 })
      await submitBtn.click()

      // Wait for completion
      await expect(
        page.getByText(config.completedText).first()
      ).toBeVisible({ timeout: 30_000 })

      assertNoConsoleErrors(errors)
    })
  })
}
