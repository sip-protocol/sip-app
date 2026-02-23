import { test, expect, requireWallet } from "../helpers/mainnet-fixture"
import { enableDemoMode, waitForHydration } from "../helpers/demo-mode"

test.describe("Governance Track [mainnet]", () => {
  requireWallet()
  test.setTimeout(90_000)

  test("wallet connects and page loads", async ({ page, keypair }) => {
    await page.goto("/governance")
    await waitForHydration(page)

    const address = keypair.publicKey.toBase58()
    const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`
    await expect(
      page.getByText(shortAddress).or(page.getByText(address)).first()
    ).toBeVisible({ timeout: 15_000 })
  })

  test("vote form displays with connected wallet", async ({ page, keypair }) => {
    await page.goto("/governance")
    await waitForHydration(page)

    // Wait for wallet
    const address = keypair.publicKey.toBase58()
    const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`
    await expect(
      page.getByText(shortAddress).or(page.getByText(address)).first()
    ).toBeVisible({ timeout: 15_000 })

    // Enable demo mode for seed proposals
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Navigate to a proposal
    const voteBtn = page.getByRole("button", { name: /^Vote$/i }).first()
    await voteBtn.click()
    await page.waitForTimeout(1000)

    // Verify vote form renders with choices
    await expect(page.getByText("Your Vote")).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText("For", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Against")).toBeVisible()
    await expect(page.getByText("Abstain")).toBeVisible()

    // Verify Commit Vote button exists (disabled without governance tokens is expected)
    const commitBtn = page.getByRole("button", { name: /Commit Vote/i })
    await expect(commitBtn).toBeVisible()
  })
})
