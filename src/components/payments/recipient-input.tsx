"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

// SIP stealth address format: sip:<chain>:<spendingKey>:<viewingKey>
const SIP_ADDRESS_REGEX = /^sip:solana:[a-fA-F0-9]{64,66}:[a-fA-F0-9]{64,66}$/

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
  disabled?: boolean
}

export function RecipientInput({
  value,
  onChange,
  disabled,
}: RecipientInputProps) {
  const [touched, setTouched] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showAddressBook, setShowAddressBook] = useState(false)
  // Load contacts from localStorage using lazy initializer
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

  const isValid = value === "" || SIP_ADDRESS_REGEX.test(value)
  const showError = touched && value !== "" && !isValid

  // Save contacts to localStorage
  const saveContacts = useCallback((newContacts: Contact[]) => {
    try {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(newContacts))
      setContacts(newContacts)
    } catch (err) {
      console.error("Failed to save contacts:", err)
    }
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value.trim())
    },
    [onChange]
  )

  const handleBlur = useCallback(() => {
    setTouched(true)
    // Show save prompt if valid address and not already saved
    if (value && SIP_ADDRESS_REGEX.test(value)) {
      const exists = contacts.some((c) => c.address === value)
      if (!exists) {
        setShowSavePrompt(true)
      }
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
      // Update last used
      const updated = contacts.map((c) =>
        c.address === contact.address ? { ...c, lastUsed: Date.now() } : c
      )
      saveContacts(updated)
      setShowAddressBook(false)
    },
    [onChange, contacts, saveContacts]
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
    [contacts, saveContacts]
  )

  const handleQRScan = useCallback(
    (scannedValue: string) => {
      onChange(scannedValue.trim())
      setTouched(true)
      setShowQRScanner(false)
    },
    [onChange]
  )

  // Sort contacts by last used
  const sortedContacts = [...contacts].sort((a, b) => b.lastUsed - a.lastUsed)

  return (
    <div>
      <label
        htmlFor="recipient"
        className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
      >
        Recipient Stealth Address
      </label>

      <div className="relative">
        <input
          type="text"
          id="recipient"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="sip:solana:02abc...123:03def...456"
          className={cn(
            "w-full px-4 py-3 pr-28 bg-[var(--surface-secondary)] border rounded-xl font-mono text-sm transition-all",
            "focus:outline-none focus:ring-2 focus:ring-sip-purple-500/20",
            showError
              ? "border-red-500 focus:border-red-500"
              : "border-[var(--border-default)] focus:border-[var(--border-focus)]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />

        {/* Action Buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* QR Scanner */}
          <button
            type="button"
            onClick={() => setShowQRScanner(true)}
            disabled={disabled}
            className="p-2 text-[var(--text-tertiary)] hover:text-sip-purple-400 hover:bg-sip-purple-500/10 rounded-lg transition-colors disabled:opacity-50"
            title="Scan QR Code"
          >
            <QRCodeIcon className="w-4 h-4" />
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
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)]"
            )}
            title="Address Book"
          >
            <BookIcon className="w-4 h-4" />
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
            <ClipboardIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error / Help text */}
      {showError ? (
        <p className="mt-2 text-xs text-red-500">
          Invalid stealth address format. Expected:
          sip:solana:&lt;spend&gt;:&lt;view&gt;
        </p>
      ) : (
        <p className="mt-2 text-xs text-[var(--text-tertiary)]">
          Enter the recipient&apos;s SIP stealth meta-address
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

// QR Scanner Modal
interface QRScannerModalProps {
  onScan: (value: string) => void
  onClose: () => void
}

function QRScannerModal({ onScan, onClose }: QRScannerModalProps) {
  const [manualInput, setManualInput] = useState("")
  // Check camera availability using lazy initializer
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
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Camera View Placeholder */}
        <div className="aspect-square bg-black/90 flex items-center justify-center">
          {cameraError ? (
            <div className="text-center px-6">
              <CameraOffIcon className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
              <p className="text-sm text-[var(--text-secondary)]">
                {cameraError}
              </p>
            </div>
          ) : (
            <div className="text-center px-6">
              <QRCodeIcon className="w-16 h-16 mx-auto mb-4 text-sip-purple-400" />
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
              placeholder="sip:solana:..."
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

// Address Book Modal
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
            <BookIcon className="w-5 h-5 text-sip-purple-400" />
            <h3 className="text-lg font-semibold">Address Book</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--surface-tertiary)] transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
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
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <BookIcon className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
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

// Icons
function QRCodeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
      />
    </svg>
  )
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  )
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
      />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

function CameraOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
      />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  )
}

export function validateRecipient(value: string): boolean {
  return SIP_ADDRESS_REGEX.test(value)
}
