"use client"

import { useState, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { getAllDomains } from "@bonfida/spl-name-service"
import { ShieldCheck, ArrowSquareOut } from "@phosphor-icons/react"
import { logger } from "@/lib/logger"
import { PublishCard } from "./PublishCard"

type LoadState = "idle" | "loading" | "loaded" | "error"

export default function SipStealthPage() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()

  const [domains, setDomains] = useState<PublicKey[]>([])
  const [loadState, setLoadState] = useState<LoadState>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!publicKey || !connected) {
      // Deferred to avoid sync setState in effect (same pattern as send-shielded-form)
      queueMicrotask(() => {
        if (!cancelled) {
          setDomains([])
          setLoadState("idle")
        }
      })
      return () => { cancelled = true }
    }

    // Defer initial state transition to avoid sync setState-in-effect lint error
    queueMicrotask(() => {
      if (!cancelled) {
        setLoadState("loading")
        setErrorMessage(null)
      }
    })

    getAllDomains(connection, publicKey)
      .then((pks) => {
        if (cancelled) return
        setDomains(pks)
        setLoadState("loaded")
      })
      .catch((err) => {
        if (cancelled) return
        logger.error("Failed to load .sol domains", err, "SipStealthPage")
        setErrorMessage(err instanceof Error ? err.message : "Failed to load domains")
        setLoadState("error")
      })

    return () => { cancelled = true }
  }, [publicKey, connected, connection])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-sip-purple-500/15 flex items-center justify-center">
            <ShieldCheck size={20} className="text-sip-purple-400" weight="fill" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Enable Private Payments
          </h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Publish a SIP stealth record to your{" "}
          <span className="text-[var(--text-primary)] font-medium">.sol</span>{" "}
          domain so others can send you private payments without revealing your
          wallet address on-chain.
        </p>
      </div>

      {/* Wallet not connected */}
      {!connected && (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--surface-tertiary)] flex items-center justify-center">
            <ShieldCheck size={24} className="text-[var(--text-secondary)]" />
          </div>
          <p className="text-[var(--text-primary)] font-medium mb-1">
            Connect your wallet
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            Connect a wallet to see your .sol domains and enable private payments.
          </p>
        </div>
      )}

      {/* Loading */}
      {connected && loadState === "loading" && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-5"
              aria-hidden="true"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--surface-tertiary)] animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-28 rounded bg-[var(--surface-tertiary)] animate-pulse" />
                  <div className="h-3 w-48 rounded bg-[var(--surface-tertiary)] animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error loading domains */}
      {connected && loadState === "error" && (
        <div className="bg-[var(--surface-primary)] border border-red-500/20 rounded-2xl p-6 text-center">
          <p className="text-sm text-red-400 font-medium mb-1">Failed to load domains</p>
          <p className="text-xs text-[var(--text-tertiary)]">{errorMessage}</p>
        </div>
      )}

      {/* Empty state */}
      {connected && loadState === "loaded" && domains.length === 0 && (
        <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--surface-tertiary)] flex items-center justify-center">
            <ShieldCheck size={24} className="text-[var(--text-secondary)]" />
          </div>
          <p className="text-[var(--text-primary)] font-medium mb-1">
            No .sol domains found
          </p>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            You don&apos;t own any .sol domains. Get one at sns.id to enable
            private payments.
          </p>
          <a
            href="https://sns.id"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-sip-purple-600 text-white hover:bg-sip-purple-700 transition-colors"
          >
            Get a .sol domain
            <ArrowSquareOut size={14} />
          </a>
        </div>
      )}

      {/* Domain list */}
      {connected && loadState === "loaded" && domains.length > 0 && (
        <div className="space-y-3">
          {domains.map((pk) => (
            <PublishCard key={pk.toBase58()} domainPubkey={pk.toBase58()} />
          ))}
        </div>
      )}
    </div>
  )
}
