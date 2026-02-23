import { test, expect, requireWallet } from "../helpers/mainnet-fixture"
import { enableDemoMode, waitForHydration } from "../helpers/demo-mode"

test.describe("Debug Commit", () => {
  requireWallet()
  test.setTimeout(90_000)

  test("traces SIP-COMMIT lifecycle on music track", async ({ page, keypair }) => {
    const sipLogs: string[] = []
    page.on("console", (msg) => {
      const text = msg.text()
      if (text.includes("SIP-COMMIT")) {
        sipLogs.push(`[${msg.type()}] ${text}`)
      }
    })

    await page.goto("/music/playlist")
    await waitForHydration(page)

    // Verify wallet connected
    const address = keypair.publicKey.toBase58()
    const short = `${address.slice(0, 4)}...${address.slice(-4)}`
    await expect(
      page.getByText(short).or(page.getByText(address)).first()
    ).toBeVisible({ timeout: 15_000 })

    // Enable demo mode (same as regular track test)
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

    // Extra wait for async commit
    await page.waitForTimeout(5000)

    // Print SIP-COMMIT logs
    console.log("=== SIP-COMMIT LOGS ===")
    for (const log of sipLogs) {
      console.log(log)
    }
    console.log(`=== Total: ${sipLogs.length} SIP-COMMIT logs ===`)

    // Also check __SIP_TEST_WALLET presence at this point
    const testWalletPresent = await page.evaluate(
      () => typeof window !== "undefined" && !!window.__SIP_TEST_WALLET
    )
    console.log(`__SIP_TEST_WALLET present: ${testWalletPresent}`)

    const demoMode = await page.evaluate(() => {
      try {
        const raw = localStorage.getItem("sip-demo-mode")
        return raw ? JSON.parse(raw) : null
      } catch { return null }
    })
    console.log(`Demo mode store: ${JSON.stringify(demoMode)}`)
  })
})
