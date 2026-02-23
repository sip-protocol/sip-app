# E2E Mainnet Testing — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Playwright E2E suite verifying all 13 Graveyard hackathon flows complete successfully in demo mode on the live app.

**Architecture:** Playwright tests run against `app.sip-protocol.org` (or local dev server). Each test navigates to a track page, activates demo mode via Zustand store injection, executes the primary action, and asserts the flow completes with stealth address generation.

**Tech Stack:** Playwright 1.58.2, TypeScript, Next.js App Router

---

### Task 1: Playwright Config

**Files:**
- Create: `e2e/playwright.config.ts`

**Step 1: Create Playwright config**

```typescript
import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
})
```

**Step 2: Verify Playwright finds config**

Run: `cd /Users/rector/local-dev/sip-app && npx playwright test --list 2>&1 | head -5`
Expected: "Listing 0 tests" or config found message

**Step 3: Commit**

```bash
git add e2e/playwright.config.ts
git commit -m "chore(e2e): add Playwright config"
```

---

### Task 2: E2E Helpers

**Files:**
- Create: `e2e/helpers/demo-mode.ts`
- Create: `e2e/helpers/assertions.ts`

**Step 1: Create demo mode helper**

```typescript
// e2e/helpers/demo-mode.ts
import type { Page } from "@playwright/test"

/**
 * Enable demo mode by injecting into Zustand store via page context.
 * Must be called after page navigation (store exists after React hydration).
 */
export async function enableDemoMode(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Zustand stores are accessible via the useSyncExternalStore subscriber
    // Simpler approach: dispatch to the store via window
    const event = new CustomEvent("sip-demo-mode", { detail: true })
    window.dispatchEvent(event)
  })

  // Fallback: click the "Try Demo" button if visible
  const demoBtn = page.getByRole("button", { name: /Try Demo/i })
  if (await demoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await demoBtn.click()
  }
}

/**
 * Wait for page to be fully hydrated (Next.js app router).
 */
export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle")
  // Wait for React to hydrate
  await page.waitForTimeout(1000)
}
```

**Step 2: Create assertions helper**

```typescript
// e2e/helpers/assertions.ts
import { expect, type Page } from "@playwright/test"

/**
 * Collect console errors during test execution.
 * Call at start of test, check at end.
 */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text()
      // Ignore known benign errors
      if (text.includes("favicon") || text.includes("next-router")) return
      errors.push(text)
    }
  })
  return errors
}

/**
 * Assert no critical console errors occurred.
 */
export function assertNoConsoleErrors(errors: string[]): void {
  const critical = errors.filter(
    (e) =>
      !e.includes("hydration") &&
      !e.includes("Warning:") &&
      !e.includes("DevTools")
  )
  expect(critical, `Console errors: ${critical.join("\n")}`).toHaveLength(0)
}

/**
 * Assert a stealth address was generated (visible in the page).
 */
export async function assertStealthAddress(page: Page): Promise<void> {
  const stealthEl = page.locator("text=/sip:solana:|0x[a-f0-9]{8}/i").first()
  await expect(stealthEl).toBeVisible({ timeout: 15_000 })
}

/**
 * Assert the flow completed (status shows completed state).
 */
export async function assertFlowCompleted(
  page: Page,
  completedText: string | RegExp
): Promise<void> {
  const status = page.locator(`text=${completedText}`).first()
  await expect(status).toBeVisible({ timeout: 30_000 })
}
```

**Step 3: Commit**

```bash
git add e2e/helpers/
git commit -m "chore(e2e): add demo mode and assertion helpers"
```

---

### Task 3: Showcase Page Test

**Files:**
- Create: `e2e/showcase.spec.ts`

The simplest test — verifies the graveyard showcase page loads all 11 track cards.

**Step 1: Write the test**

```typescript
// e2e/showcase.spec.ts
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
```

**Step 2: Run to verify**

Run: `cd /Users/rector/local-dev/sip-app && E2E_BASE_URL=https://app.sip-protocol.org npx playwright test e2e/showcase.spec.ts`
Expected: PASS (or adjust selectors if needed)

**Step 3: Commit**

```bash
git add e2e/showcase.spec.ts
git commit -m "test(e2e): add showcase page test"
```

---

### Task 4: Track Test Template + First 4 Tracks

**Files:**
- Create: `e2e/helpers/track-test.ts` — shared track test factory
- Create: `e2e/tracks/payments.spec.ts`
- Create: `e2e/tracks/governance.spec.ts`
- Create: `e2e/tracks/art.spec.ts`
- Create: `e2e/tracks/social.spec.ts`

**Step 1: Create track test factory**

```typescript
// e2e/helpers/track-test.ts
import { test, expect, type Page } from "@playwright/test"
import { enableDemoMode, waitForHydration } from "./demo-mode"
import { collectConsoleErrors, assertNoConsoleErrors } from "./assertions"

export interface TrackTestConfig {
  name: string
  route: string
  /** Text/label to identify the submit button */
  submitButton: string | RegExp
  /** Text that appears when flow completes */
  completedText: string | RegExp
  /** Optional: fields to fill before submitting */
  fillFields?: (page: Page) => Promise<void>
  /** Optional: additional assertions after completion */
  extraAssertions?: (page: Page) => Promise<void>
}

/**
 * Generate a standard demo-mode E2E test for a graveyard track.
 */
export function createTrackTest(config: TrackTestConfig) {
  test.describe(`${config.name} Track`, () => {
    test("page loads without errors", async ({ page }) => {
      const errors = collectConsoleErrors(page)
      await page.goto(config.route)
      await waitForHydration(page)
      await expect(page).not.toHaveTitle(/error|500|404/i)
      assertNoConsoleErrors(errors)
    })

    test("completes full demo flow", async ({ page }) => {
      const errors = collectConsoleErrors(page)
      await page.goto(config.route)
      await waitForHydration(page)

      // Enable demo mode
      await enableDemoMode(page)
      await page.waitForTimeout(500)

      // Fill any required fields
      if (config.fillFields) {
        await config.fillFields(page)
      }

      // Click submit
      const submitBtn = page.getByRole("button", { name: config.submitButton })
      await expect(submitBtn).toBeEnabled({ timeout: 5000 })
      await submitBtn.click()

      // Wait for completion
      await expect(
        page.getByText(config.completedText).first()
      ).toBeVisible({ timeout: 30_000 })

      assertNoConsoleErrors(errors)
    })
  })
}
```

**Step 2: Create payments test**

```typescript
// e2e/tracks/payments.spec.ts
import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Payments",
  route: "/payments/send",
  submitButton: /Send|Shield|Transfer/i,
  completedText: /sent|confirmed|complete/i,
  fillFields: async (page) => {
    // Fill recipient address (any valid-looking address)
    const recipientInput = page.getByPlaceholder(/address|recipient|wallet/i).first()
    if (await recipientInput.isVisible().catch(() => false)) {
      await recipientInput.fill("S1P9WhBSbAGGatvrVE4TRBZfWpbG96U26zksy2TQj8q")
    }
    // Fill amount
    const amountInput = page.getByPlaceholder(/amount/i).first()
    if (await amountInput.isVisible().catch(() => false)) {
      await amountInput.fill("0.001")
    }
  },
})
```

**Step 3: Create governance test**

```typescript
// e2e/tracks/governance.spec.ts
import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Governance",
  route: "/governance/vote",
  submitButton: /Vote|Cast|Submit/i,
  completedText: /voted|cast|confirmed|committed/i,
})
```

**Step 4: Create art test**

```typescript
// e2e/tracks/art.spec.ts
import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Art",
  route: "/art/create",
  submitButton: /Generate|Create|Mint/i,
  completedText: /generated|created|minted/i,
})
```

**Step 5: Create social test**

```typescript
// e2e/tracks/social.spec.ts
import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Social",
  route: "/social/profile",
  submitButton: /Create|Generate|Profile/i,
  completedText: /created|profile|stealth/i,
  fillFields: async (page) => {
    const usernameInput = page.getByPlaceholder(/username|name/i).first()
    if (await usernameInput.isVisible().catch(() => false)) {
      await usernameInput.fill("e2e_test_user")
    }
  },
})
```

**Step 6: Run first 4 track tests**

Run: `cd /Users/rector/local-dev/sip-app && E2E_BASE_URL=https://app.sip-protocol.org npx playwright test e2e/tracks/ --grep "page loads"`
Expected: 4 "page loads" tests PASS

**Step 7: Commit**

```bash
git add e2e/helpers/track-test.ts e2e/tracks/payments.spec.ts e2e/tracks/governance.spec.ts e2e/tracks/art.spec.ts e2e/tracks/social.spec.ts
git commit -m "test(e2e): add track test factory + payments, governance, art, social tests"
```

---

### Task 5: Remaining 9 Track Tests

**Files:**
- Create: `e2e/tracks/ticketing.spec.ts`
- Create: `e2e/tracks/gaming.spec.ts`
- Create: `e2e/tracks/music.spec.ts`
- Create: `e2e/tracks/channel.spec.ts`
- Create: `e2e/tracks/loyalty.spec.ts`
- Create: `e2e/tracks/desci.spec.ts`
- Create: `e2e/tracks/metaverse.spec.ts`
- Create: `e2e/tracks/migrations.spec.ts`
- Create: `e2e/tracks/dex.spec.ts`

**Step 1: Create all 9 tests**

```typescript
// e2e/tracks/ticketing.spec.ts
import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Ticketing",
  route: "/ticketing",
  submitButton: /Purchase|Buy|Ticket/i,
  completedText: /purchased|confirmed|ticket/i,
})
```

```typescript
// e2e/tracks/gaming.spec.ts
import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Gaming",
  route: "/gaming/play",
  submitButton: /Play|Start|Rock|Paper|Scissors/i,
  completedText: /won|lost|draw|revealed|result/i,
})
```

```typescript
// e2e/tracks/music.spec.ts
import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Music",
  route: "/music/playlist",
  submitButton: /Create|Playlist|Generate/i,
  completedText: /created|playlist|encrypted/i,
})
```

```typescript
// e2e/tracks/channel.spec.ts
import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Channel",
  route: "/channel/create",
  submitButton: /Publish|Create|Drop/i,
  completedText: /published|created|drop/i,
})
```

```typescript
// e2e/tracks/loyalty.spec.ts
import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Loyalty",
  route: "/loyalty/rewards",
  submitButton: /Claim|Reward|Redeem/i,
  completedText: /claimed|redeemed|reward/i,
})
```

```typescript
// e2e/tracks/desci.spec.ts
import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "DeSci",
  route: "/desci/review",
  submitButton: /Review|Submit|Fund/i,
  completedText: /reviewed|submitted|funded/i,
})
```

```typescript
// e2e/tracks/metaverse.spec.ts
import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Metaverse",
  route: "/metaverse/teleport",
  submitButton: /Teleport|Enter|Go/i,
  completedText: /teleported|arrived|entered/i,
})
```

```typescript
// e2e/tracks/migrations.spec.ts
import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "Migrations",
  route: "/migrations",
  submitButton: /Migrate|Start|Begin/i,
  completedText: /migrated|complete|finished/i,
})
```

```typescript
// e2e/tracks/dex.spec.ts
import { createTrackTest } from "../helpers/track-test"

createTrackTest({
  name: "DEX",
  route: "/dex",
  submitButton: /Swap|Trade|Exchange/i,
  completedText: /swapped|traded|confirmed/i,
})
```

**Step 2: Run all track "page loads" tests**

Run: `cd /Users/rector/local-dev/sip-app && E2E_BASE_URL=https://app.sip-protocol.org npx playwright test e2e/ --grep "page loads"`
Expected: 14 tests PASS (13 tracks + showcase)

**Step 3: Commit**

```bash
git add e2e/tracks/
git commit -m "test(e2e): add remaining 9 track tests (ticketing, gaming, music, channel, loyalty, desci, metaverse, migrations, dex)"
```

---

### Task 6: Run Full E2E Suite + Fix Selectors

**Step 1: Run all tests including demo flows**

Run: `cd /Users/rector/local-dev/sip-app && E2E_BASE_URL=https://app.sip-protocol.org npx playwright test e2e/ --reporter=list`

**Step 2: Fix failing selectors**

Tests will likely fail on:
- Button text not matching regex (check actual button text in app)
- Completion text not matching (check actual status display)
- Demo mode button variant ("Try Demo" vs other text)

For each failure:
1. Run with `--headed` to see the actual page
2. Update the regex in the track config
3. Re-run until green

**Step 3: Commit fixes**

```bash
git add e2e/
git commit -m "fix(e2e): adjust selectors after live app verification"
```

---

### Task 7: Update Documentation

**Files:**
- Modify: `/Users/rector/local-dev/sip-app/CLAUDE.md` (if exists)
- Modify: `/Users/rector/local-dev/sip-protocol/CLAUDE.md`

**Step 1: Update sip-app docs**

Add E2E section to CLAUDE.md with:
- `pnpm test:e2e` command
- Test count (14 specs, ~28 tests)
- Note about `E2E_BASE_URL` env var

**Step 2: Update sip-protocol CLAUDE.md**

Update sip-app entry in the repo index:
- Add E2E test count to the test table
- Update total test count

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add E2E test suite to CLAUDE.md"
```

---

### Task 8: Final Verification + Push

**Step 1: Run full suite one more time**

Run: `cd /Users/rector/local-dev/sip-app && E2E_BASE_URL=https://app.sip-protocol.org npx playwright test e2e/ --reporter=list`
Expected: All green

**Step 2: Run existing unit tests to ensure no regressions**

Run: `cd /Users/rector/local-dev/sip-app && pnpm test -- --run 2>&1 | tail -5`
Expected: 1,184+ tests pass

**Step 3: Push all commits**

```bash
git push
```
