import { describe, it, expect, vi, beforeEach } from "vitest"
import { ArtService } from "@/lib/art/art-service"
import { PrivacyLevel } from "@sip-protocol/types"
import type { ArtStep, GenerateArtParams, MintArtParams } from "@/lib/art/types"
import { Transaction } from "@solana/web3.js"

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
      const error = service.validate("generate", {
        ...validGenerateParams,
        styleId: "" as never,
      })
      expect(error).toBe("Art style is required")
    })

    it("rejects invalid styleId for generate", () => {
      const service = new ArtService()
      const error = service.validate("generate", {
        ...validGenerateParams,
        styleId: "unknown" as never,
      })
      expect(error).toBe("Invalid art style")
    })

    it("accepts valid generate params", () => {
      const service = new ArtService()
      expect(service.validate("generate", validGenerateParams)).toBeNull()
    })

    it("rejects missing generatedArtId for mint", () => {
      const service = new ArtService()
      const error = service.validate("mint", {
        ...validMintParams,
        generatedArtId: "",
      })
      expect(error).toBe("Generated art ID is required")
    })

    it("rejects empty name for mint", () => {
      const service = new ArtService()
      const error = service.validate("mint", { ...validMintParams, name: "" })
      expect(error).toBe("NFT name is required")
    })

    it("rejects long name for mint", () => {
      const service = new ArtService()
      const error = service.validate("mint", {
        ...validMintParams,
        name: "a".repeat(33),
      })
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
        service.generateArt({ ...validGenerateParams, styleId: "" as never })
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

    it("produces mock mint address when no builder configured", async () => {
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
        service.mintNFT({ ...validMintParams, name: "" })
      ).rejects.toThrow("NFT name is required")
    })
  })

  describe("mintNFT (cNFT via Bubblegum)", () => {
    it("calls buildCNFTMint with correct stealth recipient", async () => {
      const mockTx = new Transaction()
      const buildCNFTMint = vi.fn().mockResolvedValue(mockTx)
      const onSendTransaction = vi
        .fn()
        .mockResolvedValue("mock-signature-abc123")

      const service = new ArtService({
        mode: "simulation",
        buildCNFTMint,
        onSendTransaction,
      })

      const mintParams: MintArtParams = {
        ...validMintParams,
        stealthAddress: "sip:solana:0x" + "ee".repeat(32),
        metadataUri: "https://arweave.net/test-metadata",
      }

      const { record, nft } = await service.mintNFT(mintParams)

      expect(buildCNFTMint).toHaveBeenCalledOnce()
      expect(buildCNFTMint).toHaveBeenCalledWith({
        recipient: "sip:solana:0x" + "ee".repeat(32),
        name: "My Privacy Art",
        metadataUri: "https://arweave.net/test-metadata",
      })
      expect(onSendTransaction).toHaveBeenCalledWith(mockTx)
      expect(record.txSignature).toBe("mock-signature-abc123")
      expect(nft.mintAddress).toBe("mock-signature-abc123")
    })

    it("falls back to simulation when buildCNFTMint returns null", async () => {
      const buildCNFTMint = vi.fn().mockResolvedValue(null)
      const onSendTransaction = vi.fn()

      const service = new ArtService({
        mode: "simulation",
        buildCNFTMint,
        onSendTransaction,
      })

      const mintParams: MintArtParams = {
        ...validMintParams,
        stealthAddress: "sip:solana:0x" + "ee".repeat(32),
      }

      const { nft } = await service.mintNFT(mintParams)

      expect(buildCNFTMint).toHaveBeenCalledOnce()
      expect(onSendTransaction).not.toHaveBeenCalled()
      expect(nft.mintAddress.startsWith("SIP")).toBe(true)
    })

    it("falls back to simulation when no stealthAddress provided", async () => {
      const buildCNFTMint = vi.fn()
      const onSendTransaction = vi.fn()

      const service = new ArtService({
        mode: "simulation",
        buildCNFTMint,
        onSendTransaction,
      })

      const { nft } = await service.mintNFT(validMintParams)

      expect(buildCNFTMint).not.toHaveBeenCalled()
      expect(onSendTransaction).not.toHaveBeenCalled()
      expect(nft.mintAddress.startsWith("SIP")).toBe(true)
    })

    it("falls back to simulation when onSendTransaction returns null", async () => {
      const mockTx = new Transaction()
      const buildCNFTMint = vi.fn().mockResolvedValue(mockTx)
      const onSendTransaction = vi.fn().mockResolvedValue(null)

      const service = new ArtService({
        mode: "simulation",
        buildCNFTMint,
        onSendTransaction,
      })

      const mintParams: MintArtParams = {
        ...validMintParams,
        stealthAddress: "sip:solana:0x" + "ee".repeat(32),
      }

      const { nft, record } = await service.mintNFT(mintParams)

      expect(buildCNFTMint).toHaveBeenCalledOnce()
      expect(onSendTransaction).toHaveBeenCalledWith(mockTx)
      // Falls back to SIP-prefixed address when tx send returns null
      expect(nft.mintAddress.startsWith("SIP")).toBe(true)
      expect(record.txSignature).toBeUndefined()
    })

    it("uses provided metadataUri for cNFT mint", async () => {
      const buildCNFTMint = vi.fn().mockResolvedValue(new Transaction())
      const onSendTransaction = vi.fn().mockResolvedValue("sig-123")

      const service = new ArtService({
        mode: "simulation",
        buildCNFTMint,
        onSendTransaction,
      })

      const mintParams: MintArtParams = {
        ...validMintParams,
        stealthAddress: "sip:solana:0xrecipient",
        metadataUri: "https://arweave.net/custom-uri",
      }

      const { nft } = await service.mintNFT(mintParams)

      expect(buildCNFTMint).toHaveBeenCalledWith(
        expect.objectContaining({
          metadataUri: "https://arweave.net/custom-uri",
        })
      )
      expect(nft.metadataUri).toBe("https://arweave.net/custom-uri")
    })

    it("generates metadataUri when not provided in params", async () => {
      const buildCNFTMint = vi.fn().mockResolvedValue(new Transaction())
      const onSendTransaction = vi.fn().mockResolvedValue("sig-456")

      const service = new ArtService({
        mode: "simulation",
        buildCNFTMint,
        onSendTransaction,
      })

      const mintParams: MintArtParams = {
        ...validMintParams,
        stealthAddress: "sip:solana:0xrecipient",
      }

      const { nft } = await service.mintNFT(mintParams)

      expect(nft.metadataUri).toContain("https://arweave.net/")
    })

    it("records step timestamps with cNFT flow", async () => {
      const service = new ArtService({
        mode: "simulation",
        buildCNFTMint: vi.fn().mockResolvedValue(new Transaction()),
        onSendTransaction: vi.fn().mockResolvedValue("sig-789"),
      })

      const mintParams: MintArtParams = {
        ...validMintParams,
        stealthAddress: "sip:solana:0xrecipient",
      }

      const { record } = await service.mintNFT(mintParams)

      expect(record.stepTimestamps.preparing_nft).toBeDefined()
      expect(record.stepTimestamps.minting).toBeDefined()
      expect(record.stepTimestamps.minted).toBeDefined()
      expect(record.status).toBe("minted")
    })
  })
})
