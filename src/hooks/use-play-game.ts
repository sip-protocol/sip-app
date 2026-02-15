"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { GamingService } from "@/lib/gaming/gaming-service"
import { useGamingHistoryStore } from "@/stores/gaming-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  GamingStep,
  PlayGameParams,
  GamingActionRecord,
  GameResult,
} from "@/lib/gaming/types"

export type PlayGameStatus = GamingStep | "idle" | "error"

export interface UsePlayGameReturn {
  status: PlayGameStatus
  activeRecord: GamingActionRecord | null
  error: string | null
  playGame: (
    params: PlayGameParams
  ) => Promise<GamingActionRecord | undefined>
  reset: () => void
}

export function usePlayGame(): UsePlayGameReturn {
  const { publicKey } = useWallet()
  const { addAction, addResult } = useGamingHistoryStore()
  const { trackGaming } = useTrackEvent()

  const [status, setStatus] = useState<PlayGameStatus>("idle")
  const [activeRecord, setActiveRecord] = useState<GamingActionRecord | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveRecord(null)
    setError(null)
  }, [])

  const playGame = useCallback(
    async (
      params: PlayGameParams
    ): Promise<GamingActionRecord | undefined> => {
      if (!publicKey) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new GamingService({
          mode: "simulation",
          onStepChange: (step, record) => {
            setStatus(step)
            setActiveRecord({ ...record })
          },
        })

        const validationError = service.validate("play", params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("committing_move")

        const result = await service.playGame(params)

        setActiveRecord(result)
        addAction(result)

        if (result.won !== undefined) {
          const gameResult: GameResult = {
            gameId: params.gameId,
            won: result.won,
            rewardTier: result.difficulty === "tournament" ? "diamond" : result.difficulty === "ranked" ? "silver" : "bronze",
            commitmentHash: result.commitmentHash ?? "",
            revealedAt: Date.now(),
          }
          addResult(gameResult)
        }

        trackGaming({
          action: "game_play",
          gameId: params.gameId,
          ...(result.gameType && { gameType: result.gameType }),
          ...(result.won !== undefined && { won: result.won }),
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Play failed"
        setError(message)
        setStatus("error")
        return undefined
      }
    },
    [publicKey, addAction, addResult, trackGaming]
  )

  return { status, activeRecord, error, playGame, reset }
}
