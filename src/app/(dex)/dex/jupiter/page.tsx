"use client"

import { useState, useEffect, useCallback } from "react"
import { useWalletStore } from "@/stores"
import { toast } from "@/stores/toast"
import { getSDK } from "@/lib"

// Jupiter API endpoint
const JUPITER_QUOTE_API = "https://quote-api.jup.ag/v6/quote"

// Common Solana token mints
const TOKENS = {
  SOL: {
    symbol: "SOL",
    name: "Solana",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
    logo: "/tokens/sol.png",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    logo: "/tokens/usdc.png",
  },
  USDT: {
    symbol: "USDT",
    name: "Tether",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
    logo: "/tokens/usdt.png",
  },
  BONK: {
    symbol: "BONK",
    name: "Bonk",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
    logo: "/tokens/bonk.png",
  },
} as const

type TokenSymbol = keyof typeof TOKENS

interface JupiterQuote {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  priceImpactPct: string
  routePlan: Array<{
    swapInfo: {
      ammKey: string
      label: string
      inputMint: string
      outputMint: string
      inAmount: string
      outAmount: string
      feeAmount: string
      feeMint: string
    }
    percent: number
  }>
}

interface PrivacyLayer {
  stealthAddress: string
  ephemeralKey: string
  viewingKey?: string
}

export default function JupiterPage() {
  const { isConnected, address, openModal } = useWalletStore()

  // Swap state
  const [fromToken, setFromToken] = useState<TokenSymbol>("SOL")
  const [toToken, setToToken] = useState<TokenSymbol>("USDC")
  const [amount, setAmount] = useState("1")
  const [quote, setQuote] = useState<JupiterQuote | null>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)

  // Privacy state
  const [privacyEnabled, setPrivacyEnabled] = useState(true)
  const [privacyLayer, setPrivacyLayer] = useState<PrivacyLayer | null>(null)

  // UI state
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)

  // Fetch Jupiter quote
  const fetchQuote = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setQuote(null)
      return
    }

    setIsLoadingQuote(true)
    setError(null)

    try {
      const fromMint = TOKENS[fromToken].mint
      const toMint = TOKENS[toToken].mint
      const fromDecimals = TOKENS[fromToken].decimals
      const amountLamports = Math.floor(
        parseFloat(amount) * Math.pow(10, fromDecimals)
      )

      const url = new URL(JUPITER_QUOTE_API)
      url.searchParams.set("inputMint", fromMint)
      url.searchParams.set("outputMint", toMint)
      url.searchParams.set("amount", amountLamports.toString())
      url.searchParams.set("slippageBps", "50") // 0.5% slippage

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error("Failed to fetch quote from Jupiter")
      }

      const data: JupiterQuote = await response.json()
      setQuote(data)

      // Generate privacy layer when quote is fetched
      if (privacyEnabled) {
        await generatePrivacyLayer()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch quote")
      setQuote(null)
    } finally {
      setIsLoadingQuote(false)
    }
  }, [amount, fromToken, toToken, privacyEnabled])

  // Generate privacy layer (stealth address)
  const generatePrivacyLayer = useCallback(async () => {
    try {
      const sdk = await getSDK()

      // Generate Ed25519 stealth meta-address for Solana
      const { metaAddress, viewingPrivateKey } =
        sdk.generateEd25519StealthMetaAddress("solana")

      // Generate one-time stealth address
      const { stealthAddress } = sdk.generateEd25519StealthAddress(metaAddress)

      setPrivacyLayer({
        stealthAddress: stealthAddress.address,
        ephemeralKey: stealthAddress.ephemeralPublicKey,
        viewingKey: viewingPrivateKey,
      })
    } catch (err) {
      console.error("Failed to generate privacy layer:", err)
    }
  }, [])

  // Fetch quote when inputs change
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (amount && parseFloat(amount) > 0) {
        fetchQuote()
      }
    }, 500)

    return () => clearTimeout(debounce)
  }, [amount, fromToken, toToken, fetchQuote])

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      toast.success(`${label} copied to clipboard`)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error("Failed to copy to clipboard")
    }
  }, [])

  // Format output amount
  const formatOutput = (outAmount: string, decimals: number) => {
    const value = parseInt(outAmount) / Math.pow(10, decimals)
    return value.toLocaleString(undefined, { maximumFractionDigits: 6 })
  }

  // Truncate address
  const truncate = (addr: string, start = 6, end = 4) => {
    if (addr.length <= start + end + 3) return addr
    return `${addr.slice(0, start)}...${addr.slice(-end)}`
  }

  // Swap tokens
  const swapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
  }

  return (
    <div className="mx-auto max-w-2xl px-3 py-4 pb-safe sm:px-4 sm:py-12">
      {/* Header */}
      <div className="mb-6 text-center sm:mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
            <JupiterIcon className="h-3 w-3" />
            Jupiter Aggregator
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
            <ShieldIcon className="h-3 w-3" />
            SIP Privacy
          </span>
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          Private Jupiter Swaps
        </h1>
        <p className="mt-2 text-sm text-gray-400 sm:text-base">
          Best prices from Jupiter, cryptographic privacy from SIP
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Swap Card */}
      <div className="card">
        {/* Privacy Toggle */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            {privacyEnabled ? (
              <ShieldIcon className="h-5 w-5 text-purple-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
            <span
              className={`text-sm font-medium ${privacyEnabled ? "text-purple-400" : "text-gray-400"}`}
            >
              {privacyEnabled ? "Privacy Enabled" : "Privacy Disabled"}
            </span>
          </div>
          <button
            onClick={() => setPrivacyEnabled(!privacyEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              privacyEnabled ? "bg-purple-600" : "bg-gray-700"
            }`}
            aria-label="Toggle privacy"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                privacyEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Wallet Connection or Swap Interface */}
        {!isConnected ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10">
              <WalletIcon className="h-8 w-8 text-purple-400" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Connect Wallet</h2>
            <p className="mb-6 text-sm text-gray-400">
              Connect your Solana wallet to start swapping with privacy
            </p>
            <button
              onClick={openModal}
              className="min-h-[52px] w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-medium text-white transition-all hover:from-purple-600 hover:to-pink-600"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connected Address */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Connected:</span>
              <span className="font-mono text-gray-300">
                {truncate(address || "")}
              </span>
            </div>

            {/* From Token */}
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-3 sm:p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-400">You pay</span>
                <span className="text-xs text-gray-500">Balance: --</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="min-w-0 flex-1 bg-transparent text-xl font-medium outline-none placeholder:text-gray-600 sm:text-2xl"
                  aria-label="Amount to swap"
                />
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowFromDropdown(!showFromDropdown)
                      setShowToDropdown(false)
                    }}
                    className="flex min-h-[44px] items-center gap-2 rounded-lg bg-gray-700 px-3 py-2 transition-colors hover:bg-gray-600"
                    aria-label={`Select source token: ${fromToken}`}
                    aria-expanded={showFromDropdown}
                  >
                    <span className="text-base font-medium sm:text-lg">
                      {TOKENS[fromToken].symbol}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </button>
                  {showFromDropdown && (
                    <TokenDropdown
                      tokens={Object.keys(TOKENS) as TokenSymbol[]}
                      selected={fromToken}
                      onSelect={(symbol) => {
                        setFromToken(symbol)
                        setShowFromDropdown(false)
                      }}
                      onClose={() => setShowFromDropdown(false)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="relative z-10 -my-2 flex justify-center">
              <button
                onClick={swapTokens}
                className="rounded-lg border border-gray-700 bg-gray-900 p-2 transition-all hover:rotate-180 hover:border-purple-500"
                aria-label="Swap tokens"
              >
                <ArrowDownIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* To Token */}
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-3 sm:p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-400">You receive</span>
                {privacyEnabled && (
                  <span className="flex items-center gap-1 text-xs text-purple-400">
                    <LockIcon className="h-3 w-3" />
                    Private
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1 text-xl font-medium sm:text-2xl">
                  {isLoadingQuote ? (
                    <LoadingSpinner />
                  ) : quote ? (
                    formatOutput(quote.outAmount, TOKENS[toToken].decimals)
                  ) : (
                    <span className="text-gray-600">0.0</span>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowToDropdown(!showToDropdown)
                      setShowFromDropdown(false)
                    }}
                    className="flex min-h-[44px] items-center gap-2 rounded-lg bg-gray-700 px-3 py-2 transition-colors hover:bg-gray-600"
                    aria-label={`Select destination token: ${toToken}`}
                    aria-expanded={showToDropdown}
                  >
                    <span className="text-base font-medium sm:text-lg">
                      {TOKENS[toToken].symbol}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </button>
                  {showToDropdown && (
                    <TokenDropdown
                      tokens={Object.keys(TOKENS) as TokenSymbol[]}
                      selected={toToken}
                      onSelect={(symbol) => {
                        setToToken(symbol)
                        setShowToDropdown(false)
                      }}
                      onClose={() => setShowToDropdown(false)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Quote Details */}
            {quote && (
              <div className="space-y-2 rounded-xl border border-gray-700/50 bg-gray-800/30 p-3 text-sm sm:p-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Price Impact</span>
                  <span
                    className={
                      parseFloat(quote.priceImpactPct) > 1
                        ? "text-amber-400"
                        : "text-gray-300"
                    }
                  >
                    {parseFloat(quote.priceImpactPct).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Route</span>
                  <span className="text-right text-gray-300">
                    {quote.routePlan.map((r) => r.swapInfo.label).join(" → ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Powered by</span>
                  <span className="flex items-center gap-1 text-green-400">
                    <ZapIcon className="h-3 w-3" />
                    Jupiter
                  </span>
                </div>
              </div>
            )}

            {/* Privacy Layer */}
            {privacyEnabled && privacyLayer && (
              <div className="space-y-3 rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 sm:p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-purple-400">
                  <ShieldIcon className="h-4 w-4" />
                  Privacy Layer Active
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                    <span className="text-gray-400">Stealth Recipient:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-purple-300">
                        {truncate(privacyLayer.stealthAddress)}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            privacyLayer.stealthAddress,
                            "Stealth address"
                          )
                        }
                        className="rounded p-1 hover:bg-purple-500/20"
                        aria-label="Copy stealth address"
                      >
                        {copied === "Stealth address" ? (
                          <CheckIcon className="h-3 w-3 text-green-400" />
                        ) : (
                          <CopyIcon className="h-3 w-3 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Output will be sent to a one-time unlinkable address
                  </p>
                </div>
              </div>
            )}

            {/* Swap Button */}
            <button
              disabled={!quote || isLoadingQuote}
              className="min-h-[52px] w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 font-medium text-white transition-all hover:from-purple-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingQuote
                ? "Loading..."
                : privacyEnabled
                  ? "Swap Privately"
                  : "Swap"}
            </button>

            <p className="text-center text-xs text-gray-500">
              This is a demonstration. Real swaps require transaction signing.
            </p>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900/30 p-4 sm:mt-8 sm:p-6">
        <h3 className="mb-4 text-sm font-medium text-gray-300">
          How Private Jupiter Swaps Work
        </h3>
        <div className="space-y-3 text-sm text-gray-400">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
              1
            </span>
            <span>
              <strong className="text-gray-200">Jupiter Quote:</strong> Best
              route and price from all Solana DEXs
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
              2
            </span>
            <span>
              <strong className="text-gray-200">SIP Privacy:</strong> Generate
              stealth address for receiving tokens
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-600 text-xs font-bold text-white">
              3
            </span>
            <span>
              <strong className="text-gray-200">Private Execution:</strong>{" "}
              Output tokens go to unlinkable address
            </span>
          </div>
        </div>
      </div>

      {/* Privacy Comparison */}
      <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <div className="mb-3 flex items-center gap-2">
            <EyeIcon className="h-5 w-5 text-red-400" />
            <h3 className="font-semibold text-red-400">Standard Swap</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              <span>Wallet address visible on-chain</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              <span>All swaps linked to your identity</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              <span>Trading patterns analyzable</span>
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldIcon className="h-5 w-5 text-green-400" />
            <h3 className="font-semibold text-green-400">SIP + Jupiter</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Output to stealth address</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Each swap uses unique address</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Same Jupiter liquidity</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Token Dropdown Component
function TokenDropdown({
  tokens,
  selected,
  onSelect,
  onClose,
}: {
  tokens: TokenSymbol[]
  selected: TokenSymbol
  onSelect: (symbol: TokenSymbol) => void
  onClose: () => void
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-10"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
        {tokens.map((symbol) => (
          <button
            key={symbol}
            onClick={() => onSelect(symbol)}
            className={`flex w-full items-center gap-2 px-4 py-2 text-left transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-gray-700 ${
              symbol === selected ? "bg-gray-700" : ""
            }`}
          >
            <span className="font-medium">{symbol}</span>
            {symbol === selected && (
              <CheckIcon className="ml-auto h-4 w-4 text-purple-400" />
            )}
          </button>
        ))}
      </div>
    </>
  )
}

// Icons
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  )
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
      />
    </svg>
  )
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
      />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  )
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
      />
    </svg>
  )
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    </svg>
  )
}

function JupiterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg
      className="h-6 w-6 animate-spin text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
