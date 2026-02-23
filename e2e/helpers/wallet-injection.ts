import type { Page } from "@playwright/test"
import { Keypair } from "@solana/web3.js"
import bs58 from "bs58"

/**
 * Inject a funded Solana keypair into the page as a test wallet.
 *
 * Sets `window.__SIP_TEST_WALLET` (secret key bytes), `walletName`
 * (for wallet-adapter autoConnect), and `sip-network` (mainnet-beta)
 * via `page.addInitScript()` — runs BEFORE React hydration.
 *
 * @returns The Keypair for address verification in tests
 */
export async function injectTestWallet(page: Page): Promise<Keypair> {
  const secret = process.env.E2E_WALLET_SECRET
  if (!secret) {
    throw new Error(
      "E2E_WALLET_SECRET env var required (base58-encoded secret key)"
    )
  }

  const secretBytes = Array.from(bs58.decode(secret))
  const keypair = Keypair.fromSecretKey(Uint8Array.from(secretBytes))

  // Inject before page loads — runs in browser context
  await page.addInitScript(
    ({ secretKey, walletName }) => {
      // Set the test wallet global
      window.__SIP_TEST_WALLET = secretKey

      // Set wallet name for wallet-adapter autoConnect
      localStorage.setItem("walletName", JSON.stringify(walletName))

      // Set network to mainnet-beta (Zustand persist format)
      localStorage.setItem(
        "sip-network",
        JSON.stringify({
          state: {
            cluster: "mainnet-beta",
            customRpc: null,
            rpcUrl:
              "https://mainnet.helius-rpc.com/?api-key=142fb48a-aa24-4083-99c8-249df5400b30",
            isMainnet: true,
          },
          version: 0,
        })
      )
    },
    {
      secretKey: secretBytes,
      walletName: "SIP Test Wallet",
    }
  )

  return keypair
}

/**
 * Check if the wallet secret is available. Returns false when not set,
 * allowing tests to skip gracefully.
 */
export function hasWalletSecret(): boolean {
  return !!process.env.E2E_WALLET_SECRET
}
