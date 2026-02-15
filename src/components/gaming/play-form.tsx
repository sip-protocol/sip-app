"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { usePlayGame } from "@/hooks/use-play-game"
import { GamingPrivacyToggle } from "./gaming-privacy-toggle"
import { GamingStatus } from "./gaming-status"
import { DifficultyBadge } from "./difficulty-badge"
import { GAME_TYPE_LABELS } from "@/lib/gaming/constants"
import type { Game } from "@/lib/gaming/types"

type PrivacyOption = "shielded" | "compliant" | "transparent"

interface PlayFormProps {
  game: Game
  onResolved?: () => void
}

export function PlayForm({ game, onResolved }: PlayFormProps) {
  const { connected } = useWallet()

  const [move, setMove] = useState("")
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")

  const { status, activeRecord, error, playGame, reset: resetPlay } = usePlayGame()

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

  const isFormReady = connected && status === "idle" && move.trim()
  const isPlaying =
    status === "committing_move" ||
    status === "generating_commitment" ||
    status === "revealing"
  const isResolved = status === "resolved"

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isFormReady) return

      await playGame({
        gameId: game.id,
        move: move.trim(),
        privacyLevel: privacyMap[privacyLevel],
      })
    },
    [isFormReady, game.id, move, privacyLevel, playGame, privacyMap]
  )

  const handleReset = useCallback(() => {
    resetPlay()
    setMove("")
    onResolved?.()
  }, [resetPlay, onResolved])

  // Resolved state
  if (isResolved && activeRecord) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-4">
        <GamingStatus currentStep="resolved" mode="play" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Game</span>
            <span className="text-orange-400 font-medium">{game.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Type</span>
            <span className="text-[var(--text-primary)]">
              {GAME_TYPE_LABELS[game.gameType]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Difficulty</span>
            <DifficultyBadge difficulty={game.difficulty} />
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Outcome</span>
            <span className={cn(
              "font-medium",
              activeRecord.won ? "text-sip-green-500" : "text-red-400"
            )}>
              {activeRecord.won ? "Victory!" : "Defeated"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Privacy</span>
            <span className="text-sip-green-500 font-medium">
              {privacyLabel[privacyLevel]}
            </span>
          </div>
          {activeRecord.commitmentHash && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Commitment</span>
              <code className="text-xs font-mono text-[var(--text-tertiary)]">
                {activeRecord.commitmentHash}
              </code>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          Back to Arena
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
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{game.icon}</span>
          <h2 className="text-lg font-semibold">{game.title}</h2>
        </div>
        <p className="text-sm text-[var(--text-tertiary)]">
          {game.description}
        </p>
      </div>

      {/* Game details */}
      <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[var(--text-tertiary)]">Game Type</p>
            <p className="font-semibold">
              {GAME_TYPE_LABELS[game.gameType]}
            </p>
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Difficulty</p>
            <DifficultyBadge difficulty={game.difficulty} />
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Players</p>
            <p className="font-semibold">{game.playerCount}</p>
          </div>
          <div>
            <p className="text-[var(--text-tertiary)]">Reward</p>
            <p className="font-semibold text-orange-400">
              {game.rewardTier.charAt(0).toUpperCase() + game.rewardTier.slice(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Move input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Your Move
        </label>
        <input
          type="text"
          value={move}
          onChange={(e) => setMove(e.target.value)}
          placeholder={game.gameType === "commit_reveal" ? "Rock, Paper, or Scissors..." : game.gameType === "sealed_bid" ? "Enter bid amount..." : game.gameType === "number_guess" ? "Guess a number (1-100)..." : "Enter your move..."}
          disabled={isPlaying}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <GamingPrivacyToggle
          value={privacyLevel}
          onChange={setPrivacyLevel}
          disabled={isPlaying}
        />
      </div>

      {/* Status (during play) */}
      {isPlaying && (
        <div className="mb-6">
          <GamingStatus
            currentStep={status as "committing_move" | "generating_commitment" | "revealing"}
            mode="play"
          />
        </div>
      )}

      {/* Error state */}
      {status === "failed" && (
        <div className="mb-6">
          <GamingStatus currentStep="failed" mode="play" error={error} />
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
          : isPlaying
            ? "Committing..."
            : "Commit Move"}
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
          <span className="text-[var(--text-primary)]">MagicBlock</span>
        </div>
      </div>
    </form>
  )
}
