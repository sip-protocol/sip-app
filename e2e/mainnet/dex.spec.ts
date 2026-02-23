import { test, expect, requireWallet } from "../helpers/mainnet-fixture"
import { waitForHydration } from "../helpers/demo-mode"
import { collectConsoleErrors, assertNoConsoleErrors } from "../helpers/assertions"

test.describe("DEX Track [mainnet]", () => {
  requireWallet()
  test.setTimeout(90_000)

  test("wallet connects and page loads", async ({ page, keypair }) => {
    const errors = collectConsoleErrors(page)
    await page.goto("/dex")
    await waitForHydration(page)

    // Verify wallet-adapter connected — truncated address in header
    const address = keypair.publicKey.toBase58()
    const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`
    await expect(
      page.getByText(shortAddress).or(page.getByText(address)).first()
    ).toBeVisible({ timeout: 15_000 })

    // Verify key UI elements render
    const swapButton = page.locator("[data-testid='swap-button']")
    await expect(swapButton).toBeVisible({ timeout: 10_000 })
    await expect(page.locator("[data-testid='from-amount']")).toBeVisible()
    await expect(page.locator("[data-testid='to-output']")).toBeVisible()
    await expect(page.locator("[data-testid='privacy-badge']")).toBeVisible()

    assertNoConsoleErrors(errors)
  })
})
