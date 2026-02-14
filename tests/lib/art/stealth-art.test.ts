import { describe, it, expect } from "vitest"
import { generateArtSeed, deriveArtParameters } from "@/lib/art/stealth-art"

const TEST_ADDRESS = "sip:solana:0x" + "aa".repeat(32)
const ALT_ADDRESS = "sip:solana:0x" + "bb".repeat(32)

describe("generateArtSeed", () => {
  it("produces a deterministic seed", () => {
    const seed1 = generateArtSeed(TEST_ADDRESS)
    const seed2 = generateArtSeed(TEST_ADDRESS)
    expect(seed1).toBe(seed2)
  })

  it("produces different seeds for different addresses", () => {
    const seed1 = generateArtSeed(TEST_ADDRESS)
    const seed2 = generateArtSeed(ALT_ADDRESS)
    expect(seed1).not.toBe(seed2)
  })

  it("produces a valid hex string of 64 characters", () => {
    const seed = generateArtSeed(TEST_ADDRESS)
    expect(seed).toHaveLength(64)
    expect(/^[0-9a-f]+$/i.test(seed)).toBe(true)
  })
})

describe("deriveArtParameters", () => {
  const seed = generateArtSeed(TEST_ADDRESS)

  it("returns a valid palette with 5 colors", () => {
    const params = deriveArtParameters(seed, "cipher_bloom")
    expect(params.palette).toHaveLength(5)
    expect(params.palette.every((c) => c.startsWith("#"))).toBe(true)
  })

  it("returns correct styleId", () => {
    const params = deriveArtParameters(seed, "stealth_grid")
    expect(params.styleId).toBe("stealth_grid")
  })

  it("is deterministic — same seed produces same parameters", () => {
    const params1 = deriveArtParameters(seed, "commitment_flow")
    const params2 = deriveArtParameters(seed, "commitment_flow")
    expect(params1).toEqual(params2)
  })

  it("has valid shape configuration", () => {
    const params = deriveArtParameters(seed, "cipher_bloom")
    expect(params.shapes.count).toBeGreaterThanOrEqual(8)
    expect(params.shapes.types.length).toBeGreaterThanOrEqual(1)
  })

  it("has valid transform values", () => {
    const params = deriveArtParameters(seed, "cipher_bloom")
    expect(params.transforms.rotation).toBeGreaterThanOrEqual(0)
    expect(params.transforms.rotation).toBeLessThan(360)
    expect(params.transforms.scale).toBeGreaterThan(0)
    expect(params.transforms.opacity).toBeGreaterThanOrEqual(0.3)
    expect(params.transforms.opacity).toBeLessThanOrEqual(1)
  })
})
