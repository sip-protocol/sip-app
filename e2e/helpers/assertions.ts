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
      !e.includes("DevTools") &&
      !e.includes("CORS") &&
      !e.includes("net::ERR_FAILED") &&
      !e.includes("Failed to load resource") &&
      !e.includes("Access-Control-Allow-Origin") &&
      !e.includes("429") &&
      !e.includes("Retrying after")
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

/**
 * Assert that the wallet is connected and the truncated address is visible.
 */
export async function assertWalletConnected(
  page: Page,
  address: string
): Promise<void> {
  const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`
  await expect(
    page.getByText(shortAddress).or(page.getByText(address)).first()
  ).toBeVisible({ timeout: 15_000 })
}

/**
 * Assert a transaction signature is visible (solscan link or 88-char base58).
 */
export async function assertTransactionSignature(page: Page): Promise<void> {
  const txLink = page
    .locator("a[href*='solscan.io/tx/']")
    .or(page.locator("text=/[1-9A-HJ-NP-Za-km-z]{87,88}/"))
    .first()
  await expect(txLink).toBeVisible({ timeout: 60_000 })
}
