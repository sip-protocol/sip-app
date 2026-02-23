/**
 * TestWalletAdapter — headless wallet for Playwright E2E tests.
 *
 * Reads a Solana Keypair from `window.__SIP_TEST_WALLET` (injected via
 * page.addInitScript) and exposes it through the standard wallet-adapter
 * interface. This allows E2E tests to send real on-chain transactions
 * without a browser extension.
 *
 * NEVER import this in production code — it is loaded dynamically via
 * require() in wallet-provider.tsx only when the window global exists.
 */
import {
  BaseSignerWalletAdapter,
  WalletName,
  WalletReadyState,
} from "@solana/wallet-adapter-base"
import { Keypair, Transaction, PublicKey } from "@solana/web3.js"

export const TEST_WALLET_NAME = "SIP Test Wallet" as WalletName<"SIP Test Wallet">

export class TestWalletAdapter extends BaseSignerWalletAdapter {
  name = TEST_WALLET_NAME
  url = "https://sip-protocol.org"
  icon =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjNzRiOWZmIi8+PC9zdmc+" as string
  supportedTransactionVersions = undefined

  private _keypair: Keypair | null = null
  private _connecting = false
  private _publicKey: PublicKey | null = null

  get publicKey(): PublicKey | null {
    return this._publicKey
  }

  get connecting(): boolean {
    return this._connecting
  }

  get readyState(): WalletReadyState {
    if (typeof window === "undefined") return WalletReadyState.NotDetected
    return window.__SIP_TEST_WALLET
      ? WalletReadyState.Installed
      : WalletReadyState.NotDetected
  }

  async connect(): Promise<void> {
    if (this._keypair) return

    this._connecting = true
    try {
      if (typeof window === "undefined" || !window.__SIP_TEST_WALLET) {
        throw new Error("TestWalletAdapter: window.__SIP_TEST_WALLET not set")
      }

      const secretKey = Uint8Array.from(window.__SIP_TEST_WALLET)
      this._keypair = Keypair.fromSecretKey(secretKey)
      this._publicKey = this._keypair.publicKey

      this.emit("connect", this._publicKey)
    } finally {
      this._connecting = false
    }
  }

  async disconnect(): Promise<void> {
    this._keypair = null
    this._publicKey = null
    this.emit("disconnect")
  }

  async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
    if (!this._keypair) throw new Error("TestWalletAdapter: not connected")
    transaction.partialSign(this._keypair)
    return transaction
  }

  async signAllTransactions<T extends Transaction>(
    transactions: T[]
  ): Promise<T[]> {
    if (!this._keypair) throw new Error("TestWalletAdapter: not connected")
    for (const tx of transactions) {
      tx.partialSign(this._keypair)
    }
    return transactions
  }
}
