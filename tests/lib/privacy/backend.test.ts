import { describe, it, expect, beforeEach } from "vitest"
import {
  BackendRegistry,
  backendRegistry,
  getBestBackend,
  getBackendByFeatures,
} from "@/lib/privacy/backend"
import { MockBackend } from "@/lib/privacy/backends/mock"
import type { PrivacyBackend } from "@/lib/privacy/backend"

describe("BackendRegistry", () => {
  let registry: BackendRegistry

  beforeEach(() => {
    registry = new BackendRegistry()
  })

  describe("register", () => {
    it("should register a backend", () => {
      const mockBackend = new MockBackend()
      registry.register(mockBackend)
      expect(registry.has("mock")).toBe(true)
    })

    it("should allow retrieving registered backend", () => {
      const mockBackend = new MockBackend()
      registry.register(mockBackend)
      const retrieved = registry.get("mock")
      expect(retrieved).toBe(mockBackend)
    })
  })

  describe("unregister", () => {
    it("should unregister a backend", () => {
      const mockBackend = new MockBackend()
      registry.register(mockBackend)
      registry.unregister("mock")
      expect(registry.has("mock")).toBe(false)
    })
  })

  describe("getAll", () => {
    it("should return all registered backends", () => {
      const mock1 = new MockBackend()
      registry.register(mock1)
      const all = registry.getAll()
      expect(all).toHaveLength(1)
      expect(all[0]).toBe(mock1)
    })
  })

  describe("getAvailable", () => {
    it("should return only available backends", async () => {
      const availableBackend = new MockBackend({ available: true })
      const unavailableBackend = new MockBackend({ available: false })

      // Create a modified unavailable backend with different name
      const unavailableAsArcium = {
        ...unavailableBackend,
        name: "arcium" as const,
      } as PrivacyBackend

      registry.register(availableBackend)
      registry.register(unavailableAsArcium)

      const available = await registry.getAvailable()
      expect(available).toHaveLength(1)
      expect(available[0].name).toBe("mock")
    })
  })

  describe("setDefault / getDefault", () => {
    it("should set and get default backend", () => {
      const mockBackend = new MockBackend()
      registry.register(mockBackend)
      registry.setDefault("mock")
      const defaultBackend = registry.getDefault()
      expect(defaultBackend.name).toBe("mock")
    })

    it("should throw if setting default to unregistered backend", () => {
      expect(() => registry.setDefault("mock")).toThrow(
        "Backend 'mock' is not registered"
      )
    })

    it("should throw if getting default when not registered", () => {
      expect(() => registry.getDefault()).toThrow(
        "Default backend 'mock' is not registered"
      )
    })
  })

  describe("size", () => {
    it("should return number of registered backends", () => {
      expect(registry.size).toBe(0)
      registry.register(new MockBackend())
      expect(registry.size).toBe(1)
    })
  })
})

describe("getBestBackend", () => {
  beforeEach(() => {
    // Clear global registry
    const all = backendRegistry.getAll()
    for (const backend of all) {
      backendRegistry.unregister(backend.name)
    }
  })

  it("should return the best available backend", async () => {
    const mockBackend = new MockBackend({ available: true })
    backendRegistry.register(mockBackend)

    const best = await getBestBackend()
    expect(best.name).toBe("mock")
  })

  it("should throw if no backend is available", async () => {
    await expect(getBestBackend()).rejects.toThrow("No privacy backend available")
  })

  it("should filter by viewing key support when required", async () => {
    const mockWithViewingKeys = new MockBackend({ available: true })
    backendRegistry.register(mockWithViewingKeys)

    const best = await getBestBackend(true)
    expect(best.features.viewingKeys).toBe(true)
  })
})

describe("getBackendByFeatures", () => {
  beforeEach(() => {
    // Clear global registry
    const all = backendRegistry.getAll()
    for (const backend of all) {
      backendRegistry.unregister(backend.name)
    }
  })

  it("should return backend matching required features", async () => {
    const mockBackend = new MockBackend({ available: true })
    backendRegistry.register(mockBackend)

    const backend = await getBackendByFeatures({
      amountHiding: true,
      viewingKeys: true,
    })

    expect(backend).toBeDefined()
    expect(backend?.features.amountHiding).toBe(true)
    expect(backend?.features.viewingKeys).toBe(true)
  })

  it("should return undefined if no backend matches features", async () => {
    const mockBackend = new MockBackend({ available: true })
    backendRegistry.register(mockBackend)

    // Mock backend is sameChainOnly: true, so this should not match
    const backend = await getBackendByFeatures({
      sameChainOnly: false,
    })

    expect(backend).toBeUndefined()
  })
})
