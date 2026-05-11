import { test, expect } from "@playwright/test"
import { waitForHydration } from "../helpers/demo-mode"

/**
 * E2E coverage for `<domain>.sol` recipient resolution in the send flow.
 *
 * These tests hit the real Bonfida SNS RPC on mainnet so they live under
 * `e2e/mainnet/` (90s timeout, browser-only — no test wallet required since
 * resolution UX renders before any wallet/send action).
 *
 * Test domains:
 * - `bonfida.sol` — registered on SNS but has no SIP-STEALTH record →
 *   exercises the not-found-record warn-and-downgrade branch.
 * - A long, manifestly unregistered .sol → exercises the not-found-domain
 *   red-error branch.
 *
 * If Bonfida ever publishes a SIP-STEALTH record on `bonfida.sol`, swap the
 * fixture to another high-profile public domain that does not.
 */

test.describe("sip.sol recipient resolution [mainnet]", () => {
  test.setTimeout(90_000)

  test("warn-and-downgrade for .sol without SIP-STEALTH record", async ({
    page,
  }) => {
    await page.goto("/payments/send")
    await waitForHydration(page)

    const recipient = page.locator("#recipient")
    await expect(recipient).toBeVisible()
    await recipient.fill("bonfida.sol")

    // Yellow warning copy
    await expect(
      page.getByText(/Private payment not available\./i),
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      page.getByText(/bonfida\.sol hasn['’]t enabled SIP-STEALTH/i),
    ).toBeVisible()

    // Both fallback buttons exist and are reachable
    await expect(
      page.getByRole("button", { name: /Send Public/i }),
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: /^Cancel$/i }),
    ).toBeVisible()
  })

  test("Cancel button clears the recipient input", async ({ page }) => {
    await page.goto("/payments/send")
    await waitForHydration(page)

    const recipient = page.locator("#recipient")
    await recipient.fill("bonfida.sol")
    await expect(
      page.getByText(/Private payment not available\./i),
    ).toBeVisible({ timeout: 15_000 })

    await page.getByRole("button", { name: /^Cancel$/i }).click()

    await expect(recipient).toHaveValue("")
    await expect(
      page.getByText(/Private payment not available\./i),
    ).toHaveCount(0)
  })

  test("not-found error for unregistered .sol domain", async ({ page }) => {
    await page.goto("/payments/send")
    await waitForHydration(page)

    const recipient = page.locator("#recipient")
    const fake = "sip-sol-e2e-does-not-exist-xyz123.sol"
    await recipient.fill(fake)

    await expect(page.getByText(new RegExp(`${fake} not found`, "i"))).toBeVisible({
      timeout: 15_000,
    })
  })

  test("sip: URI still resolves synchronously (backward compat)", async ({
    page,
  }) => {
    await page.goto("/payments/send")
    await waitForHydration(page)

    const recipient = page.locator("#recipient")
    await recipient.fill(
      "sip:solana:7x3Fh9wKpEufGCBhEkGL3tqEFBTpRNMFEP2CqAbH7mxm:2Bp4kL1CEMnP4Fd8KXk3H5bWmZFnfHvTTjw8Z9kT6yGP",
    )

    await expect(
      page.getByText(/SIP stealth address ready/i),
    ).toBeVisible({ timeout: 5_000 })
    await expect(
      page.getByText(/Resolving/i),
    ).toHaveCount(0)
  })
})
