"use client"

import type { ReactNode } from "react"
import { useState, useCallback, useMemo } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import {
  LockSimpleIcon,
  EyeIcon,
  LockSimpleOpenIcon,
} from "@phosphor-icons/react"
import { useDemoModeStore } from "@/stores/demo-mode"
import { DemoBanner } from "@/components/ui/demo-banner"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { useLoyaltyCampaign } from "@/hooks/use-loyalty-campaign"
import { TransactionStatus } from "@/components/solana/transaction-status"
import { LoyaltyPrivacyToggle } from "./loyalty-privacy-toggle"
import { LoyaltyStatus } from "./loyalty-status"
import type { Campaign } from "@/lib/loyalty/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

interface JoinCampaignFormProps {
  campaign: Campaign
  onJoined?: () => void
}

export function JoinCampaignForm({
  campaign,
  onJoined,
}: JoinCampaignFormProps) {
  const { connected } = useWallet()
  const { isDemoMode, enableDemo } = useDemoModeStore()

  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const {
    status,
    error,
    joinCampaign,
    reset: resetJoin,
    commitTx,
  } = useLoyaltyCampaign()

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = useMemo(
    () => ({
      shielded: PrivacyLevel.SHIELDED,
      compliant: PrivacyLevel.COMPLIANT,
      transparent: PrivacyLevel.TRANSPARENT,
    }),
    []
  )

  const privacyLabel: Record<PrivacyOption, ReactNode> = {
    shielded: (
      <span className="inline-flex items-center gap-1">
        <LockSimpleIcon size={14} weight="duotone" /> Shielded
      </span>
    ),
    compliant: (
      <span className="inline-flex items-center gap-1">
        <EyeIcon size={14} weight="duotone" /> Compliant
      </span>
    ),
    transparent: (
      <span className="inline-flex items-center gap-1">
        <LockSimpleOpenIcon size={14} weight="duotone" /> Transparent
      </span>
    ),
  }

  const isFormReady =
    (connected || isDemoMode) && (status === "idle" || status === "error")
  const isJoining = status === "selecting_campaign" || status === "joining"
  const isJoined = status === "joined"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady) return

      await joinCampaign({
        campaignId: campaign.id,
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [isFormReady, campaign.id, privacyLevel, joinCampaign, privacyMap]
  )

  const handleReset = useCallback(() => {
    resetJoin()
    onJoined?.()
  }, [resetJoin, onJoined])

  // Joined state
  if (isJoined) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <LoyaltyStatus currentStep="joined" mode="join" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Campaign</span>
            <span className="text-amber-400 font-medium">{campaign.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Reward</span>
            <span className="text-sip-green-500 font-medium">
              {campaign.rewardAmount} {campaign.rewardToken}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Required</span>
            <span className="text-[var(--text-primary)]">
              {campaign.requiredCount} actions
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Privacy</span>
            <span className="text-sip-green-500 font-medium">
              {privacyLabel[privacyLevel]}
            </span>
          </div>
        </div>

        <TransactionStatus
          status={commitTx.status}
          txSignature={commitTx.txSignature}
          explorerUrl={commitTx.explorerUrl}
          error={commitTx.error}
        />

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Back to Campaigns
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8"
    >
      {isDemoMode && <DemoBanner />}
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{campaign.icon}</span>
          <h2 className="text-lg font-semibold">{campaign.name}</h2>
        </div>
        <p className="text-sm text-[var(--text-tertiary)]">
          {campaign.description}
        </p>
      </div>

      {/* Campaign details */}
      <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[var(--text-tertiary)]">Reward</p>
            <p className="font-semibold text-amber-400">
              {campaign.rewardAmount} {campaign.rewardToken}
            </p>
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Required Actions</p>
            <p className="font-semibold">{campaign.requiredCount}</p>
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Participants</p>
            <p className="font-semibold">{campaign.participantCount}</p>
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Status</p>
            <p className="font-semibold text-sip-green-400">
              {campaign.status}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <LoyaltyPrivacyToggle
          value={privacyLevel}
          onChange={setPrivacyLevel}
          disabled={isJoining}
        />
      </div>

      {/* Status (during join) */}
      {isJoining && (
        <div className="mb-6">
          <LoyaltyStatus
            currentStep={status as "selecting_campaign" | "joining"}
            mode="join"
          />
        </div>
      )}

      {/* Error state */}
      {(status === "failed" || status === "error") && (
        <div className="mb-6">
          <LoyaltyStatus currentStep="failed" mode="join" error={error} />
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
            : "bg-amber-600/30 text-white/50 cursor-not-allowed"
        )}
      >
        {!connected && !isDemoMode
          ? "Connect Wallet"
          : isJoining
            ? "Joining..."
            : "Join Campaign"}
      </button>

      {!connected && !isDemoMode && (
        <button
          type="button"
          onClick={enableDemo}
          className="w-full mt-3 py-3 px-6 text-sm font-medium rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
        >
          Try Demo
        </button>
      )}

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Privacy</span>
          <span className="text-sip-green-500 font-medium">
            {privacyLabel[privacyLevel]}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-[var(--text-secondary)]">Powered by</span>
          <span className="text-[var(--text-primary)]">Torque Protocol</span>
        </div>
      </div>
    </form>
  )
}
