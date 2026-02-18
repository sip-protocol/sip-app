"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useDemoModeStore } from "@/stores/demo-mode"
import { DemoBanner } from "@/components/ui/demo-banner"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { usePlayGame } from "@/hooks/use-play-game"
import { GamingPrivacyToggle } from "./gaming-privacy-toggle"
import { GamingStatus } from "./gaming-status"
import { TransactionStatus } from "@/components/solana/transaction-status"
import type { Game } from "@/lib/gaming/types"

type RpsMove = "rock" | "paper" | "scissors"
type PrivacyOption = "shielded" | "compliant" | "transparent"

const MOVES: { id: RpsMove; emoji: string; label: string; beats: RpsMove }[] = [
  { id: "rock", emoji: "\u{270A}", label: "Rock", beats: "scissors" },
  { id: "paper", emoji: "\u{270B}", label: "Paper", beats: "rock" },
  { id: "scissors", emoji: "\u{270C}\uFE0F", label: "Scissors", beats: "paper" },
]

function resolveRps(player: RpsMove, opponent: RpsMove): "win" | "lose" | "draw" {
  if (player === opponent) return "draw"
  const playerMove = MOVES.find((m) => m.id === player)!
  return playerMove.beats === opponent ? "win" : "lose"
}

// Generate a deterministic opponent move from a seed (commitment hash)
function getOpponentMove(seed: string): RpsMove {
  const hash = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const moves: RpsMove[] = ["rock", "paper", "scissors"]
  return moves[hash % 3]
}

interface RpsGameProps {
  game: Game
  onBack?: () => void
}

export function RpsGame({ game, onBack }: RpsGameProps) {
  const { connected } = useWallet()
  const { isDemoMode, enableDemo } = useDemoModeStore()

  const [playerMove, setPlayerMove] = useState<RpsMove | null>(null)
  const [opponentMove, setOpponentMove] = useState<RpsMove | null>(null)
  const [opponentCommitment, setOpponentCommitment] = useState<string | null>(null)
  const [phase, setPhase] = useState<"select" | "committing" | "revealing" | "result">("select")
  const [outcome, setOutcome] = useState<"win" | "lose" | "draw" | null>(null)
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    status,
    activeRecord,
    error,
    playGame,
    reset: resetPlay,
  } = usePlayGame()

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = {
    shielded: PrivacyLevel.SHIELDED,
    compliant: PrivacyLevel.COMPLIANT,
    transparent: PrivacyLevel.TRANSPARENT,
  }

  const canPlay = (connected || isDemoMode) && phase === "select"

  // Generate opponent commitment when player selects a move
  useEffect(() => {
    if (playerMove && phase === "select") {
      // Opponent "commits" immediately (simulated)
      const fakeCommitment = "0x" + Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("")
      setOpponentCommitment(fakeCommitment)
    }
  }, [playerMove, phase])

  const handlePlay = useCallback(async () => {
    if (!playerMove || !canPlay) return

    setPhase("committing")

    const result = await playGame({
      gameId: game.id,
      move: playerMove,
      privacyLevel: privacyMap[privacyLevel],
    })

    if (result) {
      // Determine opponent move from commitment hash (deterministic)
      const oppMove = result.commitmentHash
        ? getOpponentMove(result.commitmentHash)
        : MOVES[Math.floor(Math.random() * 3)].id
      setOpponentMove(oppMove)

      setPhase("revealing")

      // Brief pause then show result
      revealTimerRef.current = setTimeout(() => {
        const result_ = resolveRps(playerMove, oppMove)
        setOutcome(result_)
        setPhase("result")
      }, 1500)
    }
  }, [playerMove, canPlay, game.id, privacyLevel, privacyMap, playGame])

  const handleReset = useCallback(() => {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
    resetPlay()
    setPlayerMove(null)
    setOpponentMove(null)
    setOpponentCommitment(null)
    setPhase("select")
    setOutcome(null)
  }, [resetPlay])

  const isProcessing = phase === "committing" || phase === "revealing"

  // Result screen
  if (phase === "result" && outcome) {
    const outcomeConfig = {
      win: { label: "You Win!", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", emoji: "\u{1F389}" },
      lose: { label: "You Lose!", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", emoji: "\u{1F480}" },
      draw: { label: "Draw!", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", emoji: "\u{1F91D}" },
    }
    const cfg = outcomeConfig[outcome]
    const playerMoveData = MOVES.find((m) => m.id === playerMove)!
    const opponentMoveData = MOVES.find((m) => m.id === opponentMove)!

    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8">
        {/* Outcome header */}
        <div className={cn("text-center p-6 rounded-xl mb-6", cfg.bg, "border", cfg.border)}>
          <div className="text-4xl mb-2">{cfg.emoji}</div>
          <h2 className={cn("text-2xl font-bold", cfg.color)}>{cfg.label}</h2>
        </div>

        {/* Move comparison */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-5xl mb-2">{playerMoveData.emoji}</div>
            <p className="text-sm font-medium text-[var(--text-primary)]">You</p>
            <p className="text-xs text-[var(--text-secondary)]">{playerMoveData.label}</p>
          </div>
          <div className="text-2xl text-[var(--text-tertiary)] font-bold">VS</div>
          <div className="text-center">
            <div className="text-5xl mb-2">{opponentMoveData.emoji}</div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Opponent</p>
            <p className="text-xs text-[var(--text-secondary)]">{opponentMoveData.label}</p>
          </div>
        </div>

        {/* Crypto details */}
        <div className="space-y-2 text-sm border-t border-[var(--border-default)] pt-4">
          {activeRecord?.commitmentHash && (
            <div className="flex justify-between gap-2">
              <span className="text-[var(--text-secondary)] flex-shrink-0">Your Commitment</span>
              <code className="text-xs font-mono text-orange-400/80 truncate">
                {activeRecord.commitmentHash}
              </code>
            </div>
          )}
          {opponentCommitment && (
            <div className="flex justify-between gap-2">
              <span className="text-[var(--text-secondary)] flex-shrink-0">Opponent Commitment</span>
              <code className="text-xs font-mono text-[var(--text-tertiary)] truncate">
                {opponentCommitment}
              </code>
            </div>
          )}
          {activeRecord?.encryptedContent && (
            <div className="flex justify-between gap-2">
              <span className="text-[var(--text-secondary)] flex-shrink-0">Encrypted Move</span>
              <code className="text-xs font-mono text-[var(--text-tertiary)] truncate">
                {activeRecord.encryptedContent.slice(0, 24)}...
              </code>
            </div>
          )}
        </div>

        {/* On-chain transaction */}
        {activeRecord?.txSignature && (
          <div className="mt-3">
            <TransactionStatus
              status="confirmed"
              txSignature={activeRecord.txSignature}
              explorerUrl={`https://solscan.io/tx/${activeRecord.txSignature}?cluster=devnet`}
              error={null}
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-3 px-6 text-sm font-medium rounded-xl bg-gradient-to-r from-orange-500 to-orange-700 text-white hover:from-orange-400 hover:to-orange-600 transition-colors"
          >
            Play Again
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            Back to Arena
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8">
      {isDemoMode && <DemoBanner />}

      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-2xl">{game.icon}</span>
          <h2 className="text-lg font-semibold">{game.title}</h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Choose your move. Both players commit their moves as Pedersen commitments,
          then reveal simultaneously.
        </p>
      </div>

      {/* Opponent commitment status */}
      {opponentCommitment && phase === "select" && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
          <p className="text-xs text-orange-300/80">
            Opponent has committed:{" "}
            <code className="font-mono">{opponentCommitment.slice(0, 12)}...</code>
          </p>
        </div>
      )}

      {/* Move selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3 text-center">
          {isProcessing ? "Moves Locked" : "Choose Your Move"}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {MOVES.map((move) => (
            <button
              key={move.id}
              type="button"
              disabled={isProcessing}
              onClick={() => !isProcessing && setPlayerMove(move.id)}
              className={cn(
                "flex flex-col items-center justify-center py-5 px-3 rounded-xl border-2 transition-all",
                playerMove === move.id
                  ? "border-orange-500 bg-orange-500/15 scale-105 shadow-lg shadow-orange-500/20"
                  : "border-[var(--border-default)] bg-[var(--surface-secondary)] hover:border-orange-500/40 hover:bg-orange-500/5",
                isProcessing && "opacity-60 cursor-not-allowed"
              )}
            >
              <span className="text-4xl mb-1">{move.emoji}</span>
              <span className={cn(
                "text-sm font-medium",
                playerMove === move.id ? "text-orange-400" : "text-[var(--text-secondary)]"
              )}>
                {move.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Toggle */}
      {!isProcessing && (
        <div className="mb-6">
          <GamingPrivacyToggle
            value={privacyLevel}
            onChange={setPrivacyLevel}
            disabled={isProcessing}
          />
        </div>
      )}

      {/* Status pipeline during processing */}
      {isProcessing && (
        <div className="mb-6">
          <GamingStatus
            currentStep={
              status as "committing_move" | "generating_commitment" | "revealing"
            }
            mode="play"
          />
          {phase === "revealing" && opponentMove && (
            <div className="mt-4 text-center">
              <p className="text-sm text-[var(--text-secondary)] animate-pulse">
                Revealing moves...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {status === "failed" && (
        <div className="mb-6">
          <GamingStatus currentStep="failed" mode="play" error={error} />
        </div>
      )}

      {/* Play button */}
      <button
        type="button"
        onClick={handlePlay}
        disabled={!playerMove || !canPlay}
        className={cn(
          "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-all",
          playerMove && canPlay
            ? "bg-gradient-to-r from-orange-500 to-orange-700 text-white hover:from-orange-400 hover:to-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
            : "bg-orange-600/30 text-white/50 cursor-not-allowed"
        )}
      >
        {!connected && !isDemoMode
          ? "Connect Wallet"
          : isProcessing
            ? "Committing..."
            : playerMove
              ? `Commit ${MOVES.find((m) => m.id === playerMove)?.label}`
              : "Select a Move"}
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

      {/* How it works */}
      <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
          How Commit-Reveal Works
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-[var(--surface-secondary)]">
            <div className="text-lg mb-0.5">{"\u{1F512}"}</div>
            <p className="text-[10px] text-[var(--text-tertiary)] leading-tight">
              Both commit hashed moves
            </p>
          </div>
          <div className="p-2 rounded-lg bg-[var(--surface-secondary)]">
            <div className="text-lg mb-0.5">{"\u{1F50D}"}</div>
            <p className="text-[10px] text-[var(--text-tertiary)] leading-tight">
              Reveal simultaneously
            </p>
          </div>
          <div className="p-2 rounded-lg bg-[var(--surface-secondary)]">
            <div className="text-lg mb-0.5">{"\u{2705}"}</div>
            <p className="text-[10px] text-[var(--text-tertiary)] leading-tight">
              Verify commitments match
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
