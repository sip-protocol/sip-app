import { describe, it, expect } from "vitest"
import { renderArt, renderCipherBloom, renderStealthGrid, renderCommitmentFlow } from "@/lib/art/art-engine"
import type { ArtParameters } from "@/lib/art/types"

const TEST_SEED = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
const TEST_PALETTE = ["#f43f5e", "#e11d48", "#be123c", "#881337", "#4c0519"]

describe("renderCipherBloom", () => {
  it("produces valid SVG", () => {
    const svg = renderCipherBloom(TEST_SEED, TEST_PALETTE)
    expect(svg).toContain("<svg")
    expect(svg).toContain("</svg>")
    expect(svg).toContain("viewBox")
  })

  it("produces deterministic output", () => {
    const svg1 = renderCipherBloom(TEST_SEED, TEST_PALETTE)
    const svg2 = renderCipherBloom(TEST_SEED, TEST_PALETTE)
    expect(svg1).toBe(svg2)
  })

  it("produces different output for different seeds", () => {
    const svg1 = renderCipherBloom(TEST_SEED, TEST_PALETTE)
    const svg2 = renderCipherBloom("ff" + TEST_SEED.slice(2), TEST_PALETTE)
    expect(svg1).not.toBe(svg2)
  })
})

describe("renderStealthGrid", () => {
  it("produces valid SVG", () => {
    const svg = renderStealthGrid(TEST_SEED, TEST_PALETTE)
    expect(svg).toContain("<svg")
    expect(svg).toContain("</svg>")
    expect(svg).toContain("rect")
  })

  it("produces deterministic output", () => {
    const svg1 = renderStealthGrid(TEST_SEED, TEST_PALETTE)
    const svg2 = renderStealthGrid(TEST_SEED, TEST_PALETTE)
    expect(svg1).toBe(svg2)
  })

  it("produces different output for different seeds", () => {
    const svg1 = renderStealthGrid(TEST_SEED, TEST_PALETTE)
    const svg2 = renderStealthGrid("00" + TEST_SEED.slice(2), TEST_PALETTE)
    expect(svg1).not.toBe(svg2)
  })
})

describe("renderCommitmentFlow", () => {
  it("produces valid SVG", () => {
    const svg = renderCommitmentFlow(TEST_SEED, TEST_PALETTE)
    expect(svg).toContain("<svg")
    expect(svg).toContain("</svg>")
    expect(svg).toContain("path")
  })

  it("produces deterministic output", () => {
    const svg1 = renderCommitmentFlow(TEST_SEED, TEST_PALETTE)
    const svg2 = renderCommitmentFlow(TEST_SEED, TEST_PALETTE)
    expect(svg1).toBe(svg2)
  })

  it("produces different output for different seeds", () => {
    const svg1 = renderCommitmentFlow(TEST_SEED, TEST_PALETTE)
    const svg2 = renderCommitmentFlow("bb" + TEST_SEED.slice(2), TEST_PALETTE)
    expect(svg1).not.toBe(svg2)
  })
})

describe("renderArt dispatcher", () => {
  const makeParams = (styleId: string): ArtParameters => ({
    styleId: styleId as ArtParameters["styleId"],
    palette: TEST_PALETTE,
    shapes: { count: 10, types: ["circle"] },
    transforms: { rotation: 0, scale: 1, opacity: 1 },
    seed: TEST_SEED,
  })

  it("routes to cipher_bloom renderer", () => {
    const svg = renderArt(makeParams("cipher_bloom"))
    expect(svg).toContain("<svg")
    expect(svg).toContain("radialGradient")
  })

  it("routes to stealth_grid renderer", () => {
    const svg = renderArt(makeParams("stealth_grid"))
    expect(svg).toContain("<svg")
    expect(svg).toContain("line")
  })

  it("routes to commitment_flow renderer", () => {
    const svg = renderArt(makeParams("commitment_flow"))
    expect(svg).toContain("<svg")
    expect(svg).toContain("linearGradient")
  })

  it("throws for unknown style", () => {
    expect(() => renderArt(makeParams("unknown_style"))).toThrow("Unknown art style")
  })
})
