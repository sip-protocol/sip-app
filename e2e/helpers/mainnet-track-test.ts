import type { Page } from "@playwright/test"
import { test, expect, requireWallet } from "./mainnet-fixture"
import { waitForHydration } from "./demo-mode"
import { collectConsoleErrors, assertNoConsoleErrors } from "./assertions"

export interface MainnetTrackTestConfig {
  name: string
  route: string
  /** Steps to fill form and submit — runs after navigation + hydration */
  interact: (page: Page) => Promise<void>
  /** Text or pattern indicating the track completed successfully */
  completedText: string | RegExp
  /** Optional extra assertions after completion */
  extraAssertions?: (page: Page) => Promise<void>
}

/**
 * Generate mainnet E2E tests for a graveyard track.
 *
 * Each track gets 2 tests:
 * 1. "wallet connects and page loads" — verifies connected wallet address in UI
 * 2. "submits real on-chain transaction" — full flow with real tx
 */
export function createMainnetTrackTest(config: MainnetTrackTestConfig) {
  test.describe(`${config.name} Track [mainnet]`, () => {
    requireWallet()
    test.setTimeout(90_000)

    test("wallet connects and page loads", async ({ page, keypair }) => {
      const errors = collectConsoleErrors(page)
      await page.goto(config.route)
      await waitForHydration(page)

      // Verify wallet is connected — address should appear somewhere in page
      const address = keypair.publicKey.toBase58()
      const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`
      await expect(
        page.getByText(shortAddress).or(page.getByText(address)).first()
      ).toBeVisible({ timeout: 15_000 })

      await expect(page).not.toHaveTitle(/error|500|404/i)
      assertNoConsoleErrors(errors)
    })

    test("submits real on-chain transaction", async ({ page, keypair: _kp }) => {
      const errors = collectConsoleErrors(page)
      const sipLogs: string[] = []
      page.on("console", (msg) => {
        if (msg.text().includes("SIP-COMMIT")) {
          sipLogs.push(`[${msg.type()}] ${msg.text()}`)
        }
      })

      await page.goto(config.route)
      await waitForHydration(page)

      // Run track-specific interaction (enable demo, fill fields, submit)
      await config.interact(page)

      // Wait for completion
      await expect(
        page.getByText(config.completedText).first()
      ).toBeVisible({ timeout: 60_000 })

      // Give async commit time to complete
      await page.waitForTimeout(3000)

      // Report SIP-COMMIT activity
      if (sipLogs.length > 0) {
        console.log(`[${config.name}] SIP-COMMIT logs:`)
        sipLogs.forEach((l) => console.log(`  ${l}`))
      } else {
        console.log(`[${config.name}] WARNING: No SIP-COMMIT logs captured`)
      }

      if (config.extraAssertions) {
        await config.extraAssertions(page)
      }

      assertNoConsoleErrors(errors)
    })
  })
}
