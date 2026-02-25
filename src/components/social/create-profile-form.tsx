"use client"

import { useState, useCallback, useMemo } from "react"
import type { ReactNode } from "react"
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
import { useSocialProfile } from "@/hooks/use-social-profile"
import { TransactionStatus } from "@/components/solana/transaction-status"
import { SocialPrivacyToggle } from "./social-privacy-toggle"
import { SocialStatus } from "./social-status"
import { StealthIdentityDisplay } from "./stealth-identity-display"

type PrivacyOption = "shielded" | "compliant" | "transparent"

interface CreateProfileFormProps {
  onCreated?: () => void
}

export function CreateProfileForm({ onCreated }: CreateProfileFormProps) {
  const { connected } = useWallet()
  const { isDemoMode, enableDemo } = useDemoModeStore()

  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const {
    status,
    activeRecord,
    error,
    createProfile,
    reset: resetProfile,
    commitTx,
  } = useSocialProfile()

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
    (connected || isDemoMode) &&
    username.trim().length >= 3 &&
    (status === "idle" || status === "error")

  const isCreating =
    status === "generating_stealth" || status === "creating_profile"

  const isCreated = status === "profile_created"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady) return

      await createProfile({
        username: username.trim(),
        bio: bio.trim(),
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [isFormReady, username, bio, privacyLevel, createProfile, privacyMap]
  )

  const handleReset = useCallback(() => {
    resetProfile()
    setUsername("")
    setBio("")
    onCreated?.()
  }, [resetProfile, onCreated])

  // Created state
  if (isCreated && activeRecord) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <SocialStatus currentStep="profile_created" mode="profile" />
        <StealthIdentityDisplay
          stealthAddress={activeRecord.stealthAddress ?? ""}
          metaAddress={activeRecord.stealthMetaAddress ?? ""}
          viewingKeyHash={activeRecord.stealthAddress?.slice(0, 20)}
        />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Username</span>
            <span className="text-pink-400 font-medium">
              {activeRecord.username}
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
          Create Another Identity
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
        <h2 className="text-lg font-semibold mb-1">Create Stealth Identity</h2>
        <p className="text-sm text-[var(--text-tertiary)]">
          Generate an anonymous persona unlinkable to your wallet
        </p>
      </div>

      {/* Username */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="anonymous_builder"
          disabled={isCreating}
          className={cn(
            "w-full px-4 py-3 rounded-xl border bg-[var(--bg-secondary)] text-sm",
            "border-[var(--border-default)] focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30",
            "placeholder:text-[var(--text-tertiary)] outline-none transition-colors",
            isCreating && "opacity-50 cursor-not-allowed"
          )}
        />
        {username.length > 0 && username.trim().length < 3 && (
          <p className="text-xs text-red-400 mt-1">
            Username must be at least 3 characters
          </p>
        )}
      </div>

      {/* Bio */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Privacy advocate, builder, anon..."
          rows={3}
          disabled={isCreating}
          className={cn(
            "w-full px-4 py-3 rounded-xl border bg-[var(--bg-secondary)] text-sm resize-none",
            "border-[var(--border-default)] focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30",
            "placeholder:text-[var(--text-tertiary)] outline-none transition-colors",
            isCreating && "opacity-50 cursor-not-allowed"
          )}
        />
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <SocialPrivacyToggle
          value={privacyLevel}
          onChange={setPrivacyLevel}
          disabled={isCreating}
        />
      </div>

      {/* Status (during creation) */}
      {isCreating && (
        <div className="mb-6">
          <SocialStatus
            currentStep={status as "generating_stealth" | "creating_profile"}
            mode="profile"
          />
        </div>
      )}

      {/* Error state */}
      {(status === "failed" || status === "error") && (
        <div className="mb-6">
          <SocialStatus currentStep="failed" mode="profile" error={error} />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormReady}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-colors",
          isFormReady
            ? "bg-gradient-to-r from-pink-500 to-pink-700 text-white hover:from-pink-400 hover:to-pink-600"
            : "bg-pink-600/30 text-white/50 cursor-not-allowed"
        )}
      >
        {!connected && !isDemoMode
          ? "Connect Wallet"
          : isCreating
            ? "Creating..."
            : username.trim().length < 3
              ? "Enter Username"
              : "Create Stealth Identity"}
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
          <span className="text-[var(--text-primary)]">
            SIP Stealth Addresses
          </span>
        </div>
      </div>
    </form>
  )
}
