"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { VersionedTransaction } from "@solana/web3.js"
import { useWalletStore } from "@/stores"
import { toast } from "@/stores/toast"
import { getSDK } from "@/lib"
import { hexToBase58 } from "@/lib/stealth-browser-fallback"
import { getJupiterSwapTransaction } from "@/lib/dex/jupiter-client"
import { logger } from "@/lib/logger"
import {
  ShieldCheckIcon as ShieldIcon,
  EyeIcon,
  WalletIcon,
  ArrowDownIcon,
  CaretDownIcon as ChevronDownIcon,
  LockSimpleIcon as LockIcon,
  CheckIcon,
  CopyIcon,
  LightningIcon as ZapIcon,
} from "@phosphor-icons/react"

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
  const { publicKey, signTransaction, connected: walletConnected } = useWallet()
  const { connection } = useConnection()

  // Swap state
  const [fromToken, setFromToken] = useState<TokenSymbol>("SOL")
  const [toToken, setToToken] = useState<TokenSymbol>("USDC")
  const [amount, setAmount] = useState("1")
  const [quote, setQuote] = useState<JupiterQuote | null>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)

  // Privacy state
  const [privacyEnabled, setPrivacyEnabled] = useState(true)
  const [privacyLayer, setPrivacyLayer] = useState<PrivacyLayer | null>(null)

  // Swap execution state
  const [isSwapping, setIsSwapping] = useState(false)
  const [swapTxSignature, setSwapTxSignature] = useState<string | null>(null)
  const [swapStatus, setSwapStatus] = useState<
    "idle" | "signing" | "confirming" | "success" | "error"
  >("idle")

  // UI state
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)

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
        stealthAddress: hexToBase58(stealthAddress.address),
        ephemeralKey: stealthAddress.ephemeralPublicKey,
        viewingKey: viewingPrivateKey,
      })
    } catch (err) {
      logger.error("Failed to generate privacy layer", err, "JupiterPage")
    }
  }, [])

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
  }, [amount, fromToken, toToken, privacyEnabled, generatePrivacyLayer])

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

  // Execute swap via Jupiter
  const handleSwap = useCallback(async () => {
    if (!quote || !publicKey || !signTransaction) return

    setIsSwapping(true)
    setSwapStatus("signing")
    setError(null)

    try {
      const { swapTransaction, lastValidBlockHeight } =
        await getJupiterSwapTransaction({
          quoteResponse: quote,
          userPublicKey: publicKey.toBase58(),
          destinationTokenAccount:
            privacyEnabled && privacyLayer
              ? privacyLayer.stealthAddress
              : undefined,
        })

      const txBuffer = Buffer.from(swapTransaction, "base64")
      const transaction = VersionedTransaction.deserialize(txBuffer)

      const signed = await signTransaction(transaction)

      setSwapStatus("confirming")

      const signature = await connection.sendRawTransaction(
        signed.serialize(),
        { skipPreflight: true, maxRetries: 2 }
      )

      await connection.confirmTransaction(
        {
          signature,
          lastValidBlockHeight,
          blockhash: transaction.message.recentBlockhash,
        },
        "confirmed"
      )

      setSwapTxSignature(signature)
      setSwapStatus("success")
      toast.success("Swap Complete", `Transaction: ${signature.slice(0, 8)}...`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Swap failed"
      setError(message)
      setSwapStatus("error")
      toast.error("Swap Failed", message)
    } finally {
      setIsSwapping(false)
    }
  }, [
    quote,
    publicKey,
    signTransaction,
    connection,
    privacyEnabled,
    privacyLayer,
  ])

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
            <ShieldIcon size={12} />
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
              <ShieldIcon size={20} className="text-purple-400" />
            ) : (
              <EyeIcon size={20} className="text-gray-400" />
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
              <WalletIcon size={32} className="text-purple-400" />
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
                    <ChevronDownIcon size={16} className="text-gray-400" />
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
                <ArrowDownIcon size={20} className="text-gray-400" />
              </button>
            </div>

            {/* To Token */}
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-3 sm:p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-400">You receive</span>
                {privacyEnabled && (
                  <span className="flex items-center gap-1 text-xs text-purple-400">
                    <LockIcon size={12} />
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
                    <ChevronDownIcon size={16} className="text-gray-400" />
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
                    <ZapIcon size={12} />
                    Jupiter
                  </span>
                </div>
              </div>
            )}

            {/* Privacy Layer */}
            {privacyEnabled && privacyLayer && (
              <div className="space-y-3 rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 sm:p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-purple-400">
                  <ShieldIcon size={16} />
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
                          <CheckIcon size={12} className="text-green-400" />
                        ) : (
                          <CopyIcon size={12} className="text-gray-400" />
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
              onClick={handleSwap}
              disabled={
                !quote ||
                isLoadingQuote ||
                isSwapping ||
                !publicKey ||
                !signTransaction
              }
              className="min-h-[52px] w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 font-medium text-white transition-all hover:from-purple-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSwapping
                ? swapStatus === "signing"
                  ? "Sign in Wallet..."
                  : "Confirming..."
                : isLoadingQuote
                  ? "Loading..."
                  : privacyEnabled
                    ? "Swap Privately"
                    : "Swap"}
            </button>

            {swapStatus === "success" && swapTxSignature ? (
              <p className="text-center text-xs text-green-400">
                Swap confirmed!{" "}
                <a
                  href={`https://solscan.io/tx/${swapTxSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-green-300"
                >
                  View on Solscan
                </a>
              </p>
            ) : swapStatus === "error" && error ? (
              <p className="text-center text-xs text-red-400">{error}</p>
            ) : !walletConnected ? (
              <p className="text-center text-xs text-gray-500">
                Connect wallet to execute real swaps
              </p>
            ) : null}
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
            <EyeIcon size={20} className="text-red-400" />
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
            <ShieldIcon size={20} className="text-green-400" />
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
              <CheckIcon size={16} className="ml-auto text-purple-400" />
            )}
          </button>
        ))}
      </div>
    </>
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
