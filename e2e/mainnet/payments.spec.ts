import { test, expect, requireWallet } from "../helpers/mainnet-fixture"
import { enableDemoMode, waitForHydration } from "../helpers/demo-mode"
import { collectConsoleErrors, assertNoConsoleErrors } from "../helpers/assertions"

test.describe("Payments Track [mainnet]", () => {
  requireWallet()
  test.setTimeout(90_000)

  test("wallet connects and page loads", async ({ page, keypair }) => {
    const errors = collectConsoleErrors(page)
    await page.goto("/payments/send")
    await waitForHydration(page)

    // Verify wallet-adapter connected — truncated address in header
    const address = keypair.publicKey.toBase58()
    const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`
    await expect(
      page.getByText(shortAddress).or(page.getByText(address)).first()
    ).toBeVisible({ timeout: 15_000 })

    assertNoConsoleErrors(errors)
  })

  test("form validates with connected wallet", async ({ page, keypair }) => {
    const errors = collectConsoleErrors(page)
    await page.goto("/payments/send")
    await waitForHydration(page)

    // Wait for wallet connection
    const address = keypair.publicKey.toBase58()
    const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`
    await expect(
      page.getByText(shortAddress).or(page.getByText(address)).first()
    ).toBeVisible({ timeout: 15_000 })

    // Enable demo mode for seed data
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Fill amount (small enough to pass validation)
    const amountInput = page.locator("#amount")
    await amountInput.fill("0.001")

    // Fill recipient with valid SIP stealth address
    const recipientInput = page.locator("#recipient")
    await recipientInput.fill(
      "sip:solana:7x3Fh9wKpEufGCBhEkGL3tqEFBTpRNMFEP2CqAbH7mxm:2Bp4kL1CEMnP4Fd8KXk3H5bWmZFnfHvTTjw8Z9kT6yGP"
    )

    // Verify submit button is enabled (form validated with wallet connected)
    const submitBtn = page.getByRole("button", { name: /Send Shielded Payment/i })
    await expect(submitBtn).toBeEnabled({ timeout: 10_000 })

    // Verify the button does NOT say "Connect Wallet"
    await expect(submitBtn).not.toContainText(/Connect Wallet/i)

    assertNoConsoleErrors(errors)
  })
})
