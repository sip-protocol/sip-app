"use client"

import { useState, useCallback } from "react"
import type { ViewingKey } from "@sip-protocol/types"
import {
  parseViewingKeyFromJson,
  isValidViewingKey,
} from "@/hooks/use-viewing-key-disclosure"

interface ViewingKeyInputProps {
  onKeyParsed: (key: ViewingKey) => void
  placeholder?: string
}

/**
 * ViewingKeyInput - Input component for viewing keys
 *
 * Accepts viewing keys via:
 * - Paste JSON export
 * - Paste raw key data
 * - File upload
 */
export function ViewingKeyInput({
  onKeyParsed,
  placeholder = "Paste viewing key JSON or upload file...",
}: ViewingKeyInputProps) {
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const parseAndValidate = useCallback(
    (value: string) => {
      setError(null)

      if (!value.trim()) {
        return
      }

      const key = parseViewingKeyFromJson(value)

      if (!key) {
        setError(
          "Invalid viewing key format. Please paste a valid JSON export."
        )
        return
      }

      if (!isValidViewingKey(key)) {
        setError("Invalid viewing key structure. Key may be corrupted.")
        return
      }

      onKeyParsed(key)
      setInput("")
    },
    [onKeyParsed]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setInput(value)

      // Try to parse on paste (when content appears all at once)
      if (value.trim().startsWith("{") && value.trim().endsWith("}")) {
        parseAndValidate(value)
      }
    },
    [parseAndValidate]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const pasted = e.clipboardData.getData("text")
      if (pasted.trim()) {
        setTimeout(() => parseAndValidate(pasted), 0)
      }
    },
    [parseAndValidate]
  )

  const handleFileUpload = useCallback(
    async (file: File) => {
      setError(null)

      if (!file.name.endsWith(".json")) {
        setError("Please upload a JSON file")
        return
      }

      try {
        const text = await file.text()
        parseAndValidate(text)
      } catch {
        setError("Failed to read file")
      }
    },
    [parseAndValidate]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFileUpload(file)
      }
    },
    [handleFileUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-xl border-2 border-dashed transition-colors ${
          isDragging
            ? "border-sip-purple-500 bg-sip-purple-500/10"
            : "border-[var(--border-default)]"
        }`}
      >
        <textarea
          value={input}
          onChange={handleInputChange}
          onPaste={handlePaste}
          placeholder={placeholder}
          rows={4}
          className="w-full p-4 bg-transparent text-sm font-mono resize-none focus:outline-none placeholder:text-[var(--text-tertiary)]"
        />

        {/* File upload button */}
        <label className="absolute bottom-3 right-3 cursor-pointer">
          <input
            type="file"
            accept=".json"
            onChange={(e) =>
              e.target.files?.[0] && handleFileUpload(e.target.files[0])
            }
            className="hidden"
          />
          <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] transition-colors">
            Upload JSON
          </span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </p>
      )}

      <p className="text-xs text-[var(--text-tertiary)]">
        Paste a viewing key JSON export or drag & drop a .json file to import.
      </p>
    </div>
  )
}
