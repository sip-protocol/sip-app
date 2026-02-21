"use client"

import { useState, useCallback, useRef, useMemo } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { motion, AnimatePresence } from "framer-motion"
import { useDemoModeStore } from "@/stores/demo-mode"
import { DemoBanner } from "@/components/ui/demo-banner"
import { PrivacyLevel } from "@sip-protocol/types"
import { cn } from "@/lib/utils"
import { usePlayGame } from "@/hooks/use-play-game"
import { useOnChainCommit } from "@/hooks/use-on-chain-commit"
import { GamingPrivacyToggle } from "./gaming-privacy-toggle"
import { GamingStatus } from "./gaming-status"
import { TransactionStatus } from "@/components/solana/transaction-status"
import { HashVisualization } from "./hash-visualization"
import { ConfettiParticles } from "./confetti-particles"
import type { Game } from "@/lib/gaming/types"

type RpsMove = "rock" | "paper" | "scissors"
type PrivacyOption = "shielded" | "compliant" | "transparent"
type GamePhase = "select" | "locked" | "committing" | "revealing" | "result"

const MOVES: { id: RpsMove; emoji: string; label: string; beats: RpsMove }[] = [
  { id: "rock", emoji: "\u{270A}", label: "Rock", beats: "scissors" },
  { id: "paper", emoji: "\u{270B}", label: "Paper", beats: "rock" },
  {
    id: "scissors",
    emoji: "\u{270C}\uFE0F",
    label: "Scissors",
    beats: "paper",
  },
]

function resolveRps(
  player: RpsMove,
  opponent: RpsMove
): "win" | "lose" | "draw" {
  if (player === opponent) return "draw"
  const playerMove = MOVES.find((m) => m.id === player)!
  return playerMove.beats === opponent ? "win" : "lose"
}

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
  const [opponentCommitment, setOpponentCommitment] = useState<string | null>(
    null
  )
  const [phase, setPhase] = useState<GamePhase>("select")
  const [outcome, setOutcome] = useState<"win" | "lose" | "draw" | null>(null)
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyOption>("shielded")
  const [countdown, setCountdown] = useState<number | null>(null)
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 })
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { commit: commitOnChain } = useOnChainCommit("move")

  const onCommitTransaction = useMemo(
    () => (gameId: string, gameMove: string) => commitOnChain(gameId, gameMove),
    [commitOnChain]
  )

  const {
    status,
    activeRecord,
    error,
    playGame,
    reset: resetPlay,
  } = usePlayGame({ onCommitTransaction })

  const privacyMap: Record<PrivacyOption, PrivacyLevel> = {
    shielded: PrivacyLevel.SHIELDED,
    compliant: PrivacyLevel.COMPLIANT,
    transparent: PrivacyLevel.TRANSPARENT,
  }

  const canPlay = (connected || isDemoMode) && phase === "select"

  const generateOpponentCommitment = useCallback((_move: RpsMove) => {
    const fakeCommitment =
      "0x" +
      Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("")
    setOpponentCommitment(fakeCommitment)
  }, [])

  const handlePlay = useCallback(async () => {
    if (!playerMove || !canPlay) return

    // Brief "locked" phase for confirmation feel
    setPhase("locked")
    await new Promise((r) => setTimeout(r, 500))

    setPhase("committing")

    const result = await playGame({
      gameId: game.id,
      move: playerMove,
      privacyLevel: privacyMap[privacyLevel],
    })

    if (result) {
      const oppMove = result.commitmentHash
        ? getOpponentMove(result.commitmentHash)
        : MOVES[Math.floor(Math.random() * 3)].id
      setOpponentMove(oppMove)

      // Countdown reveal: 3 → 2 → 1
      setPhase("revealing")
      for (const n of [3, 2, 1]) {
        setCountdown(n)
        await new Promise((r) => setTimeout(r, 600))
      }
      setCountdown(null)

      const gameResult = resolveRps(playerMove, oppMove)
      setOutcome(gameResult)
      setScore((prev) => ({
        wins: prev.wins + (gameResult === "win" ? 1 : 0),
        losses: prev.losses + (gameResult === "lose" ? 1 : 0),
        draws: prev.draws + (gameResult === "draw" ? 1 : 0),
      }))
      setPhase("result")
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
    setCountdown(null)
  }, [resetPlay])

  const isProcessing =
    phase === "locked" || phase === "committing" || phase === "revealing"

  // ─── Result screen ───────────────────────────────────────────────
  if (phase === "result" && outcome) {
    const outcomeConfig = {
      win: {
        label: "VICTORY",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        emoji: "\u{1F389}",
      },
      lose: {
        label: "DEFEATED",
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        emoji: "\u{1F480}",
      },
      draw: {
        label: "TIE",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        emoji: "\u{1F91D}",
      },
    }
    const cfg = outcomeConfig[outcome]
    const playerMoveData = MOVES.find((m) => m.id === playerMove)!
    const opponentMoveData = MOVES.find((m) => m.id === opponentMove)!

    return (
      <motion.div
        className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 relative overflow-hidden"
        initial={outcome === "lose" ? { x: 0 } : {}}
        animate={outcome === "lose" ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={outcome === "lose" ? { duration: 0.5 } : {}}
      >
        {outcome === "win" && <ConfettiParticles />}

        {/* Score bar */}
        <ScoreBar score={score} />

        {/* Outcome header */}
        <motion.div
          className={cn(
            "text-center p-6 rounded-xl mb-6 relative",
            cfg.bg,
            "border",
            cfg.border
          )}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.15, 1], opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="text-4xl mb-2">{cfg.emoji}</div>
          <h2 className={cn("text-2xl font-bold", cfg.color)}>{cfg.label}</h2>
        </motion.div>

        {/* Move comparison — hands slide in from opposite sides */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <motion.div
            className="text-center"
            initial={{ x: -120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="text-6xl mb-2">{playerMoveData.emoji}</div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              You
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {playerMoveData.label}
            </p>
          </motion.div>
          <motion.div
            className="text-2xl text-[var(--text-tertiary)] font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          >
            VS
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="text-6xl mb-2">{opponentMoveData.emoji}</div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Opponent
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {opponentMoveData.label}
            </p>
          </motion.div>
        </div>

        {/* Crypto details */}
        <div className="space-y-2 text-sm border-t border-[var(--border-default)] pt-4">
          {activeRecord?.commitmentHash && (
            <div className="flex justify-between gap-2">
              <span className="text-[var(--text-secondary)] flex-shrink-0">
                Your Commitment
              </span>
              <code className="text-xs font-mono text-orange-400/80 truncate">
                {activeRecord.commitmentHash}
              </code>
            </div>
          )}
          {opponentCommitment && (
            <div className="flex justify-between gap-2">
              <span className="text-[var(--text-secondary)] flex-shrink-0">
                Opponent Commitment
              </span>
              <code className="text-xs font-mono text-[var(--text-tertiary)] truncate">
                {opponentCommitment}
              </code>
            </div>
          )}
          {activeRecord?.encryptedContent && (
            <div className="flex justify-between gap-2">
              <span className="text-[var(--text-secondary)] flex-shrink-0">
                Encrypted Move
              </span>
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
              explorerUrl={`https://solscan.io/tx/${activeRecord.txSignature}`}
              error={null}
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <motion.button
            type="button"
            onClick={handleReset}
            className="flex-1 py-3 px-6 text-sm font-medium rounded-xl bg-gradient-to-r from-orange-500 to-orange-700 text-white hover:from-orange-400 hover:to-orange-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Play Again
          </motion.button>
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 px-6 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            Back to Arena
          </button>
        </div>

        {/* MagicBlock badge */}
        <p className="text-center text-[10px] text-[var(--text-tertiary)] mt-4">
          Powered by MagicBlock BOLT
        </p>
      </motion.div>
    )
  }

  // ─── Countdown overlay during reveal ─────────────────────────────
  if (phase === "revealing" && countdown !== null) {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8">
        <ScoreBar score={score} />
        <div className="flex items-center justify-center min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={countdown}
              className="text-8xl font-bold text-orange-400"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {countdown}
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
          Revealing moves...
        </p>
        <p className="text-center text-[10px] text-[var(--text-tertiary)] mt-4">
          Powered by MagicBlock BOLT
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8">
      {isDemoMode && <DemoBanner />}

      {/* Score bar */}
      {(score.wins > 0 || score.losses > 0 || score.draws > 0) && (
        <ScoreBar score={score} />
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-2xl">{game.icon}</span>
          <h2 className="text-lg font-semibold">{game.title}</h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Choose your move. Both players commit their moves as Pedersen
          commitments, then reveal simultaneously.
        </p>
      </div>

      {/* Locked phase — brief confirmation */}
      {phase === "locked" && playerMove && (
        <motion.div
          className="mb-6 p-6 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="text-4xl mb-2"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.4 }}
          >
            {"\u{1F512}"}
          </motion.div>
          <p className="text-sm font-medium text-orange-300">
            Move locked! Generating commitment...
          </p>
        </motion.div>
      )}

      {/* Opponent commitment status */}
      {opponentCommitment && phase === "select" && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
          <p className="text-xs text-orange-300/80">
            Opponent has committed:{" "}
            <code className="font-mono">
              {opponentCommitment.slice(0, 12)}...
            </code>
          </p>
        </div>
      )}

      {/* Move selection */}
      {(phase === "select" || phase === "locked") && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3 text-center">
            {phase === "locked" ? "Move Locked" : "Choose Your Move"}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {MOVES.map((move) => (
              <motion.button
                key={move.id}
                type="button"
                disabled={phase === "locked"}
                onClick={() => {
                  if (phase === "select") {
                    setPlayerMove(move.id)
                    generateOpponentCommitment(move.id)
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center py-5 px-3 rounded-xl border-2 transition-all",
                  playerMove === move.id
                    ? "border-orange-500 bg-orange-500/15 shadow-lg shadow-orange-500/20"
                    : "border-[var(--border-default)] bg-[var(--surface-secondary)] hover:border-orange-500/40 hover:bg-orange-500/5",
                  phase === "locked" && "opacity-60 cursor-not-allowed"
                )}
                whileHover={phase === "select" ? { scale: 1.08, y: -4 } : {}}
                whileTap={phase === "select" ? { scale: 0.95 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                animate={
                  playerMove === move.id
                    ? {
                        boxShadow: [
                          "0 0 0 0 rgba(249,115,22,0)",
                          "0 0 20px 4px rgba(249,115,22,0.3)",
                          "0 0 0 0 rgba(249,115,22,0)",
                        ],
                      }
                    : {}
                }
              >
                <span className="text-6xl mb-1">{move.emoji}</span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    playerMove === move.id
                      ? "text-orange-400"
                      : "text-[var(--text-secondary)]"
                  )}
                >
                  {move.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Committing phase — hash visualization */}
      {phase === "committing" && activeRecord?.commitmentHash && (
        <div className="mb-6">
          <GamingStatus
            currentStep={
              status as
                | "committing_move"
                | "generating_commitment"
                | "revealing"
            }
            mode="play"
          />
          <div className="mt-4 p-4 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-default)]">
            <p className="text-xs text-[var(--text-secondary)] mb-2">
              Commitment Hash
            </p>
            <HashVisualization hash={activeRecord.commitmentHash} />
          </div>
        </div>
      )}

      {/* Status pipeline during processing (no hash yet) */}
      {phase === "committing" && !activeRecord?.commitmentHash && (
        <div className="mb-6">
          <GamingStatus
            currentStep={
              status as
                | "committing_move"
                | "generating_commitment"
                | "revealing"
            }
            mode="play"
          />
        </div>
      )}

      {/* Privacy Toggle */}
      {phase === "select" && (
        <div className="mb-6">
          <GamingPrivacyToggle
            value={privacyLevel}
            onChange={setPrivacyLevel}
            disabled={isProcessing}
          />
        </div>
      )}

      {/* Error state */}
      {status === "failed" && (
        <div className="mb-6">
          <GamingStatus currentStep="failed" mode="play" error={error} />
        </div>
      )}

      {/* Play button */}
      {phase === "select" && (
        <motion.button
          type="button"
          onClick={handlePlay}
          disabled={!playerMove || !canPlay}
          className={cn(
            "w-full py-4 px-6 text-lg font-semibold rounded-xl transition-all",
            playerMove && canPlay
              ? "bg-gradient-to-r from-orange-500 to-orange-700 text-white hover:from-orange-400 hover:to-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
              : "bg-orange-600/30 text-white/50 cursor-not-allowed"
          )}
          whileHover={playerMove && canPlay ? { scale: 1.02 } : {}}
          whileTap={playerMove && canPlay ? { scale: 0.98 } : {}}
        >
          {!connected && !isDemoMode
            ? "Connect Wallet"
            : playerMove
              ? `Commit ${MOVES.find((m) => m.id === playerMove)?.label}`
              : "Select a Move"}
        </motion.button>
      )}

      {!connected && !isDemoMode && phase === "select" && (
        <button
          type="button"
          onClick={enableDemo}
          className="w-full mt-3 py-3 px-6 text-sm font-medium rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
        >
          Try Demo
        </button>
      )}

      {/* How it works */}
      {phase === "select" && (
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
      )}

      {/* MagicBlock badge */}
      <p className="text-center text-[10px] text-[var(--text-tertiary)] mt-4">
        Powered by MagicBlock BOLT
      </p>
    </div>
  )
}

// ─── Score Bar ─────────────────────────────────────────────────────
function ScoreBar({
  score,
}: {
  score: { wins: number; losses: number; draws: number }
}) {
  return (
    <div className="flex items-center justify-center gap-4 mb-4 text-sm font-medium">
      <span className="text-emerald-400">W {score.wins}</span>
      <span className="text-[var(--text-tertiary)]">|</span>
      <span className="text-red-400">L {score.losses}</span>
      <span className="text-[var(--text-tertiary)]">|</span>
      <span className="text-amber-400">D {score.draws}</span>
    </div>
  )
}
