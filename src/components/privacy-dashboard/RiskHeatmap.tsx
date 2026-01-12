"use client"

import { useRef, useEffect } from "react"
import * as d3 from "d3"
import { categoryColors, getScoreColor } from "./utils/colorScales"

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
  onCategoryClick?: (category: string) => void
}

export function RiskHeatmap({
  data,
  width = 500,
  height = 250,
  onCategoryClick,
}: RiskHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null)

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
        marker
          .append("circle")
          .attr("r", 4)
          .attr("fill", d.color)
        marker
          .append("text")
          .attr("x", 8)
          .attr("y", 4)
          .attr("fill", "var(--text-tertiary)")
          .attr("font-size", "9px")
          .text(d.label)
      })
  }, [data, width, height, onCategoryClick])

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      />
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
