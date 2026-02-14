"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { MigrationService } from "@/lib/migrations/migration-service"
import { useMigrationHistoryStore } from "@/stores/migration-history"
import { useTrackEvent } from "@/hooks/useTrackEvent"
import type {
  MigrationStep,
  Migration,
  MigrationSource,
} from "@/lib/migrations/types"
import type { PrivacyLevel } from "@sip-protocol/types"

export type MigrationExecuteStatus = MigrationStep | "idle" | "error"

interface MigrationExecuteParams {
  source: MigrationSource
  amount: string
  privacyLevel: PrivacyLevel
}

export interface UseMigrationExecuteReturn {
  status: MigrationExecuteStatus
  activeMigration: Migration | null
  error: string | null
  migrate: (params: MigrationExecuteParams) => Promise<Migration | undefined>
  reset: () => void
}

export function useMigrationExecute(): UseMigrationExecuteReturn {
  const { publicKey } = useWallet()
  const { addMigration, updateMigration } = useMigrationHistoryStore()
  const { trackMigration } = useTrackEvent()

  const [status, setStatus] = useState<MigrationExecuteStatus>("idle")
  const [activeMigration, setActiveMigration] = useState<Migration | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setActiveMigration(null)
    setError(null)
  }, [])

  const migrate = useCallback(
    async (
      params: MigrationExecuteParams
    ): Promise<Migration | undefined> => {
      if (!publicKey) {
        setError("Wallet not connected")
        setStatus("error")
        return undefined
      }

      try {
        setError(null)

        const service = new MigrationService({
          mode: "simulation",
          onStepChange: (step, migration) => {
            setStatus(step)
            setActiveMigration({ ...migration })
          },
        })

        const validationError = service.validate(params)
        if (validationError) {
          setError(validationError)
          setStatus("error")
          return undefined
        }

        setStatus("scanning_wallet")

        const result = await service.executeMigration(params)

        setActiveMigration(result)
        addMigration(result)

        trackMigration({
          source: params.source.protocol?.name ?? "manual",
          amount: params.amount,
          privacyLevel: params.privacyLevel,
        })

        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Migration failed"
        setError(message)
        setStatus("error")

        if (activeMigration) {
          updateMigration(activeMigration.id, {
            status: "failed",
            error: message,
          })
        }

        return undefined
      }
    },
    [publicKey, addMigration, updateMigration, trackMigration, activeMigration]
  )

  return { status, activeMigration, error, migrate, reset }
}
