"use client"

import { useRef, useEffect, useState, useCallback, useId } from "react"
import * as d3 from "d3"
import { getScoreColor } from "./utils/colorScales"
import { useContainerSize } from "@/hooks/use-container-size"

interface ImprovementItem {
  category: string
  currentScore: number
  projectedScore: number
  reason: string
}

interface ProtectionComparisonProps {
  currentScore: number
  projectedScore: number
  improvements: ImprovementItem[]
  width?: number
  height?: number
  responsive?: boolean
  ariaLabel?: string
  onApplySIP?: () => void
}

const categoryLabels: Record<string, string> = {
  addressReuse: "Address Reuse",
  clusterExposure: "Cluster Exposure",
  exchangeExposure: "Exchange Exposure",
  temporalPatterns: "Temporal Patterns",
  socialLinks: "Social Links",
}

export function ProtectionComparison({
  currentScore,
  projectedScore,
  improvements,
  width: propWidth,
  height: propHeight,
  responsive = false,
  ariaLabel = "Privacy score comparison showing current versus projected improvement with SIP protection",
  onApplySIP,
}: ProtectionComparisonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const descId = useId().replace(/:/g, "_") // Unique desc ID for accessibility
  const [isAnimating, setIsAnimating] = useState(false)
  const [showProjected, setShowProjected] = useState(false)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Responsive sizing
  const containerSize = useContainerSize(containerRef, 500, 300)
  const width = responsive ? containerSize.width : (propWidth ?? 500)
  const height = responsive ? containerSize.height : (propHeight ?? 300)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  const handleApply = useCallback(() => {
    setIsAnimating(true)
    setShowProjected(true)
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    animationTimeoutRef.current = setTimeout(() => setIsAnimating(false), 1500)
    onApplySIP?.()
  }, [onApplySIP])

  const handleReset = useCallback(() => {
    setShowProjected(false)
  }, [])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 40, right: 40, bottom: 40, left: 40 }
    const chartWidth = width / 2 - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom
    const radius = Math.min(chartWidth, chartHeight) / 2

    // Create two groups for current and projected
    const currentG = svg
      .append("g")
      .attr("transform", `translate(${width / 4},${height / 2})`)

    const projectedG = svg
      .append("g")
      .attr("transform", `translate(${(width * 3) / 4},${height / 2})`)

    // Draw arc function
    const arcGenerator = d3
      .arc<{ startAngle: number; endAngle: number }>()
      .innerRadius(radius * 0.7)
      .outerRadius(radius)
      .cornerRadius(5)

    // Background arcs
    const bgArc = {
      startAngle: -Math.PI * 0.75,
      endAngle: Math.PI * 0.75,
    }

    // Current score arc
    currentG
      .append("path")
      .attr("d", arcGenerator(bgArc))
      .attr("fill", "var(--surface-tertiary)")

    // Projected score arc
    projectedG
      .append("path")
      .attr("d", arcGenerator(bgArc))
      .attr("fill", "var(--surface-tertiary)")

    // Score arcs
    const scoreToAngle = (score: number) =>
      -Math.PI * 0.75 + (score / 100) * Math.PI * 1.5

    // Current score fill
    const currentArc = {
      startAngle: -Math.PI * 0.75,
      endAngle: scoreToAngle(currentScore),
    }

    currentG
      .append("path")
      .attr("d", arcGenerator(currentArc))
      .attr("fill", getScoreColor(currentScore))
      .attr("opacity", showProjected ? 0.4 : 1)
      .transition()
      .duration(isAnimating ? 500 : 0)
      .attr("opacity", showProjected ? 0.4 : 1)

    // Projected score fill (animated)
    projectedG
      .append("path")
      .attr(
        "d",
        arcGenerator({
          startAngle: -Math.PI * 0.75,
          endAngle: scoreToAngle(currentScore),
        })
      )
      .attr(
        "fill",
        getScoreColor(showProjected ? projectedScore : currentScore)
      )
      .transition()
      .duration(isAnimating ? 1200 : 0)
      .ease(d3.easeCubicOut)
      .attrTween("d", function () {
        const interpolate = d3.interpolate(
          scoreToAngle(currentScore),
          scoreToAngle(showProjected ? projectedScore : currentScore)
        )
        return function (t) {
          return (
            arcGenerator({
              startAngle: -Math.PI * 0.75,
              endAngle: interpolate(t),
            }) || ""
          )
        }
      })
      .attr(
        "fill",
        getScoreColor(showProjected ? projectedScore : currentScore)
      )

    // Current score text
    currentG
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.1em")
      .attr("fill", "var(--text-primary)")
      .attr("font-size", "32px")
      .attr("font-weight", "bold")
      .text(currentScore)

    currentG
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .attr("fill", "var(--text-tertiary)")
      .attr("font-size", "12px")
      .text("Current")

    // Projected score text (animated)
    const projectedText = projectedG
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.1em")
      .attr("fill", "var(--text-primary)")
      .attr("font-size", "32px")
      .attr("font-weight", "bold")
      .text(currentScore)

    if (isAnimating) {
      projectedText
        .transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .tween("text", function () {
          const interpolate = d3.interpolateNumber(
            currentScore,
            showProjected ? projectedScore : currentScore
          )
          return function (t) {
            this.textContent = Math.round(interpolate(t)).toString()
          }
        })
    } else {
      projectedText.text(showProjected ? projectedScore : currentScore)
    }

    projectedG
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .attr("fill", showProjected ? "#22c55e" : "var(--text-tertiary)")
      .attr("font-size", "12px")
      .text(showProjected ? "With SIP" : "Projected")

    // Arrow between charts
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "24px")
      .text("→")

    // Improvement indicator
    if (showProjected) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2 + 30)
        .attr("text-anchor", "middle")
        .attr("fill", "#22c55e")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("opacity", 0)
        .text(`+${projectedScore - currentScore} points`)
        .transition()
        .duration(800)
        .delay(800)
        .attr("opacity", 1)
    }
  }, [currentScore, projectedScore, width, height, showProjected, isAnimating])

  // Generate accessible description
  const improvement = projectedScore - currentScore
  const accessibleDescription = `Privacy score comparison chart. Current score: ${currentScore}. Projected score with SIP protection: ${projectedScore}. Potential improvement: ${improvement} points across ${improvements.length} categories.`

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center ${responsive ? "w-full" : ""}`}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        aria-describedby={`comparison-desc-${descId}`}
        tabIndex={0}
      >
        <desc id={`comparison-desc-${descId}`}>{accessibleDescription}</desc>
      </svg>

      {/* Improvements list */}
      <div
        className="w-full max-w-md mt-4 space-y-2"
        role="list"
        aria-label="Privacy improvement categories"
      >
        {improvements.map((item, index) => (
          <div
            key={item.category}
            role="listitem"
            aria-label={`${categoryLabels[item.category] || item.category}: ${
              showProjected
                ? `improved from ${item.currentScore} to ${item.projectedScore}`
                : `current score ${item.currentScore}`
            }`}
            className={`flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${
              showProjected
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-[var(--surface-secondary)]"
            }`}
            style={{
              transitionDelay: showProjected ? `${index * 100}ms` : "0ms",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${showProjected ? "text-green-400" : "text-[var(--text-tertiary)]"}`}
                aria-hidden="true"
              >
                {showProjected ? "✓" : "○"}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">
                {categoryLabels[item.category] || item.category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-mono ${
                  showProjected
                    ? "line-through text-[var(--text-tertiary)]"
                    : ""
                }`}
                aria-label={
                  showProjected
                    ? `previous score ${item.currentScore}`
                    : undefined
                }
              >
                {item.currentScore}
              </span>
              {showProjected && (
                <>
                  <span className="text-green-400" aria-hidden="true">
                    →
                  </span>
                  <span
                    className="text-sm font-mono text-green-400 font-semibold"
                    aria-label={`new score ${item.projectedScore}`}
                  >
                    {item.projectedScore}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action button */}
      <div className="mt-6 flex gap-3">
        {!showProjected ? (
          <button
            onClick={handleApply}
            className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-sip-purple-500 to-sip-green-500 text-white hover:opacity-90 transition-opacity"
          >
            Apply SIP Protection
          </button>
        ) : (
          <>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg font-medium bg-[var(--surface-tertiary)] text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              Reset
            </button>
            <a
              href="/payments"
              className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-sip-purple-500 to-sip-green-500 text-white hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              Try SIP Now
              <span>→</span>
            </a>
          </>
        )}
      </div>
    </div>
  )
}
