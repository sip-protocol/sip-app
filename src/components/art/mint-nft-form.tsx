"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn, truncate, copyToClipboard } from "@/lib/utils"
import { useMintNFT } from "@/hooks/use-mint-nft"
import { ArtCanvas } from "./art-canvas"
import { ArtPrivacyToggle } from "./art-privacy-toggle"
import { ArtStatus } from "./art-status"
import type { GeneratedArt } from "@/lib/art/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

interface MintNFTFormProps {
  art: GeneratedArt
  onMinted?: () => void
  onReset?: () => void
}

export function MintNFTForm({ art, onReset }: MintNFTFormProps) {
  const { connected } = useWallet()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")
  const [copied, setCopied] = useState(false)

  const {
    status,
    activeRecord,
    error,
    mintNFT,
    reset: resetMint,
  } = useMintNFT()

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = {
    shielded: PrivacyLevel.SHIELDED,
    compliant: PrivacyLevel.COMPLIANT,
    transparent: PrivacyLevel.TRANSPARENT,
  }

  const isFormReady = connected && name.trim().length >= 1 && status === "idle"
  const isMinting = status === "preparing_nft" || status === "minting"
  const isMinted = status === "minted"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady) return

      await mintNFT({
        generatedArtId: art.id,
        name: name.trim(),
        description: description.trim(),
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [isFormReady, art.id, name, description, privacyLevel, mintNFT, privacyMap]
  )

  const handleCopyMint = async () => {
    if (activeRecord?.mintAddress) {
      const success = await copyToClipboard(activeRecord.mintAddress)
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  const handleReset = useCallback(() => {
    resetMint()
    setName("")
    setDescription("")
    onReset?.()
  }, [resetMint, onReset])

  // Minted state
  if (isMinted && activeRecord) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <ArtStatus currentStep="minted" mode="mint" />

        <div className="flex justify-center">
          <ArtCanvas svgData={art.svgData} size="md" />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">NFT Name</span>
            <span className="text-rose-400 font-medium">
              {activeRecord.nftName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)]">Mint Address</span>
            <button
              type="button"
              onClick={handleCopyMint}
              className="flex items-center gap-1.5 group"
            >
              <code className="text-xs font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
                {truncate(activeRecord.mintAddress ?? "", 12, 6)}
              </code>
              <span className="text-xs text-[var(--text-tertiary)]">
                {copied ? "\u2713" : "\u{1F4CB}"}
              </span>
            </button>
          </div>
        </div>

        <a
          href={`https://solscan.io/token/${activeRecord.mintAddress}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 px-6 text-sm font-medium text-center rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-900/20 transition-colors"
        >
          View on Explorer
        </a>

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Mint Another
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
        <h2 className="text-lg font-semibold mb-1">Mint as NFT</h2>
        <p className="text-sm text-[var(--text-tertiary)]">
          Mint this privacy art as a compressed NFT on Solana
        </p>
      </div>

      {/* Art Preview */}
      <div className="flex justify-center mb-6">
        <ArtCanvas svgData={art.svgData} size="md" />
      </div>

      {/* Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          NFT Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Privacy Art #1"
          disabled={isMinting}
          className={cn(
            "w-full px-4 py-3 rounded-xl border bg-[var(--bg-secondary)] text-sm",
            "border-[var(--border-default)] focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30",
            "placeholder:text-[var(--text-tertiary)] outline-none transition-colors",
            isMinting && "opacity-50 cursor-not-allowed"
          )}
        />
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deterministic art from stealth address entropy..."
          rows={3}
          disabled={isMinting}
          className={cn(
            "w-full px-4 py-3 rounded-xl border bg-[var(--bg-secondary)] text-sm resize-none",
            "border-[var(--border-default)] focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30",
            "placeholder:text-[var(--text-tertiary)] outline-none transition-colors",
            isMinting && "opacity-50 cursor-not-allowed"
          )}
        />
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <ArtPrivacyToggle
          value={privacyLevel}
          onChange={setPrivacyLevel}
          disabled={isMinting}
        />
      </div>

      {/* Status (during mint) */}
      {isMinting && (
        <div className="mb-6">
          <ArtStatus
            currentStep={status as "preparing_nft" | "minting"}
            mode="mint"
          />
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="mb-6">
          <ArtStatus currentStep="failed" mode="mint" error={error} />
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
            : "bg-rose-600/30 text-white/50 cursor-not-allowed"
        )}
      >
        {!connected
          ? "Connect Wallet"
          : isMinting
            ? "Minting..."
            : name.trim().length < 1
              ? "Enter NFT Name"
              : "Mint NFT (~$0.001)"}
      </button>
    </form>
  )
}
