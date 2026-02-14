import type { ArtParameters } from "./types"

/**
 * Render deterministic generative art as SVG string.
 * Pure function — same parameters always produce the same art.
 */
export function renderArt(params: ArtParameters): string {
  switch (params.styleId) {
    case "cipher_bloom":
      return renderCipherBloom(params.seed, params.palette)
    case "stealth_grid":
      return renderStealthGrid(params.seed, params.palette)
    case "commitment_flow":
      return renderCommitmentFlow(params.seed, params.palette)
    default:
      throw new Error(`Unknown art style: ${params.styleId as string}`)
  }
}

function seedByte(seed: string, index: number): number {
  const hex = seed.slice((index * 2) % seed.length, (index * 2 + 2) % seed.length)
  return parseInt(hex, 16) || ((index * 37) % 256)
}

function seedFloat(seed: string, index: number): number {
  return seedByte(seed, index) / 255
}

/**
 * Cipher Bloom — concentric fractal circles with spiral paths.
 * Inspired by blooming flowers, each petal derived from seed entropy.
 */
export function renderCipherBloom(seed: string, palette: string[]): string {
  const cx = 200
  const cy = 200
  const layers = 5 + (seedByte(seed, 0) % 4)
  let elements = ""

  // Background radial gradient
  elements += `<defs><radialGradient id="bg"><stop offset="0%" stop-color="${palette[4]}"/><stop offset="100%" stop-color="#0a0a0a"/></radialGradient></defs>`
  elements += `<rect width="400" height="400" fill="url(#bg)"/>`

  // Concentric bloom layers
  for (let i = 0; i < layers; i++) {
    const r = 30 + i * 25 + seedByte(seed, i + 1) % 15
    const petals = 3 + seedByte(seed, i + 10) % 6
    const color = palette[i % palette.length]
    const opacity = 0.3 + seedFloat(seed, i + 20) * 0.5

    for (let p = 0; p < petals; p++) {
      const angle = (p / petals) * Math.PI * 2 + seedFloat(seed, i * 10 + p) * 0.5
      const px = cx + Math.cos(angle) * r
      const py = cy + Math.sin(angle) * r
      const pr = 8 + seedByte(seed, i + p + 30) % 20

      elements += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${pr}" fill="${color}" opacity="${opacity.toFixed(2)}"/>`
    }

    // Spiral path connecting petals
    if (i > 0) {
      const sr = r * 0.7
      const startAngle = seedFloat(seed, i + 40) * Math.PI * 2
      const sx = cx + Math.cos(startAngle) * sr
      const sy = cy + Math.sin(startAngle) * sr
      const ex = cx + Math.cos(startAngle + Math.PI) * sr
      const ey = cy + Math.sin(startAngle + Math.PI) * sr
      const ctrl = sr * 0.5

      elements += `<path d="M${sx.toFixed(1)},${sy.toFixed(1)} Q${(cx + ctrl).toFixed(1)},${(cy - ctrl).toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" fill="none" stroke="${color}" stroke-width="1.5" opacity="${(opacity * 0.6).toFixed(2)}"/>`
    }
  }

  // Center glow
  elements += `<circle cx="${cx}" cy="${cy}" r="12" fill="${palette[0]}" opacity="0.8"/>`
  elements += `<circle cx="${cx}" cy="${cy}" r="6" fill="white" opacity="0.4"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">${elements}</svg>`
}

/**
 * Stealth Grid — geometric grid of transformed rectangles.
 * Precision-inspired, each cell sized and rotated by seed bytes.
 */
export function renderStealthGrid(seed: string, palette: string[]): string {
  const cols = 6 + seedByte(seed, 0) % 4
  const rows = 6 + seedByte(seed, 1) % 4
  const cellW = 400 / cols
  const cellH = 400 / rows
  let elements = ""

  // Dark background
  elements += `<rect width="400" height="400" fill="#0a0a0a"/>`

  // Grid lines (subtle)
  for (let c = 1; c < cols; c++) {
    elements += `<line x1="${c * cellW}" y1="0" x2="${c * cellW}" y2="400" stroke="${palette[4]}" stroke-width="0.5" opacity="0.3"/>`
  }
  for (let r = 1; r < rows; r++) {
    elements += `<line x1="0" y1="${r * cellH}" x2="400" y2="${r * cellH}" stroke="${palette[4]}" stroke-width="0.5" opacity="0.3"/>`
  }

  // Fill cells with transformed rectangles
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c
      const active = seedByte(seed, idx + 2) % 3 !== 0 // ~66% fill rate
      if (!active) continue

      const cx = c * cellW + cellW / 2
      const cy = r * cellH + cellH / 2
      const w = cellW * (0.3 + seedFloat(seed, idx + 20) * 0.5)
      const h = cellH * (0.3 + seedFloat(seed, idx + 40) * 0.5)
      const rotation = seedByte(seed, idx + 60) % 90
      const color = palette[seedByte(seed, idx + 80) % palette.length]
      const opacity = 0.4 + seedFloat(seed, idx + 100) * 0.5

      elements += `<rect x="${(cx - w / 2).toFixed(1)}" y="${(cy - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${color}" opacity="${opacity.toFixed(2)}" transform="rotate(${rotation} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`
    }
  }

  // Accent circles at intersections
  const accents = 3 + seedByte(seed, 3) % 4
  for (let i = 0; i < accents; i++) {
    const ax = seedByte(seed, i + 120) % cols * cellW + cellW / 2
    const ay = seedByte(seed, i + 130) % rows * cellH + cellH / 2
    elements += `<circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="4" fill="${palette[0]}" opacity="0.7"/>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">${elements}</svg>`
}

/**
 * Commitment Flow — flowing particle paths with bezier curves.
 * Organic feel, like currents carrying encrypted data.
 */
export function renderCommitmentFlow(seed: string, palette: string[]): string {
  let elements = ""

  // Gradient background
  elements += `<defs><linearGradient id="flowbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${palette[4]}"/><stop offset="100%" stop-color="#0a0a0a"/></linearGradient></defs>`
  elements += `<rect width="400" height="400" fill="url(#flowbg)"/>`

  // Flowing bezier paths
  const pathCount = 6 + seedByte(seed, 0) % 5
  for (let i = 0; i < pathCount; i++) {
    const sx = seedByte(seed, i * 4 + 1) % 400
    const sy = seedByte(seed, i * 4 + 2) % 400
    const c1x = seedByte(seed, i * 4 + 3) % 400
    const c1y = seedByte(seed, i * 4 + 4) % 400
    const c2x = seedByte(seed, i * 4 + 5) % 400
    const c2y = seedByte(seed, i * 4 + 6) % 400
    const ex = seedByte(seed, i * 4 + 7) % 400
    const ey = seedByte(seed, i * 4 + 8) % 400
    const color = palette[i % palette.length]
    const width = 1 + seedFloat(seed, i + 50) * 3
    const opacity = 0.3 + seedFloat(seed, i + 60) * 0.5

    elements += `<path d="M${sx},${sy} C${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}" fill="none" stroke="${color}" stroke-width="${width.toFixed(1)}" opacity="${opacity.toFixed(2)}" stroke-linecap="round"/>`
  }

  // Particle dots along flows
  const particleCount = 15 + seedByte(seed, 9) % 15
  for (let i = 0; i < particleCount; i++) {
    const px = seedByte(seed, i + 70) % 400
    const py = seedByte(seed, i + 90) % 400
    const pr = 2 + seedFloat(seed, i + 110) * 5
    const color = palette[seedByte(seed, i + 130) % palette.length]
    const opacity = 0.3 + seedFloat(seed, i + 150) * 0.6

    elements += `<circle cx="${px}" cy="${py}" r="${pr.toFixed(1)}" fill="${color}" opacity="${opacity.toFixed(2)}"/>`
  }

  // Glow circles for depth
  for (let i = 0; i < 3; i++) {
    const gx = 50 + seedByte(seed, i + 170) % 300
    const gy = 50 + seedByte(seed, i + 180) % 300
    const gr = 20 + seedByte(seed, i + 190) % 40
    elements += `<circle cx="${gx}" cy="${gy}" r="${gr}" fill="${palette[i % palette.length]}" opacity="0.1"/>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">${elements}</svg>`
}
