import { test, expect, requireWallet } from "../helpers/mainnet-fixture"
import { enableDemoMode, waitForHydration } from "../helpers/demo-mode"

test.describe("Debug Commit", () => {
  requireWallet()
  test.setTimeout(90_000)

  test("captures SIP-COMMIT logs on music track", async ({ page, keypair }) => {
    const logs: string[] = []
    page.on("console", (msg) => {
      const text = msg.text()
      if (text.includes("SIP-COMMIT")) logs.push(text)
    })

    await page.goto("/music/playlist")
    await waitForHydration(page)

    // Verify wallet connected
    const address = keypair.publicKey.toBase58()
    const short = `${address.slice(0, 4)}...${address.slice(-4)}`
    await expect(
      page.getByText(short).or(page.getByText(address)).first()
    ).toBeVisible({ timeout: 15_000 })

    // Enable demo mode
    await enableDemoMode(page)
    await page.waitForTimeout(2000)

    // Click Create Playlist
    const btn = page.getByRole("button", { name: /Create Playlist/i })
    await expect(btn).toBeEnabled({ timeout: 10_000 })
    await btn.click()

    // Wait for completion
    await expect(
      page.getByText(/Create Another Playlist/i).first()
    ).toBeVisible({ timeout: 60_000 })

    // Wait a bit for async commit to finish
    await page.waitForTimeout(3000)

    // Print SIP-COMMIT logs
    console.log("=== SIP-COMMIT LOGS ===")
    for (const log of logs) {
      console.log(log)
    }
    console.log(`=== Total: ${logs.length} SIP-COMMIT logs ===`)

    // Fail test if no commit logs found (so we can see output)
    expect(logs.length, "Expected SIP-COMMIT logs in console").toBeGreaterThan(0)
  })
})
