"use client"

import { useRef, useEffect, useState, useCallback, useId } from "react"
import * as d3 from "d3"
import { getScoreColor } from "./utils/colorScales"
import { useContainerSize } from "@/hooks/use-container-size"

interface CategoryScore {
  category: string
  label: string
  score: number
  maxScore: number
  description: string
}

interface RiskHeatmapProps {
  data: CategoryScore[]
  width?: number
  height?: number
  responsive?: boolean
  ariaLabel?: string
  onCategoryClick?: (category: string) => void
}

export function RiskHeatmap({
  data,
  width: propWidth,
  height: propHeight,
  responsive = false,
  ariaLabel = "Risk heatmap showing privacy risk breakdown by category",
  onCategoryClick,
}: RiskHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const descId = useId().replace(/:/g, "_") // Unique desc ID for accessibility
  const [focusedCategoryIndex, setFocusedCategoryIndex] = useState<number>(-1)

  // Responsive sizing
  const containerSize = useContainerSize(containerRef, 500, 250)
  const width = responsive ? containerSize.width : (propWidth ?? 500)
  const height = responsive ? containerSize.height : (propHeight ?? 250)

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 100, bottom: 20, left: 140 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Y scale for categories
    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.category))
      .range([0, innerHeight])
      .padding(0.2)

    // X scale for scores
    const xScale = d3.scaleLinear().domain([0, 25]).range([0, innerWidth])

    // Add category labels
    g.selectAll(".category-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "category-label")
      .attr("x", -10)
      .attr("y", (d) => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", "var(--text-secondary)")
      .attr("font-size", "12px")
      .text((d) => d.label)

    // Background bars (max score)
    g.selectAll(".bg-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bg-bar")
      .attr("x", 0)
      .attr("y", (d) => yScale(d.category) || 0)
      .attr("width", innerWidth)
      .attr("height", yScale.bandwidth())
      .attr("fill", "var(--surface-tertiary)")
      .attr("rx", 4)

    // Score bars with gradient based on score
    g.selectAll(".score-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "score-bar")
      .attr("x", 0)
      .attr("y", (d) => yScale(d.category) || 0)
      .attr("width", 0)
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => {
        const percentage = (d.score / d.maxScore) * 100
        return getScoreColor(percentage)
      })
      .attr("rx", 4)
      .attr("cursor", "pointer")
      .on("click", (_, d) => onCategoryClick?.(d.category))
      .transition()
      .duration(800)
      .delay((_, i) => i * 100)
      .attr("width", (d) => xScale(d.score))

    // Score text
    g.selectAll(".score-text")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "score-text")
      .attr("x", (d) => xScale(d.score) + 8)
      .attr("y", (d) => (yScale(d.category) || 0) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("fill", "var(--text-primary)")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("opacity", 0)
      .text((d) => `${d.score}/${d.maxScore}`)
      .transition()
      .duration(400)
      .delay((_, i) => i * 100 + 600)
      .attr("opacity", 1)

    // Risk level indicators
    const riskLevels = [
      { label: "Critical", x: 0, color: "#ef4444" },
      { label: "High", x: innerWidth * 0.3, color: "#f97316" },
      { label: "Medium", x: innerWidth * 0.5, color: "#eab308" },
      { label: "Low", x: innerWidth * 0.7, color: "#22c55e" },
    ]

    // Add scale markers at bottom
    const scaleG = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${height - 10})`)

    scaleG
      .selectAll(".scale-marker")
      .data(riskLevels)
      .enter()
      .append("g")
      .attr("class", "scale-marker")
      .attr("transform", (d) => `translate(${d.x},0)`)
      .each(function (d) {
        const marker = d3.select(this)
        marker.append("circle").attr("r", 4).attr("fill", d.color)
        marker
          .append("text")
          .attr("x", 8)
          .attr("y", 4)
          .attr("fill", "var(--text-tertiary)")
          .attr("font-size", "9px")
          .text(d.label)
      })
  }, [data, width, height, onCategoryClick])

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<SVGSVGElement>) => {
      if (data.length === 0) return

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault()
          setFocusedCategoryIndex((prev) => (prev + 1) % data.length)
          break
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault()
          setFocusedCategoryIndex((prev) =>
            prev <= 0 ? data.length - 1 : prev - 1
          )
          break
        case "Enter":
        case " ":
          event.preventDefault()
          if (focusedCategoryIndex >= 0 && focusedCategoryIndex < data.length) {
            onCategoryClick?.(data[focusedCategoryIndex].category)
          }
          break
        case "Escape":
          event.preventDefault()
          setFocusedCategoryIndex(-1)
          break
      }
    },
    [data, focusedCategoryIndex, onCategoryClick]
  )

  // Generate accessible description
  const totalScore = data.reduce((sum, d) => sum + d.score, 0)
  const totalMaxScore = data.reduce((sum, d) => sum + d.maxScore, 0)
  const accessibleDescription = `Risk heatmap with ${data.length} categories. Total risk score: ${totalScore} out of ${totalMaxScore}. Categories: ${data.map((d) => `${d.label}: ${d.score}/${d.maxScore}`).join(", ")}.`

  return (
    <div
      ref={containerRef}
      className={`relative ${responsive ? "w-full min-h-[200px]" : ""}`}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
        role="img"
        aria-label={ariaLabel}
        aria-describedby={`heatmap-desc-${descId}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (focusedCategoryIndex === -1 && data.length > 0) {
            setFocusedCategoryIndex(0)
          }
        }}
        onBlur={() => setFocusedCategoryIndex(-1)}
      >
        <desc id={`heatmap-desc-${descId}`}>{accessibleDescription}</desc>
      </svg>

      {/* Screen reader live region for category selection */}
      <div role="status" aria-live="polite" className="sr-only">
        {focusedCategoryIndex >= 0 && data[focusedCategoryIndex] && (
          <>
            {data[focusedCategoryIndex].label}: score{" "}
            {data[focusedCategoryIndex].score} out of{" "}
            {data[focusedCategoryIndex].maxScore}.{" "}
            {data[focusedCategoryIndex].description}
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Transform privacy score breakdown into heatmap data
 */
export function transformBreakdownToHeatmap(breakdown: {
  addressReuse: number
  clusterExposure: number
  exchangeExposure: number
  temporalPatterns: number
  socialLinks: number
}): CategoryScore[] {
  return [
    {
      category: "addressReuse",
      label: "Address Reuse",
      score: breakdown.addressReuse,
      maxScore: 25,
      description: "How often addresses are reused",
    },
    {
      category: "clusterExposure",
      label: "Cluster Exposure",
      score: breakdown.clusterExposure,
      maxScore: 25,
      description: "Linked addresses detected",
    },
    {
      category: "exchangeExposure",
      label: "Exchange Exposure",
      score: breakdown.exchangeExposure,
      maxScore: 20,
      description: "CEX/DEX interactions",
    },
    {
      category: "temporalPatterns",
      label: "Temporal Patterns",
      score: breakdown.temporalPatterns,
      maxScore: 15,
      description: "Transaction timing patterns",
    },
    {
      category: "socialLinks",
      label: "Social Links",
      score: breakdown.socialLinks,
      maxScore: 15,
      description: "Identity connections",
    },
  ]
}
