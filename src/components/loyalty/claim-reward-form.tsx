"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { useClaimReward } from "@/hooks/use-claim-reward"
import { LoyaltyPrivacyToggle } from "./loyalty-privacy-toggle"
import { LoyaltyStatus } from "./loyalty-status"
import { StealthRewardDisplay } from "./stealth-reward-display"
import type { LoyaltyReward } from "@/lib/loyalty/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

interface ClaimRewardFormProps {
  reward: LoyaltyReward
  onClaimed?: () => void
}

export function ClaimRewardForm({ reward, onClaimed }: ClaimRewardFormProps) {
  const { connected } = useWallet()

  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const {
    status,
    activeRecord,
    error,
    claimReward,
    reset: resetClaim,
  } = useClaimReward()

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = {
    shielded: PrivacyLevel.SHIELDED,
    compliant: PrivacyLevel.COMPLIANT,
    transparent: PrivacyLevel.TRANSPARENT,
  }

  const isFormReady = connected && status === "idle"
  const isClaiming = status === "generating_stealth" || status === "claiming"
  const isClaimed = status === "claimed"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady) return

      await claimReward({
        rewardId: reward.id,
        campaignId: reward.campaignId,
        amount: reward.amount,
        token: reward.token,
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [isFormReady, reward, privacyLevel, claimReward, privacyMap],
  )

  const handleReset = useCallback(() => {
    resetClaim()
    onClaimed?.()
  }, [resetClaim, onClaimed])

  // Claimed state
  if (isClaimed && activeRecord) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <LoyaltyStatus currentStep="claimed" mode="claim" />
        <StealthRewardDisplay
          stealthAddress={activeRecord.stealthAddress ?? ""}
          metaAddress={activeRecord.stealthMetaAddress ?? ""}
          amount={reward.amount}
          token={reward.token}
        />

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Claim Another Reward
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Claim Reward</h2>
        <p className="text-sm text-[var(--text-tertiary)]">
          Claim your earned reward to a private stealth address
        </p>
      </div>

      {/* Reward details */}
      <div className="mb-6 p-4 rounded-xl bg-amber-900/20 border border-amber-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{reward.campaignName}</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {reward.amount} {reward.token}
            </p>
          </div>
          <span className="text-3xl">{"\u{1F3C6}"}</span>
        </div>
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <LoyaltyPrivacyToggle
          value={privacyLevel}
          onChange={setPrivacyLevel}
          disabled={isClaiming}
        />
      </div>

      {/* Status (during claim) */}
      {isClaiming && (
        <div className="mb-6">
          <LoyaltyStatus
            currentStep={status as "generating_stealth" | "claiming"}
            mode="claim"
          />
        </div>
      )}

      {/* Error state */}
      {status === "failed" && (
        <div className="mb-6">
          <LoyaltyStatus currentStep="failed" mode="claim" error={error} />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormReady}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-colors",
          isFormReady
            ? "bg-gradient-to-r from-amber-500 to-amber-700 text-white hover:from-amber-400 hover:to-amber-600"
            : "bg-amber-600/30 text-white/50 cursor-not-allowed",
        )}
      >
        {!connected
          ? "Connect Wallet"
          : isClaiming
            ? "Claiming..."
            : `Claim ${reward.amount} ${reward.token}`}
      </button>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Delivery</span>
          <span className="text-amber-400 font-medium">
            Stealth Address
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-[var(--text-secondary)]">Powered by</span>
          <span className="text-[var(--text-primary)]">
            Torque Protocol
          </span>
        </div>
      </div>
    </form>
  )
}
