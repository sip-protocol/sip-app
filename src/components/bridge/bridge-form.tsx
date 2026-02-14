"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { useBridgeTransfer } from "@/hooks/use-bridge-transfer"
import { useBridgeRoutes } from "@/hooks/use-bridge-routes"
import { useBridgeFee } from "@/hooks/use-bridge-fee"
import { ChainSelector } from "./chain-selector"
import { BridgeAmountInput } from "./bridge-amount-input"
import { BridgePrivacyToggle } from "./bridge-privacy-toggle"
import { BridgeFeeDisplay } from "./bridge-fee-display"
import { BridgeRouteBadge } from "./bridge-route-badge"
import { BridgeSummary } from "./bridge-summary"
import { BridgeStatus } from "./bridge-status"
import { BridgeStealthReveal } from "./bridge-stealth-reveal"
import { getTokensForRoute } from "@/lib/bridge/constants"
import type { BridgeChainId } from "@/lib/bridge/types"
import type { PrivacyLevel as PrivacyLevelType } from "@/components/payments/privacy-toggle"

export function BridgeForm() {
  const { connected } = useWallet()

  // Form state
  const [sourceChain, setSourceChain] = useState<BridgeChainId | null>("solana")
  const [destChain, setDestChain] = useState<BridgeChainId | null>(null)
  const [amount, setAmount] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>(
    PrivacyLevel.SHIELDED
  )

  // Hooks
  const {
    status,
    activeTransfer,
    error,
    bridge,
    reset: resetBridge,
  } = useBridgeTransfer()
  const { availableDestChains, availableTokens, estimatedTime } =
    useBridgeRoutes(sourceChain, destChain)
  const { fee } = useBridgeFee(amount, token)

  // Auto-select first token when route changes
  const handleDestChange = useCallback(
    (chain: BridgeChainId) => {
      setDestChain(chain)
      // Reset token if not available on new route
      if (sourceChain) {
        const tokens = getTokensForRoute(sourceChain, chain)
        if (tokens.length > 0 && (!token || !tokens.includes(token))) {
          setToken(tokens[0])
        }
      }
    },
    [sourceChain, token]
  )

  const handleSourceChange = useCallback(
    (chain: BridgeChainId) => {
      setSourceChain(chain)
      // Reset dest if same as new source
      if (destChain === chain) {
        setDestChain(null)
        setToken(null)
      }
    },
    [destChain]
  )

  const handleSwapChains = useCallback(() => {
    if (sourceChain && destChain) {
      const prevSource = sourceChain
      setSourceChain(destChain)
      setDestChain(prevSource)
    }
  }, [sourceChain, destChain])

  const handlePrivacyChange = useCallback((level: PrivacyLevelType) => {
    const enumMap: Record<PrivacyLevelType, PrivacyLevel> = {
      shielded: PrivacyLevel.SHIELDED,
      compliant: PrivacyLevel.COMPLIANT,
      transparent: PrivacyLevel.TRANSPARENT,
    }
    setPrivacyLevel(enumMap[level])
  }, [])

  // Validation
  const numericAmount = parseFloat(amount) || 0
  const isValidAmount = numericAmount > 0
  const isFormReady =
    connected &&
    sourceChain &&
    destChain &&
    token &&
    isValidAmount &&
    status === "idle"
  const isBridging =
    status !== "idle" && status !== "error" && status !== "complete"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady || !sourceChain || !destChain || !token) return

      await bridge({
        sourceChain,
        destChain,
        token,
        amount,
        privacyLevel,
      })
    },
    [isFormReady, sourceChain, destChain, token, amount, privacyLevel, bridge]
  )

  const handleReset = useCallback(() => {
    resetBridge()
    setAmount("")
  }, [resetBridge])

  // After completion
  if (status === "complete" && activeTransfer) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <BridgeStatus currentStep="complete" />
        <BridgeStealthReveal
          stealthAddress={activeTransfer.stealthAddress}
          stealthMetaAddress={activeTransfer.stealthMetaAddress}
        />

        {/* Transaction details */}
        <div className="space-y-2 text-sm">
          {activeTransfer.sourceTxHash && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Source TX</span>
              <code className="font-mono text-xs text-[var(--text-tertiary)]">
                {activeTransfer.sourceTxHash.slice(0, 8)}...
                {activeTransfer.sourceTxHash.slice(-6)}
              </code>
            </div>
          )}
          {activeTransfer.destTxHash && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">
                Destination TX
              </span>
              <code className="font-mono text-xs text-[var(--text-tertiary)]">
                {activeTransfer.destTxHash.slice(0, 8)}...
                {activeTransfer.destTxHash.slice(-6)}
              </code>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Bridge Again
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8"
    >
      {/* Chain Selector */}
      <div className="mb-6">
        <ChainSelector
          sourceChain={sourceChain}
          destChain={destChain}
          availableDestChains={availableDestChains}
          onSourceChange={handleSourceChange}
          onDestChange={handleDestChange}
          onSwap={handleSwapChains}
          disabled={isBridging}
        />
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <BridgeAmountInput
          value={amount}
          token={token}
          tokens={availableTokens}
          onValueChange={setAmount}
          onTokenChange={setToken}
          disabled={isBridging}
        />
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <BridgePrivacyToggle
          value={
            privacyLevel === PrivacyLevel.SHIELDED
              ? "shielded"
              : privacyLevel === PrivacyLevel.COMPLIANT
                ? "compliant"
                : "transparent"
          }
          onChange={handlePrivacyChange}
          disabled={isBridging}
        />
      </div>

      {/* Route Badge */}
      {sourceChain && destChain && (
        <div className="mb-4">
          <BridgeRouteBadge
            estimatedTime={estimatedTime}
            privacyLevel={privacyLevel}
          />
        </div>
      )}

      {/* Fee Display */}
      {fee && numericAmount > 0 && (
        <div className="mb-4">
          <BridgeFeeDisplay fee={fee} />
        </div>
      )}

      {/* Pre-submit Summary */}
      {isFormReady && sourceChain && destChain && token && (
        <div className="mb-6">
          <BridgeSummary
            sourceChain={sourceChain}
            destChain={destChain}
            token={token}
            amount={amount}
            privacyLevel={privacyLevel}
            fee={fee}
            estimatedTime={estimatedTime}
          />
        </div>
      )}

      {/* Bridge Status (during transfer) */}
      {isBridging && (
        <div className="mb-6 space-y-4">
          <BridgeStatus
            currentStep={activeTransfer?.status ?? "generating_stealth"}
          />
          {activeTransfer?.stealthAddress && (
            <BridgeStealthReveal
              stealthAddress={activeTransfer.stealthAddress}
              stealthMetaAddress={activeTransfer.stealthMetaAddress}
            />
          )}
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="mb-6">
          <BridgeStatus currentStep="failed" error={error} />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormReady}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-colors",
          isFormReady
            ? "bg-gradient-to-r from-cyan-600 to-cyan-700 text-white hover:from-cyan-500 hover:to-cyan-600"
            : "bg-cyan-600/30 text-white/50 cursor-not-allowed"
        )}
      >
        {!connected
          ? "Connect Wallet to Bridge"
          : isBridging
            ? "Bridging..."
            : !sourceChain || !destChain
              ? "Select Chains"
              : !token
                ? "Select Token"
                : !isValidAmount
                  ? "Enter Amount"
                  : "Bridge with Privacy"}
      </button>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Protocol</span>
          <span className="text-[var(--text-primary)]">Wormhole NTT</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-[var(--text-secondary)]">Privacy</span>
          <span className="text-sip-green-500 font-medium">
            {privacyLevel === PrivacyLevel.SHIELDED &&
              "\uD83D\uDD12 Stealth Address"}
            {privacyLevel === PrivacyLevel.COMPLIANT &&
              "\uD83D\uDC41\uFE0F Compliant"}
            {privacyLevel === PrivacyLevel.TRANSPARENT &&
              "\uD83D\uDD13 Transparent"}
          </span>
        </div>
      </div>
    </form>
  )
}
