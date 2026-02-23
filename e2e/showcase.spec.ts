import { test, expect } from "@playwright/test"
import { waitForHydration } from "./helpers/demo-mode"
import { collectConsoleErrors, assertNoConsoleErrors } from "./helpers/assertions"

test.describe("Graveyard Showcase", () => {
  test("loads all 11 track cards", async ({ page }) => {
    const errors = collectConsoleErrors(page)

    await page.goto("/showcase/graveyard-2026")
    await waitForHydration(page)

    // Check track heading names as they appear on the showcase page
    const tracks = [
      "Private Governance",
      "Anonymous Social",
      "Privacy Loyalty",
      "Privacy Art",
      "Green Migration",
      "Privacy NFTs",
      "Privacy Arena",
      "Privacy Ticketing",
      "Privacy Metaverse",
      "Privacy DeSci",
      "Privacy Music",
    ]
    for (const track of tracks) {
      const el = page.getByRole("heading", { name: track }).first()
      // Scroll into view — cards may be below the fold
      await el.scrollIntoViewIfNeeded()
      await expect(el).toBeVisible({ timeout: 10_000 })
    }

    assertNoConsoleErrors(errors)
  })
})
