import { expect, type Page } from "@playwright/test"

/**
 * Collect console errors during test execution.
 * Call at start of test, check at end.
 */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text()
      if (text.includes("favicon") || text.includes("next-router")) return
      errors.push(text)
    }
  })
  return errors
}

/**
 * Assert no critical console errors occurred.
 */
export function assertNoConsoleErrors(errors: string[]): void {
  const critical = errors.filter(
    (e) =>
      !e.includes("hydration") &&
      !e.includes("Warning:") &&
      !e.includes("DevTools")
  )
  expect(critical, `Console errors: ${critical.join("\n")}`).toHaveLength(0)
}

/**
 * Assert a stealth address was generated (visible in the page).
 */
export async function assertStealthAddress(page: Page): Promise<void> {
  const stealthEl = page.locator("text=/sip:solana:|0x[a-f0-9]{8}/i").first()
  await expect(stealthEl).toBeVisible({ timeout: 15_000 })
}

/**
 * Assert the flow completed (status shows completed state).
 */
export async function assertFlowCompleted(
  page: Page,
  completedText: string | RegExp
): Promise<void> {
  const status = page.getByText(completedText).first()
  await expect(status).toBeVisible({ timeout: 30_000 })
}
