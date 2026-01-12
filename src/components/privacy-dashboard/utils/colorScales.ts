import * as d3 from "d3"

/**
 * Risk level color mapping
 */
export const riskColors = {
  critical: "#ef4444", // red-500
  high: "#f97316", // orange-500
  medium: "#eab308", // yellow-500
  low: "#22c55e", // green-500
}

/**
 * Node type color mapping for network graph
 */
export const nodeColors = {
  self: "#a855f7", // purple-500 (SIP brand)
  exchange: "#ef4444", // red-500
  known: "#3b82f6", // blue-500
  unknown: "#6b7280", // gray-500
}

/**
 * Category color mapping
 */
export const categoryColors = {
  addressReuse: "#f97316", // orange
  clusterExposure: "#8b5cf6", // purple
  exchangeExposure: "#ef4444", // red
  temporalPatterns: "#06b6d4", // cyan
  socialLinks: "#eab308", // yellow
}

/**
 * Create a score-based color scale (0-100)
 * Low scores = red, high scores = green
 */
export function createScoreColorScale(): d3.ScaleLinear<string, string> {
  return d3
    .scaleLinear<string>()
    .domain([0, 30, 50, 70, 100])
    .range(["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"])
    .clamp(true)
}

/**
 * Create a risk-based color scale for heatmap
 */
export function createHeatmapColorScale(
  maxValue: number
): d3.ScaleSequential<string> {
  return d3.scaleSequential(d3.interpolateRdYlGn).domain([0, maxValue])
}

/**
 * Get color for a specific risk level
 */
export function getRiskColor(
  risk: "critical" | "high" | "medium" | "low"
): string {
  return riskColors[risk]
}

/**
 * Get color for a score value
 */
export function getScoreColor(score: number): string {
  const scale = createScoreColorScale()
  return scale(score)
}

/**
 * Create gradient definitions for SVG
 */
export function createGradientDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  const defs = svg.append("defs")

  // Score gradient (red to green)
  const scoreGradient = defs
    .append("linearGradient")
    .attr("id", "scoreGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")

  scoreGradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", riskColors.critical)
  scoreGradient
    .append("stop")
    .attr("offset", "30%")
    .attr("stop-color", riskColors.high)
  scoreGradient
    .append("stop")
    .attr("offset", "50%")
    .attr("stop-color", riskColors.medium)
  scoreGradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", riskColors.low)

  // SIP brand gradient
  const sipGradient = defs
    .append("linearGradient")
    .attr("id", "sipGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")

  sipGradient.append("stop").attr("offset", "0%").attr("stop-color", "#a855f7") // purple
  sipGradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#22c55e") // green

  return defs
}
