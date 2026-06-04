import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, waitFor } from "@testing-library/react"
import type { ViewingKey } from "@sip-protocol/types"

const mockKey = {
  privateKey: "0xpriv",
  publicKey: "0xpub",
  hash: "0xhash",
  derivationPath: "m/0/compliance",
} as unknown as ViewingKey

const generateViewingKey = vi.fn(() => mockKey)
// Fully mock the SDK (don't load the real module) — the panel only needs
// generateViewingKey, and the real SDK has an ESM-resolution quirk under the
// happy-dom test env on some versions.
vi.mock("@sip-protocol/sdk", () => ({
  generateViewingKey: () => generateViewingKey(),
}))

// Stub the heavy child components — irrelevant to the mount/generate behavior
vi.mock("@/components/payments/viewing-key/viewing-key-display", () => ({
  ViewingKeyDisplay: () => null,
}))
vi.mock("@/components/payments/viewing-key/viewing-key-qr-code", () => ({
  ViewingKeyQRCode: () => null,
}))
vi.mock("@/components/payments/viewing-key/auditor-share-modal", () => ({
  AuditorShareModal: () => null,
}))

import { ViewingKeyPanel } from "@/components/payments/viewing-key/viewing-key-panel"

describe("ViewingKeyPanel", () => {
  beforeEach(() => {
    generateViewingKey.mockClear()
  })

  it("auto-generates a viewing key on mount and reports it via onViewingKeyChange", async () => {
    const onViewingKeyChange = vi.fn()

    render(<ViewingKeyPanel onViewingKeyChange={onViewingKeyChange} />)

    await waitFor(() => expect(onViewingKeyChange).toHaveBeenCalledWith(mockKey))
    expect(generateViewingKey).toHaveBeenCalled()
  })

  it("does not auto-generate when an initial viewing key is supplied", async () => {
    const onViewingKeyChange = vi.fn()

    render(
      <ViewingKeyPanel
        initialViewingKey={mockKey}
        onViewingKeyChange={onViewingKeyChange}
      />
    )

    // Give effects a chance to run, then confirm no generation happened
    await new Promise((r) => setTimeout(r, 20))
    expect(generateViewingKey).not.toHaveBeenCalled()
    expect(onViewingKeyChange).not.toHaveBeenCalled()
  })
})
