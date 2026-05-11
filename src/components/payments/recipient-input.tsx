"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useConnection } from "@solana/wallet-adapter-react"
import {
  QrCodeIcon,
  BookOpenIcon,
  ClipboardIcon,
  XIcon,
  CameraSlashIcon,
  TrashIcon,
  SpinnerGapIcon,
  CheckCircleIcon,
  WarningIcon,
  XCircleIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"
import bs58 from "bs58"
import { resolve as snsResolve, MetaAddress, NotFound, Malformed } from "@/lib/sns-stealth-client"
import { resolve as bonfidaResolve } from "@bonfida/spl-name-service"
import {
  classifyInput,
  SIP_ADDRESS_REGEX,
  type RecipientResolution,
} from "./recipient-resolution"

// SNS resolution debounce delay (ms) — avoids firing on every keystroke
const RESOLVE_DEBOUNCE_MS = 350

// Saved contacts storage key
const CONTACTS_KEY = "sip-address-book"

interface Contact {
  address: string
  label: string
  lastUsed: number
}

interface RecipientInputProps {
  value: string
  onChange: (value: string) => void
  onResolutionChange?: (resolution: RecipientResolution) => void
  disabled?: boolean
}

export function RecipientInput({
  value,
  onChange,
  onResolutionChange,
  disabled,
}: RecipientInputProps) {
  const { connection } = useConnection()
  const [touched, setTouched] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showAddressBook, setShowAddressBook] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem(CONTACTS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [newContactLabel, setNewContactLabel] = useState("")
  const [showSavePrompt, setShowSavePrompt] = useState(false)

  // Resolution state — drives all SNS-specific UX
  const [resolution, setResolution] = useState<RecipientResolution>({ kind: "empty" })
  // "Send Public" deferred flow: holds the resolved Solana address string
  const [publicAddressPreview, setPublicAddressPreview] = useState<string | null>(null)
  const [publicAddressLoading, setPublicAddressLoading] = useState(false)

  // Stale-request guard — increments on every input change, compared inside async callback
  const resolveGenRef = useRef(0)
  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Resolution effect ──────────────────────────────────────────────────────

  useEffect(() => {
    // Cancel any pending debounce
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }

    const initial = classifyInput(value)

    // Non-SNS states resolve synchronously — no debounce needed
    if (initial.kind !== "sns-resolving") {
      resolveGenRef.current += 1
      setResolution(initial)
      onResolutionChange?.(initial)
      // Clear public address preview when input changes
      setPublicAddressPreview(null)
      return
    }

    // SNS path: set resolving immediately, then debounce the actual network call
    setResolution(initial)
    onResolutionChange?.(initial)
    setPublicAddressPreview(null)

    const generation = ++resolveGenRef.current
    const domain = initial.domain

    debounceRef.current = setTimeout(async () => {
      if (!connection) {
        // Connection not yet available — stay in resolving state
        return
      }

      try {
        const result = await snsResolve(connection, domain)

        if (resolveGenRef.current !== generation) return // stale — discard

        let next: RecipientResolution

        if (result instanceof MetaAddress) {
          // Build sip: URI from MetaAddress
          const uri = `sip:solana:${bs58.encode(result.spending)}:${bs58.encode(result.viewing)}`
          next = { kind: "sns-resolved", domain, uri }
        } else if (result instanceof NotFound) {
          next =
            result.subject === "domain"
              ? { kind: "sns-not-found-domain", domain }
              : { kind: "sns-not-found-record", domain }
        } else if (result instanceof Malformed) {
          next = { kind: "sns-malformed", domain, reason: result.reason }
        } else {
          // Unexpected result type — treat as malformed
          next = { kind: "sns-malformed", domain, reason: "unknown" }
        }

        setResolution(next)
        onResolutionChange?.(next)
      } catch (err) {
        if (resolveGenRef.current !== generation) return // stale

        logger.error("SNS resolution error", err, "RecipientInput")
        // Network/chain errors: fall back to not-found-domain (safe, shows red error)
        const next: RecipientResolution = { kind: "sns-not-found-domain", domain }
        setResolution(next)
        onResolutionChange?.(next)
      }
    }, RESOLVE_DEBOUNCE_MS)

    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, connection])

  // ── Contact helpers ────────────────────────────────────────────────────────

  const saveContacts = useCallback((newContacts: Contact[]) => {
    try {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(newContacts))
      setContacts(newContacts)
    } catch (err) {
      logger.error("Failed to save contacts", err, "RecipientInput")
    }
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value.trim())
    },
    [onChange],
  )

  const handleBlur = useCallback(() => {
    setTouched(true)
    if (value && SIP_ADDRESS_REGEX.test(value)) {
      const exists = contacts.some((c) => c.address === value)
      if (!exists) setShowSavePrompt(true)
    }
  }, [value, contacts])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      onChange(text.trim())
      setTouched(true)
    } catch {
      // Clipboard access denied
    }
  }, [onChange])

  const handleSelectContact = useCallback(
    (contact: Contact) => {
      onChange(contact.address)
      const updated = contacts.map((c) =>
        c.address === contact.address ? { ...c, lastUsed: Date.now() } : c,
      )
      saveContacts(updated)
      setShowAddressBook(false)
    },
    [onChange, contacts, saveContacts],
  )

  const handleSaveContact = useCallback(() => {
    if (!value || !SIP_ADDRESS_REGEX.test(value)) return
    const newContact: Contact = {
      address: value,
      label: newContactLabel || `Address ${contacts.length + 1}`,
      lastUsed: Date.now(),
    }
    saveContacts([...contacts, newContact])
    setNewContactLabel("")
    setShowSavePrompt(false)
  }, [value, newContactLabel, contacts, saveContacts])

  const handleDeleteContact = useCallback(
    (address: string) => {
      saveContacts(contacts.filter((c) => c.address !== address))
    },
    [contacts, saveContacts],
  )

  const handleQRScan = useCallback(
    (scannedValue: string) => {
      onChange(scannedValue.trim())
      setTouched(true)
      setShowQRScanner(false)
    },
    [onChange],
  )

  // ── "Not-found-record" warn-and-downgrade handlers ─────────────────────────

  const handleCancel = useCallback(() => {
    onChange("")
  }, [onChange])

  const handleSendPublic = useCallback(async () => {
    if (resolution.kind !== "sns-not-found-record") return
    const domain = resolution.domain

    setPublicAddressLoading(true)
    setPublicAddressPreview(null)

    try {
      // Resolve the domain's SOL pointer (the public Solana address it points to)
      const pubkey = await bonfidaResolve(connection, domain)
      setPublicAddressPreview(pubkey.toBase58())
    } catch (err) {
      logger.error("Bonfida resolve error for Send Public", err, "RecipientInput")
      setPublicAddressPreview("error")
    } finally {
      setPublicAddressLoading(false)
    }

    // TODO: Implement full public-send flow once the form supports raw Solana
    // addresses as recipients. Currently only sip: URIs are supported by
    // useSendPayment. Tracked in: sip-app#[send-public-follow-up].
  }, [resolution, connection])

  // ── Border color based on resolution ──────────────────────────────────────

  const inputBorderClass = (() => {
    if (resolution.kind === "sns-resolved" || resolution.kind === "sip-uri") {
      return "border-sip-green-500 focus:border-sip-green-500"
    }
    if (
      resolution.kind === "sns-not-found-domain" ||
      resolution.kind === "sns-malformed" ||
      (resolution.kind === "invalid" && touched && value !== "")
    ) {
      return "border-red-500 focus:border-red-500"
    }
    return "border-[var(--border-default)] focus:border-[var(--border-focus)]"
  })()

  const sortedContacts = [...contacts].sort((a, b) => b.lastUsed - a.lastUsed)

  return (
    <div>
      <label
        htmlFor="recipient"
        className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
      >
        Recipient
      </label>

      <div className="relative">
        <input
          type="text"
          id="recipient"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="alice.sol or sip:solana:7x3Fh9w…:2Bp4kL1…"
          className={cn(
            "w-full px-4 py-3 pr-28 bg-[var(--surface-secondary)] border rounded-xl font-mono text-sm transition-all",
            "focus:outline-none focus:ring-2 focus:ring-sip-purple-500/20",
            inputBorderClass,
            disabled && "opacity-50 cursor-not-allowed",
          )}
        />

        {/* Action Buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Resolving spinner */}
          {resolution.kind === "sns-resolving" && (
            <SpinnerGapIcon
              size={16}
              className="animate-spin text-[var(--text-tertiary)]"
              aria-hidden
            />
          )}

          {/* QR Scanner */}
          <button
            type="button"
            onClick={() => setShowQRScanner(true)}
            disabled={disabled}
            className="p-2 text-[var(--text-tertiary)] hover:text-sip-purple-400 hover:bg-sip-purple-500/10 rounded-lg transition-colors disabled:opacity-50"
            title="Scan QR Code"
          >
            <QrCodeIcon size={16} />
          </button>

          {/* Address Book */}
          <button
            type="button"
            onClick={() => setShowAddressBook(true)}
            disabled={disabled}
            className={cn(
              "p-2 rounded-lg transition-colors disabled:opacity-50",
              contacts.length > 0
                ? "text-sip-purple-400 hover:bg-sip-purple-500/10"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)]",
            )}
            title="Address Book"
          >
            <BookOpenIcon size={16} />
            {contacts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-sip-purple-500 text-white rounded-full">
                {contacts.length}
              </span>
            )}
          </button>

          {/* Paste */}
          <button
            type="button"
            onClick={handlePaste}
            disabled={disabled}
            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] rounded-lg transition-colors disabled:opacity-50"
            title="Paste from clipboard"
          >
            <ClipboardIcon size={16} />
          </button>
        </div>
      </div>

      {/* ── Resolution feedback area ────────────────────────────────────────── */}

      {resolution.kind === "sns-resolving" && (
        <p className="mt-2 text-xs text-[var(--text-tertiary)] flex items-center gap-1.5">
          <SpinnerGapIcon size={12} className="animate-spin" aria-hidden />
          Resolving {resolution.domain}…
        </p>
      )}

      {resolution.kind === "sns-resolved" && (
        <p className="mt-2 text-xs text-sip-green-500 flex items-center gap-1.5">
          <CheckCircleIcon size={12} weight="fill" aria-hidden />
          {resolution.domain} · private payment available
        </p>
      )}

      {resolution.kind === "sip-uri" && value !== "" && (
        <p className="mt-2 text-xs text-sip-green-500 flex items-center gap-1.5">
          <CheckCircleIcon size={12} weight="fill" aria-hidden />
          SIP stealth address ready
        </p>
      )}

      {resolution.kind === "sns-not-found-record" && (
        <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-2 mb-2">
            <WarningIcon
              size={16}
              weight="fill"
              className="text-amber-400 mt-0.5 shrink-0"
              aria-hidden
            />
            <div>
              <p className="text-xs font-medium text-amber-300">
                Private payment not available.
              </p>
              <p className="text-xs text-amber-400/80 mt-0.5">
                {resolution.domain} hasn&apos;t enabled SIP-STEALTH.
              </p>
            </div>
          </div>

          {/* Public address preview (shown after "Send Public" is clicked) */}
          {publicAddressLoading && (
            <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1.5 mt-2">
              <SpinnerGapIcon size={12} className="animate-spin" aria-hidden />
              Looking up public address…
            </p>
          )}
          {publicAddressPreview && publicAddressPreview !== "error" && (
            <p className="text-xs text-[var(--text-secondary)] mt-2 font-mono break-all">
              Public address:{" "}
              <span className="text-[var(--text-primary)]">
                {publicAddressPreview}
              </span>
              <br />
              <span className="text-[var(--text-tertiary)] not-italic font-sans">
                Public sends via .sol are coming in a follow-up — not yet available.
              </span>
            </p>
          )}
          {publicAddressPreview === "error" && (
            <p className="text-xs text-red-400 mt-2">
              Could not look up public address for {resolution.domain}.
            </p>
          )}

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleSendPublic}
              disabled={publicAddressLoading}
              className="px-3 py-1.5 text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors disabled:opacity-50"
            >
              Send Public
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] rounded-lg hover:bg-[var(--surface-secondary)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {resolution.kind === "sns-not-found-domain" && (
        <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
          <XCircleIcon size={12} weight="fill" aria-hidden />
          {resolution.domain} not found
        </p>
      )}

      {resolution.kind === "sns-malformed" && (
        <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
          <XCircleIcon size={12} weight="fill" aria-hidden />
          {resolution.domain}&apos;s privacy record is invalid ({resolution.reason})
        </p>
      )}

      {resolution.kind === "invalid" && touched && value !== "" && (
        <p className="mt-2 text-xs text-red-500">
          Invalid format. Use a .sol domain or sip:solana:&lt;spend&gt;:&lt;view&gt;
        </p>
      )}

      {/* Empty / pristine help text */}
      {(resolution.kind === "empty" || (resolution.kind === "sip-uri" && value === "")) && (
        <p className="mt-2 text-xs text-[var(--text-tertiary)]">
          Enter a .sol domain or SIP stealth meta-address
        </p>
      )}

      {/* Save to Address Book Prompt */}
      {showSavePrompt && (
        <div className="mt-3 p-3 rounded-lg bg-sip-purple-500/10 border border-sip-purple-500/20">
          <p className="text-xs text-sip-purple-300 mb-2">
            Save this address to your address book?
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newContactLabel}
              onChange={(e) => setNewContactLabel(e.target.value)}
              placeholder="Label (e.g., Alice)"
              className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-default)] focus:outline-none focus:border-sip-purple-500"
            />
            <button
              type="button"
              onClick={handleSaveContact}
              className="px-3 py-1.5 text-xs font-medium bg-sip-purple-600 text-white rounded-lg hover:bg-sip-purple-700 transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowSavePrompt(false)}
              className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScannerModal
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* Address Book Modal */}
      {showAddressBook && (
        <AddressBookModal
          contacts={sortedContacts}
          onSelect={handleSelectContact}
          onDelete={handleDeleteContact}
          onClose={() => setShowAddressBook(false)}
        />
      )}
    </div>
  )
}

// ── QR Scanner Modal ───────────────────────────────────────────────────────────

interface QRScannerModalProps {
  onScan: (value: string) => void
  onClose: () => void
}

function QRScannerModal({ onScan, onClose }: QRScannerModalProps) {
  const [manualInput, setManualInput] = useState("")
  const [cameraError] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    if (!navigator.mediaDevices?.getUserMedia) {
      return "Camera not available in this browser"
    }
    return null
  })

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim())
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
          <h3 className="text-sm font-semibold">Scan QR Code</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--surface-tertiary)] transition-colors"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Camera View Placeholder */}
        <div className="aspect-square bg-black/90 flex items-center justify-center">
          {cameraError ? (
            <div className="text-center px-6">
              <CameraSlashIcon
                size={48}
                className="mx-auto mb-3 text-[var(--text-tertiary)]"
              />
              <p className="text-sm text-[var(--text-secondary)]">{cameraError}</p>
            </div>
          ) : (
            <div className="text-center px-6">
              <QrCodeIcon size={64} className="mx-auto mb-4 text-sip-purple-400" />
              <p className="text-sm text-[var(--text-secondary)]">
                Point your camera at a SIP address QR code
              </p>
              <div className="mt-4 w-48 h-48 mx-auto border-2 border-sip-purple-500/50 rounded-xl border-dashed" />
            </div>
          )}
        </div>

        {/* Manual Input */}
        <div className="p-4 border-t border-[var(--border-default)]">
          <p className="text-xs text-[var(--text-tertiary)] mb-2">
            Or enter address manually:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="sip:solana:... or alice.sol"
              className="flex-1 px-3 py-2 text-xs font-mono rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-default)] focus:outline-none focus:border-sip-purple-500"
            />
            <button
              type="button"
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
              className="px-4 py-2 text-xs font-medium bg-sip-purple-600 text-white rounded-lg hover:bg-sip-purple-700 transition-colors disabled:opacity-50"
            >
              Use
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Address Book Modal ─────────────────────────────────────────────────────────

interface AddressBookModalProps {
  contacts: Contact[]
  onSelect: (contact: Contact) => void
  onDelete: (address: string) => void
  onClose: () => void
}

function AddressBookModal({
  contacts,
  onSelect,
  onDelete,
  onClose,
}: AddressBookModalProps) {
  const truncateAddress = (addr: string) => {
    if (addr.length <= 30) return addr
    return `${addr.slice(0, 20)}...${addr.slice(-10)}`
  }

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md mx-4 bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-2">
            <BookOpenIcon size={20} className="text-sip-purple-400" />
            <h3 className="text-lg font-semibold">Address Book</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--surface-tertiary)] transition-colors"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Contact List */}
        <div className="max-h-80 overflow-y-auto">
          {contacts.length > 0 ? (
            <div className="divide-y divide-[var(--border-default)]">
              {contacts.map((contact) => (
                <div
                  key={contact.address}
                  className="flex items-center justify-between p-4 hover:bg-[var(--surface-secondary)] transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(contact)}
                    className="flex-1 text-left"
                  >
                    <p className="text-sm font-medium">{contact.label}</p>
                    <p className="text-xs font-mono text-[var(--text-tertiary)] mt-1">
                      {truncateAddress(contact.address)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Last used: {formatDate(contact.lastUsed)}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(contact.address)
                    }}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete contact"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <BookOpenIcon
                size={48}
                className="mx-auto mb-3 text-[var(--text-tertiary)]"
              />
              <p className="text-sm text-[var(--text-secondary)]">
                No saved addresses yet
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Addresses you use will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Validate a raw recipient string.
 *
 * Returns true only for exact sip:solana URI format.
 * SNS .sol domains are resolved asynchronously via RecipientInput's internal
 * state machine — use `onResolutionChange` + `isReadyToSend()` from
 * `recipient-resolution.ts` for SNS-aware validation.
 *
 * @deprecated Prefer the `onResolutionChange` + `isReadyToSend` pattern.
 *   Kept for backward compatibility with callers that only need sip: URI check.
 */
export function validateRecipient(value: string): boolean {
  return SIP_ADDRESS_REGEX.test(value)
}
