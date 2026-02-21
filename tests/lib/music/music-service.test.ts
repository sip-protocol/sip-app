import { describe, it, expect, vi, beforeEach } from "vitest"
import { MusicService } from "@/lib/music/music-service"
import { PrivacyLevel } from "@sip-protocol/types"
import type {
  MusicStep,
  StreamTrackParams,
  CreatePlaylistParams,
} from "@/lib/music/types"

// Mock the SDK to avoid WASM/crypto deps in tests
vi.mock("@sip-protocol/sdk", () => ({
  generateStealthMetaAddress: () => ({
    metaAddress: {
      spendingPublicKey: "0x" + "aa".repeat(32),
      viewingPublicKey: "0x" + "bb".repeat(32),
    },
    spendingPrivateKey: "0x" + "cc".repeat(32),
    viewingPrivateKey: "0x" + "dd".repeat(32),
  }),
  generateStealthAddress: () => ({
    stealthAddress: { address: "0x" + "ee".repeat(32) },
    sharedSecret: "0x" + "ff".repeat(32),
  }),
  encodeStealthMetaAddress: () => "st:sol:0x" + "ab".repeat(32),
  createCommitment: () => ({
    value: "0x" + "ab".repeat(32),
    blindingFactor: "0x" + "cd".repeat(32),
  }),
  generateViewingKey: () => ({
    hash: "0xmock_viewing_key_hash",
    publicKey: "0x" + "ee".repeat(32),
    privateKey: "0x" + "ff".repeat(32),
  }),
  encryptForViewing: () => ({
    ciphertext: "mock_ciphertext",
    nonce: "mock_nonce",
  }),
}))

vi.mock("@/lib/sip-client", () => ({
  getSDK: async () => {
    const sdk = await import("@sip-protocol/sdk")
    return sdk
  },
}))

const validStreamParams: StreamTrackParams = {
  trackId: "track-decentralized-beats",
  tier: "free",
  privacyLevel: PrivacyLevel.SHIELDED,
}

const validPlaylistParams: CreatePlaylistParams = {
  trackId: "track-decentralized-beats",
  tier: "supporter",
  privacyLevel: PrivacyLevel.SHIELDED,
}

describe("MusicService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("validate", () => {
    it("rejects empty trackId for stream", () => {
      const service = new MusicService()
      const error = service.validate("stream", {
        ...validStreamParams,
        trackId: "",
      })
      expect(error).toBe("Track ID is required")
    })

    it("rejects unknown track for stream", () => {
      const service = new MusicService()
      const error = service.validate("stream", {
        ...validStreamParams,
        trackId: "nonexistent",
      })
      expect(error).toBe("Track not found")
    })

    it("rejects empty tier for stream", () => {
      const service = new MusicService()
      const error = service.validate("stream", {
        ...validStreamParams,
        tier: "" as never,
      })
      expect(error).toBe("Listener tier is required")
    })

    it("accepts valid stream params", () => {
      const service = new MusicService()
      const error = service.validate("stream", validStreamParams)
      expect(error).toBeNull()
    })

    it("rejects empty trackId for playlist", () => {
      const service = new MusicService()
      const error = service.validate("playlist", {
        ...validPlaylistParams,
        trackId: "",
      })
      expect(error).toBe("Track ID is required")
    })

    it("accepts valid playlist params", () => {
      const service = new MusicService()
      const error = service.validate("playlist", validPlaylistParams)
      expect(error).toBeNull()
    })
  })

  describe("streamTrack (simulation)", () => {
    it("progresses through 4 steps in order", async () => {
      const steps: MusicStep[] = []
      const service = new MusicService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.streamTrack(validStreamParams)

      expect(steps).toEqual([
        "selecting_track",
        "generating_stealth_listener",
        "streaming",
        "streamed",
      ])
      expect(result.status).toBe("streamed")
    })

    it("sets track title and genre on result", async () => {
      const service = new MusicService({ mode: "simulation" })
      const result = await service.streamTrack(validStreamParams)

      expect(result.trackTitle).toBe("Decentralized Beats")
      expect(result.genre).toBe("electronic")
      expect(result.type).toBe("stream")
    })

    it("generates commitment hash and stealth address", async () => {
      const service = new MusicService({ mode: "simulation" })
      const result = await service.streamTrack(validStreamParams)

      expect(result.commitmentHash).toBeTruthy()
      expect(result.commitmentHash).toMatch(/^0x/)
      expect(result.stealthAddress).toBeTruthy()
      expect(result.stealthMetaAddress).toBeTruthy()
    })
  })

  describe("createPlaylist (simulation)", () => {
    it("progresses through 3 steps in order", async () => {
      const steps: MusicStep[] = []
      const service = new MusicService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const result = await service.createPlaylist(validPlaylistParams)

      expect(steps).toEqual([
        "generating_proof",
        "encrypting_playlist",
        "created",
      ])
      expect(result.status).toBe("created")
    })

    it("generates stealth address for playlist", async () => {
      const service = new MusicService({ mode: "simulation" })
      const result = await service.createPlaylist(validPlaylistParams)

      expect(result.stealthAddress).toBeTruthy()
      expect(result.stealthMetaAddress).toBeTruthy()
      expect(result.playlistCreated).toBe(true)
    })

    it("records step timestamps", async () => {
      const service = new MusicService({ mode: "simulation" })
      const result = await service.createPlaylist(validPlaylistParams)

      expect(result.stepTimestamps.generating_proof).toBeDefined()
      expect(result.stepTimestamps.encrypting_playlist).toBeDefined()
      expect(result.stepTimestamps.created).toBeDefined()
    })

    it("calls onCommitTransaction during encrypting_playlist step", async () => {
      const onCommit = vi.fn().mockResolvedValue("mock_tx_sig_123")
      const service = new MusicService({
        mode: "simulation",
        onCommitTransaction: onCommit,
      })

      const result = await service.createPlaylist(validPlaylistParams)

      expect(onCommit).toHaveBeenCalledOnce()
      expect(onCommit).toHaveBeenCalledWith(
        expect.stringContaining("playlist_"),
        expect.stringContaining("track-decentralized-beats:playlist")
      )
      expect(result.txSignature).toBe("mock_tx_sig_123")
      expect(result.status).toBe("created")
    })

    it("sets no txSignature when onCommitTransaction returns null", async () => {
      const onCommit = vi.fn().mockResolvedValue(null)
      const service = new MusicService({
        mode: "simulation",
        onCommitTransaction: onCommit,
      })

      const result = await service.createPlaylist(validPlaylistParams)

      expect(onCommit).toHaveBeenCalledOnce()
      expect(result.txSignature).toBeUndefined()
    })

    it("uses simulation delay when onCommitTransaction is not provided", async () => {
      const steps: MusicStep[] = []
      const service = new MusicService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const start = Date.now()
      await service.createPlaylist(validPlaylistParams)
      const elapsed = Date.now() - start

      // Simulation delays should have been applied (generating_proof + encrypting_playlist)
      expect(elapsed).toBeGreaterThanOrEqual(100)
      expect(steps).toContain("encrypting_playlist")
    })
  })
})
