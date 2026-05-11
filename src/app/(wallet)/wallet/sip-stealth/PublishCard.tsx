"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { reverseLookup } from "@bonfida/spl-name-service"
import { CheckCircle, Globe, ArrowSquareOut, Warning } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"
import { useNetworkStore } from "@/stores/network"
import {
  resolve,
  publish,
  MetaAddress,
  NotFound,
  Malformed,
  UserRejected,
} from "@/lib/sns-stealth-client"

interface Props {
  domainPubkey: string
}

type CardState = "loading" | "has-record" | "no-record" | "publishing" | "published" | "error"

interface CardStateData {
  state: CardState
  domainName: string | null
  signature: string | null
  errorMessage: string | null
}

export function PublishCard({ domainPubkey }: Props) {
  const wallet = useWallet()
  const { connection } = useConnection()
  const getExplorerUrl = useNetworkStore((s) => s.getExplorerUrl)

  const [cardData, setCardData] = useState<CardStateData>({
    state: "loading",
    domainName: null,
    signature: null,
    errorMessage: null,
  })

  // Resolve domain name and check for existing SIP-STEALTH record on mount
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const pk = new PublicKey(domainPubkey)
        const bareName = await reverseLookup(connection, pk)
        const fullDomain = `${bareName}.sol`

        if (cancelled) return

        const result = await resolve(connection, fullDomain)

        if (cancelled) return

        if (result instanceof MetaAddress) {
          setCardData({
            state: "has-record",
            domainName: fullDomain,
            signature: null,
            errorMessage: null,
          })
        } else if (result instanceof NotFound || result instanceof Malformed) {
          setCardData({
            state: "no-record",
            domainName: fullDomain,
            signature: null,
            errorMessage: null,
          })
        } else {
          const _exhaustive: never = result
          throw new Error(`Unhandled resolve result: ${String(_exhaustive)}`)
        }
      } catch (err) {
        if (cancelled) return
        logger.error("Failed to load domain card", err, "PublishCard")
        setCardData({
          state: "error",
          domainName: null,
          signature: null,
          errorMessage: err instanceof Error ? err.message : "Failed to load domain",
        })
      }
    }

    load()
    return () => { cancelled = true }
  }, [domainPubkey, connection])

  const handlePublish = useCallback(async () => {
    if (!cardData.domainName) return

    setCardData((prev) => ({ ...prev, state: "publishing", errorMessage: null }))

    try {
      const { signature } = await publish(connection, cardData.domainName, wallet)
      setCardData((prev) => ({
        ...prev,
        state: "published",
        signature,
        errorMessage: null,
      }))
    } catch (err) {
      logger.error("Failed to publish SIP-STEALTH record", err, "PublishCard")

      let message = "Failed to publish record"
      if (err instanceof UserRejected) {
        message = "Transaction rejected"
      } else if (err instanceof Error) {
        message = err.message
      }

      setCardData((prev) => ({
        ...prev,
        state: "no-record",
        errorMessage: message,
      }))
    }
  }, [cardData.domainName, connection, wallet])

  const { state, domainName, signature, errorMessage } = cardData
  const explorerUrl = signature ? getExplorerUrl(signature) : null

  // Loading skeleton
  if (state === "loading") {
    return (
      <div
        className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-5"
        aria-busy="true"
        aria-label="Loading domain"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--surface-tertiary)] animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 rounded bg-[var(--surface-tertiary)] animate-pulse" />
            <div className="h-3 w-48 rounded bg-[var(--surface-tertiary)] animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  // Error loading card
  if (state === "error") {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <Warning size={18} className="text-red-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {domainPubkey.slice(0, 8)}…
            </p>
            <p className="text-xs text-red-400 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      </div>
    )
  }

  // Record exists — success state (already enabled)
  if (state === "has-record") {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sip-green-500/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={18} className="text-sip-green-500" weight="fill" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {domainName}
            </p>
            <p className="text-xs text-sip-green-500 mt-0.5">
              Private payments enabled
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Just published — published state
  if (state === "published") {
    return (
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sip-green-500/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={18} className="text-sip-green-500" weight="fill" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {domainName}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-sip-green-500">Published</span>
              {explorerUrl && (
                <>
                  <span className="text-xs text-[var(--text-tertiary)]">—</span>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-0.5 text-xs text-sip-purple-400 hover:text-sip-purple-300 transition-colors"
                  >
                    tx <ArrowSquareOut size={10} />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // no-record / publishing — action state
  const isPublishing = state === "publishing"

  return (
    <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[var(--surface-tertiary)] flex items-center justify-center flex-shrink-0">
            <Globe size={18} className="text-[var(--text-secondary)]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {domainName}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              No SIP stealth record
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePublish}
          disabled={isPublishing}
          aria-label={
            isPublishing
              ? `Publishing private payments for ${domainName}`
              : `Enable private payments for ${domainName}`
          }
          className={cn(
            "flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-xl transition-colors",
            isPublishing
              ? "bg-sip-purple-600/50 text-white/70 cursor-not-allowed"
              : "bg-sip-purple-600 text-white hover:bg-sip-purple-700"
          )}
        >
          {isPublishing ? "Publishing…" : "Enable"}
        </button>
      </div>

      {errorMessage && (
        <p className="mt-3 text-xs text-red-400 flex items-center gap-1.5">
          <Warning size={12} />
          {errorMessage}
        </p>
      )}
    </div>
  )
}
