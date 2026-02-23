import type { Page } from "@playwright/test"

/**
 * Enable demo mode by injecting into Zustand store via page context.
 * Must be called after page navigation (store exists after React hydration).
 */
export async function enableDemoMode(page: Page): Promise<void> {
  await page.evaluate(() => {
    const event = new CustomEvent("sip-demo-mode", { detail: true })
    window.dispatchEvent(event)
  })

  // Fallback: click the "Try Demo" button if visible
  const demoBtn = page.getByRole("button", { name: /Try Demo/i })
  if (await demoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await demoBtn.click()
  }
}

/**
 * Wait for page to be fully hydrated (Next.js app router).
 */
export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1000)
}
