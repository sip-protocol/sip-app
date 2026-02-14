"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { useMigrationExecute } from "@/hooks/use-migration-execute"
import { useDeadProtocolScan } from "@/hooks/use-dead-protocol-scan"
import { createProtocolSource, createManualSource } from "@/lib/migrations/dead-protocol-scanner"
import { ProtocolSelector } from "./protocol-selector"
import { MigrationAmountInput } from "./migration-amount-input"
import { MigrationPrivacyToggle } from "./migration-privacy-toggle"
import { MigrationSummary } from "./migration-summary"
import { MigrationStatus } from "./migration-status"
import { StealthReveal } from "./stealth-reveal"
import { CarbonImpactDisplay } from "./carbon-impact-display"
import type { DeadProtocol } from "@/lib/migrations/types"
import type { PrivacyLevel as PrivacyLevelType } from "@/components/payments/privacy-toggle"

export function MigrationWizard() {
  const { connected } = useWallet()

  // Form state
  const [selectedProtocol, setSelectedProtocol] = useState<DeadProtocol | null>(null)
  const [amount, setAmount] = useState("")
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>(
    PrivacyLevel.SHIELDED
  )

  // Hooks
  const {
    status,
    activeMigration,
    error,
    migrate,
    reset: resetMigration,
  } = useMigrationExecute()
  const { scanResult } = useDeadProtocolScan()

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
  const hasSource = selectedProtocol !== null
  const isFormReady =
    connected && hasSource && isValidAmount && status === "idle"
  const isMigrating =
    status !== "idle" && status !== "error" && status !== "complete"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady || !selectedProtocol) return

      const source =
        selectedProtocol.id === "manual"
          ? createManualSource(scanResult?.solBalance?.toFixed(4) ?? amount)
          : createProtocolSource(selectedProtocol)

      await migrate({
        source,
        amount,
        privacyLevel,
      })
    },
    [isFormReady, selectedProtocol, amount, privacyLevel, migrate, scanResult]
  )

  const handleReset = useCallback(() => {
    resetMigration()
    setAmount("")
    setSelectedProtocol(null)
  }, [resetMigration])

  // After completion
  if (status === "complete" && activeMigration) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <MigrationStatus currentStep="complete" />

        {activeMigration.stealthAddress && (
          <StealthReveal
            stealthAddress={activeMigration.stealthAddress}
            stealthMetaAddress={activeMigration.stealthMetaAddress}
          />
        )}

        {activeMigration.gsolAmount && activeMigration.carbonOffsetKg != null && (
          <CarbonImpactDisplay
            gsolAmount={activeMigration.gsolAmount}
            carbonOffsetKg={activeMigration.carbonOffsetKg}
          />
        )}

        {/* Transaction details */}
        <div className="space-y-2 text-sm">
          {activeMigration.withdrawTxHash && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Withdraw TX</span>
              <code className="font-mono text-xs text-[var(--text-tertiary)]">
                {activeMigration.withdrawTxHash.slice(0, 8)}...
                {activeMigration.withdrawTxHash.slice(-6)}
              </code>
            </div>
          )}
          {activeMigration.depositTxHash && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Deposit TX</span>
              <code className="font-mono text-xs text-[var(--text-tertiary)]">
                {activeMigration.depositTxHash.slice(0, 8)}...
                {activeMigration.depositTxHash.slice(-6)}
              </code>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Migrate Again
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8"
    >
      {/* Protocol Selector */}
      <div className="mb-6">
        <ProtocolSelector
          selected={selectedProtocol}
          onSelect={setSelectedProtocol}
          disabled={isMigrating}
        />
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <MigrationAmountInput
          value={amount}
          walletBalance={scanResult?.solBalance?.toFixed(4) ?? null}
          onValueChange={setAmount}
          disabled={isMigrating}
        />
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <MigrationPrivacyToggle
          value={
            privacyLevel === PrivacyLevel.SHIELDED
              ? "shielded"
              : privacyLevel === PrivacyLevel.COMPLIANT
                ? "compliant"
                : "transparent"
          }
          onChange={handlePrivacyChange}
          disabled={isMigrating}
        />
      </div>

      {/* Pre-submit Summary */}
      {isFormReady && selectedProtocol && (
        <div className="mb-6">
          <MigrationSummary
            source={selectedProtocol.id === "manual" ? "Manual SOL" : selectedProtocol.name}
            amount={amount}
            privacyLevel={privacyLevel}
          />
        </div>
      )}

      {/* Migration Status (during transfer) */}
      {isMigrating && (
        <div className="mb-6 space-y-4">
          <MigrationStatus
            currentStep={activeMigration?.status ?? "scanning_wallet"}
          />
          {activeMigration?.stealthAddress && (
            <StealthReveal
              stealthAddress={activeMigration.stealthAddress}
              stealthMetaAddress={activeMigration.stealthMetaAddress}
            />
          )}
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="mb-6">
          <MigrationStatus currentStep="failed" error={error} />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormReady}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-colors",
          isFormReady
            ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-500 hover:to-green-600"
            : "bg-green-600/30 text-white/50 cursor-not-allowed"
        )}
      >
        {!connected
          ? "Connect Wallet to Migrate"
          : isMigrating
            ? "Migrating..."
            : !hasSource
              ? "Select Source"
              : !isValidAmount
                ? "Enter Amount"
                : "Migrate to Sunrise"}
      </button>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Destination</span>
          <span className="text-[var(--text-primary)]">Sunrise Stake</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-[var(--text-secondary)]">You Receive</span>
          <span className="text-green-400 font-medium">gSOL (green SOL)</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-[var(--text-secondary)]">Privacy</span>
          <span className="text-green-500 font-medium">
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
