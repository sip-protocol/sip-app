"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { useGenerateArt } from "@/hooks/use-generate-art"
import { ArtStyleSelector } from "./art-style-selector"
import { ArtPrivacyToggle } from "./art-privacy-toggle"
import { ArtStatus } from "./art-status"
import { GeneratedArtDisplay } from "./generated-art-display"
import type { ArtStyleId } from "@/lib/art/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

interface GenerateArtFormProps {
  onGenerated?: () => void
  onMintRequest?: (artId: string) => void
}

export function GenerateArtForm({ onGenerated, onMintRequest }: GenerateArtFormProps) {
  const { connected } = useWallet()

  const [styleId, setStyleId] = useState<ArtStyleId | null>(null)
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const {
    status,
    generatedArt,
    error,
    generateArt,
    reset: resetGenerate,
  } = useGenerateArt()

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = {
    shielded: PrivacyLevel.SHIELDED,
    compliant: PrivacyLevel.COMPLIANT,
    transparent: PrivacyLevel.TRANSPARENT,
  }

  const privacyLabel: Record<PrivacyOption, string> = {
    shielded: "\u{1F512} Shielded",
    compliant: "\u{1F441}\uFE0F Compliant",
    transparent: "\u{1F513} Transparent",
  }

  const isFormReady = connected && styleId !== null && status === "idle"
  const isGenerating = status === "selecting_style" || status === "generating"
  const isGenerated = status === "generated"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady || !styleId) return

      await generateArt({
        styleId,
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [isFormReady, styleId, privacyLevel, generateArt, privacyMap],
  )

  const handleReset = useCallback(() => {
    resetGenerate()
    setStyleId(null)
    onGenerated?.()
  }, [resetGenerate, onGenerated])

  const handleMintRequest = useCallback(() => {
    if (generatedArt) {
      onMintRequest?.(generatedArt.id)
    }
  }, [generatedArt, onMintRequest])

  // Generated state — show art + mint CTA
  if (isGenerated && generatedArt) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <ArtStatus currentStep="generated" mode="generate" />
        <GeneratedArtDisplay
          art={generatedArt}
          onMint={handleMintRequest}
        />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Style</span>
            <span className="text-rose-400 font-medium">
              {generatedArt.parameters.styleId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Privacy</span>
            <span className="text-sip-green-500 font-medium">
              {privacyLabel[privacyLevel]}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Generate Another
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
        <h2 className="text-lg font-semibold mb-1">Generate Privacy Art</h2>
        <p className="text-sm text-[var(--text-tertiary)]">
          Create deterministic generative art from stealth address entropy
        </p>
      </div>

      {/* Style Selector */}
      <div className="mb-6">
        <ArtStyleSelector
          value={styleId}
          onChange={setStyleId}
          disabled={isGenerating}
        />
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <ArtPrivacyToggle
          value={privacyLevel}
          onChange={setPrivacyLevel}
          disabled={isGenerating}
        />
      </div>

      {/* Status (during generation) */}
      {isGenerating && (
        <div className="mb-6">
          <ArtStatus
            currentStep={status as "selecting_style" | "generating"}
            mode="generate"
          />
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="mb-6">
          <ArtStatus currentStep="failed" mode="generate" error={error} />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormReady}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-colors",
          isFormReady
            ? "bg-gradient-to-r from-rose-500 to-rose-700 text-white hover:from-rose-400 hover:to-rose-600"
            : "bg-rose-600/30 text-white/50 cursor-not-allowed",
        )}
      >
        {!connected
          ? "Connect Wallet"
          : isGenerating
            ? "Generating..."
            : !styleId
              ? "Select a Style"
              : "Generate Art"}
      </button>

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
            Exchange Art
          </span>
        </div>
      </div>
    </form>
  )
}
