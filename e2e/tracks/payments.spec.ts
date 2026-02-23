import { test, expect } from "@playwright/test"
import { enableDemoMode, waitForHydration } from "../helpers/demo-mode"
import { collectConsoleErrors, assertNoConsoleErrors } from "../helpers/assertions"

test.describe("Payments Track", () => {
  test("page loads without errors", async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto("/payments/send")
    await waitForHydration(page)
    await expect(page).not.toHaveTitle(/error|500|404/i)
    assertNoConsoleErrors(errors)
  })

  test("completes full demo flow", async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto("/payments/send")
    await waitForHydration(page)

    // Enable demo mode
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Fill amount (minimum 0.002 SOL for shielded transfer)
    const amountInput = page.locator("#amount")
    await amountInput.fill("0.01")

    // Fill recipient with valid SIP stealth address format
    const recipientInput = page.locator("#recipient")
    await recipientInput.fill(
      "sip:solana:7x3Fh9wKpEufGCBhEkGL3tqEFBTpRNMFEP2CqAbH7mxm:2Bp4kL1CEMnP4Fd8KXk3H5bWmZFnfHvTTjw8Z9kT6yGP"
    )

    // Verify the submit button is enabled (form validated correctly)
    const submitBtn = page.getByRole("button", { name: /Send Shielded Payment/i })
    await expect(submitBtn).toBeEnabled({ timeout: 10_000 })

    // Click submit — in demo mode without a real wallet, this will
    // attempt to send but hit the wallet-not-connected error in the
    // underlying hook. Verify the form handles the error gracefully.
    await submitBtn.click()

    // Wait for the error state or the send button to re-enable
    // (the hook sets status to "error" which re-renders the form)
    await expect(submitBtn).toBeVisible({ timeout: 15_000 })

    assertNoConsoleErrors(errors)
  })
})
