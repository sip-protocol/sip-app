import { describe, it, expect, vi, beforeEach } from "vitest"
import { ArtService } from "@/lib/art/art-service"
import { PrivacyLevel } from "@sip-protocol/types"
import type { ArtStep, GenerateArtParams, MintArtParams } from "@/lib/art/types"

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
}))

vi.mock("@/lib/sip-client", () => ({
  getSDK: async () => {
    const sdk = await import("@sip-protocol/sdk")
    return sdk
  },
}))

const validGenerateParams: GenerateArtParams = {
  styleId: "cipher_bloom",
  privacyLevel: PrivacyLevel.SHIELDED,
}

const validMintParams: MintArtParams = {
  generatedArtId: "ga_123_abc",
  name: "My Privacy Art",
  description: "A beautiful piece",
  privacyLevel: PrivacyLevel.SHIELDED,
}

describe("ArtService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("validate", () => {
    it("rejects missing styleId for generate", () => {
      const service = new ArtService()
      const error = service.validate("generate", { ...validGenerateParams, styleId: "" as never })
      expect(error).toBe("Art style is required")
    })

    it("rejects invalid styleId for generate", () => {
      const service = new ArtService()
      const error = service.validate("generate", { ...validGenerateParams, styleId: "unknown" as never })
      expect(error).toBe("Invalid art style")
    })

    it("accepts valid generate params", () => {
      const service = new ArtService()
      expect(service.validate("generate", validGenerateParams)).toBeNull()
    })

    it("rejects missing generatedArtId for mint", () => {
      const service = new ArtService()
      const error = service.validate("mint", { ...validMintParams, generatedArtId: "" })
      expect(error).toBe("Generated art ID is required")
    })

    it("rejects empty name for mint", () => {
      const service = new ArtService()
      const error = service.validate("mint", { ...validMintParams, name: "" })
      expect(error).toBe("NFT name is required")
    })

    it("rejects long name for mint", () => {
      const service = new ArtService()
      const error = service.validate("mint", { ...validMintParams, name: "a".repeat(33) })
      expect(error).toBe("NFT name must be 32 characters or less")
    })

    it("accepts valid mint params", () => {
      const service = new ArtService()
      expect(service.validate("mint", validMintParams)).toBeNull()
    })
  })

  describe("generateArt (simulation)", () => {
    it("progresses through 3 steps in order", async () => {
      const steps: ArtStep[] = []
      const service = new ArtService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const { record } = await service.generateArt(validGenerateParams)

      expect(steps).toEqual(["selecting_style", "generating", "generated"])
      expect(record.status).toBe("generated")
    })

    it("produces valid SVG output", async () => {
      const service = new ArtService({ mode: "simulation" })
      const { art } = await service.generateArt(validGenerateParams)

      expect(art.svgData).toContain("<svg")
      expect(art.svgData).toContain("</svg>")
    })

    it("records step timestamps", async () => {
      const service = new ArtService({ mode: "simulation" })
      const { record } = await service.generateArt(validGenerateParams)

      expect(record.stepTimestamps.selecting_style).toBeDefined()
      expect(record.stepTimestamps.generating).toBeDefined()
      expect(record.stepTimestamps.generated).toBeDefined()
    })

    it("throws on invalid params", async () => {
      const service = new ArtService({ mode: "simulation" })

      await expect(
        service.generateArt({ ...validGenerateParams, styleId: "" as never }),
      ).rejects.toThrow("Art style is required")
    })
  })

  describe("mintNFT (simulation)", () => {
    it("progresses through 3 steps in order", async () => {
      const steps: ArtStep[] = []
      const service = new ArtService({
        mode: "simulation",
        onStepChange: (step) => steps.push(step),
      })

      const { record } = await service.mintNFT(validMintParams)

      expect(steps).toEqual(["preparing_nft", "minting", "minted"])
      expect(record.status).toBe("minted")
    })

    it("produces mock mint address", async () => {
      const service = new ArtService({ mode: "simulation" })
      const { nft } = await service.mintNFT(validMintParams)

      expect(nft.mintAddress).toBeTruthy()
      expect(nft.mintAddress.startsWith("SIP")).toBe(true)
    })

    it("records step timestamps", async () => {
      const service = new ArtService({ mode: "simulation" })
      const { record } = await service.mintNFT(validMintParams)

      expect(record.stepTimestamps.preparing_nft).toBeDefined()
      expect(record.stepTimestamps.minting).toBeDefined()
      expect(record.stepTimestamps.minted).toBeDefined()
    })

    it("throws on empty name", async () => {
      const service = new ArtService({ mode: "simulation" })

      await expect(
        service.mintNFT({ ...validMintParams, name: "" }),
      ).rejects.toThrow("NFT name is required")
    })
  })
})
