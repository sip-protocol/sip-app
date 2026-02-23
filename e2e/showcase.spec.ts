import { test, expect } from "@playwright/test"
import { waitForHydration } from "./helpers/demo-mode"
import { collectConsoleErrors, assertNoConsoleErrors } from "./helpers/assertions"

test.describe("Graveyard Showcase", () => {
  test("loads all 11 track cards", async ({ page }) => {
    const errors = collectConsoleErrors(page)

    await page.goto("/showcase/graveyard-2026")
    await waitForHydration(page)

    // Should display all 11 sponsor tracks
    const trackCards = page.locator("[class*='card'], [class*='Card']")
    await expect(trackCards.first()).toBeVisible()

    // Check key track names are present
    const tracks = [
      "Governance", "Art", "Social", "Ticketing",
      "Gaming", "Music", "Metaverse", "Loyalty",
      "DeSci", "Migration", "Channel"
    ]
    for (const track of tracks) {
      await expect(
        page.getByText(track, { exact: false }).first()
      ).toBeVisible({ timeout: 5000 })
    }

    assertNoConsoleErrors(errors)
  })
})
