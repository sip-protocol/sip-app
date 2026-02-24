import { test as base, expect } from "@playwright/test"
import { Keypair } from "@solana/web3.js"
import { injectTestWallet, hasWalletSecret } from "./wallet-injection"

interface MainnetFixtures {
  keypair: Keypair
}

/**
 * Playwright test fixture that injects the test wallet before each test.
 * Tests using this fixture get a `keypair` for address verification.
 *
 * Skips automatically when E2E_WALLET_SECRET is not set.
 */
export const test = base.extend<MainnetFixtures>({
  keypair: async ({ page }, use) => {
    const keypair = await injectTestWallet(page)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(keypair)
  },
})

/**
 * Skip the current test file when wallet secret is not available.
 * Call at the top of each mainnet spec file.
 */
export function requireWallet() {
  test.skip(!hasWalletSecret(), "E2E_WALLET_SECRET not set — skipping mainnet tests")
}

export { expect }
