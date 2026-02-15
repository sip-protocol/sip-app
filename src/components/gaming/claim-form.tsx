"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { useClaimGameReward } from "@/hooks/use-claim-game-reward"
import { GamingPrivacyToggle } from "./gaming-privacy-toggle"
import { GamingStatus } from "./gaming-status"
import { StealthRewardDisplay } from "./stealth-reward-display"
import { REWARD_TIER_COLORS, SAMPLE_RESULTS } from "@/lib/gaming/constants"
import type { RewardTier } from "@/lib/gaming/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

const REWARD_TIERS: { value: RewardTier; label: string }[] = [
  { value: "bronze", label: "Bronze" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "diamond", label: "Diamond" },
]

interface ClaimFormProps {
  onClaimed?: () => void
}

export function ClaimForm({ onClaimed }: ClaimFormProps) {
  const { connected } = useWallet()

  const [rewardTier, setRewardTier] = useState<RewardTier>("bronze")
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const {
    status,
    activeRecord,
    error,
    claimReward,
    reset: resetClaim,
  } = useClaimGameReward()

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = {
    shielded: PrivacyLevel.SHIELDED,
    compliant: PrivacyLevel.COMPLIANT,
    transparent: PrivacyLevel.TRANSPARENT,
  }

  // Use the first won result as the claimable game
  const claimableResult = SAMPLE_RESULTS.find((r) => r.won)

  const isFormReady = connected && status === "idle" && claimableResult
  const isClaiming =
    status === "generating_stealth" || status === "claiming_reward"
  const isClaimed = status === "claimed"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady || !claimableResult) return

      await claimReward({
        gameId: claimableResult.gameId,
        rewardTier,
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [
      isFormReady,
      claimableResult,
      rewardTier,
      privacyLevel,
      claimReward,
      privacyMap,
    ]
  )

  const handleReset = useCallback(() => {
    resetClaim()
    setRewardTier("bronze")
    onClaimed?.()
  }, [resetClaim, onClaimed])

  // Claimed state
  if (isClaimed && activeRecord) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <GamingStatus currentStep="claimed" mode="claim" />
        <StealthRewardDisplay
          stealthAddress={activeRecord.stealthAddress ?? ""}
          metaAddress={activeRecord.stealthMetaAddress ?? ""}
          gameTitle={activeRecord.gameTitle ?? ""}
          rewardTier={activeRecord.rewardTier ?? "bronze"}
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
          Claim your game winnings privately via stealth address
        </p>
      </div>

      {/* Claimable result */}
      {claimableResult ? (
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-sip-green-400">
                Victory Available
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Game:{" "}
                {claimableResult.gameId.replace("game-", "").replace(/-/g, " ")}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                REWARD_TIER_COLORS[claimableResult.rewardTier].bg,
                REWARD_TIER_COLORS[claimableResult.rewardTier].color
              )}
            >
              {REWARD_TIER_COLORS[claimableResult.rewardTier].label}
            </span>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            No victories to claim. Play a game first!
          </p>
        </div>
      )}

      {/* Reward tier selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Reward Tier
        </label>
        <select
          value={rewardTier}
          onChange={(e) => setRewardTier(e.target.value as RewardTier)}
          disabled={isClaiming}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-orange-500 transition-colors"
        >
          {REWARD_TIERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <GamingPrivacyToggle
          value={privacyLevel}
          onChange={setPrivacyLevel}
          disabled={isClaiming}
        />
      </div>

      {/* Status (during claim) */}
      {isClaiming && (
        <div className="mb-6">
          <GamingStatus
            currentStep={status as "generating_stealth" | "claiming_reward"}
            mode="claim"
          />
        </div>
      )}

      {/* Error state */}
      {status === "failed" && (
        <div className="mb-6">
          <GamingStatus currentStep="failed" mode="claim" error={error} />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormReady}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-colors",
          isFormReady
            ? "bg-gradient-to-r from-orange-500 to-orange-700 text-white hover:from-orange-400 hover:to-orange-600"
            : "bg-orange-600/30 text-white/50 cursor-not-allowed"
        )}
      >
        {!connected
          ? "Connect Wallet"
          : isClaiming
            ? "Claiming..."
            : "Claim Reward"}
      </button>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Delivery</span>
          <span className="text-orange-400 font-medium">Stealth Address</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-[var(--text-secondary)]">Powered by</span>
          <span className="text-[var(--text-primary)]">MagicBlock</span>
        </div>
      </div>
    </form>
  )
}
