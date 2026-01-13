"use client"

import { useRef, useEffect, useState, useId, useCallback } from "react"
import * as d3 from "d3"
import { getScoreColor, riskColors } from "./utils/colorScales"
import { useContainerSize } from "@/hooks/use-container-size"

export interface TimelinePoint {
  date: Date
  score: number
  event?: {
    type: "address_reuse" | "exchange_deposit" | "cluster_link" | "sip_payment"
    description: string
  }
}

interface PrivacyTimelineProps {
  data: TimelinePoint[]
  width?: number
  height?: number
  responsive?: boolean
  ariaLabel?: string
  onPointClick?: (point: TimelinePoint) => void
}

const eventIcons: Record<string, { emoji: string; color: string }> = {
  address_reuse: { emoji: "🔗", color: riskColors.high },
  exchange_deposit: { emoji: "🏦", color: riskColors.critical },
  cluster_link: { emoji: "🕸️", color: riskColors.medium },
  sip_payment: { emoji: "🛡️", color: "#22c55e" },
}

export function PrivacyTimeline({
  data,
  width: propWidth,
  height: propHeight,
  responsive = false,
  ariaLabel = "Privacy score timeline showing historical changes and events",
  onPointClick,
}: PrivacyTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const gradientId = useId().replace(/:/g, "_") // Unique gradient ID for this instance
  const descId = useId().replace(/:/g, "_") // Unique desc ID for accessibility
  const [focusedPointIndex, setFocusedPointIndex] = useState<number>(-1)
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    content: string
    score: number
  }>({ visible: false, x: 0, y: 0, content: "", score: 0 })

  // Responsive sizing
  const containerSize = useContainerSize(containerRef, 600, 200)
  const width = responsive ? containerSize.width : (propWidth ?? 600)
  const height = responsive ? containerSize.height : (propHeight ?? 200)

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 30, right: 30, bottom: 40, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, innerWidth])

    const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0])

    // Create gradient for area fill (unique ID per instance)
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", `areaGradient-${gradientId}`)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%")

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#a855f7")
      .attr("stop-opacity", 0.3)

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#a855f7")
      .attr("stop-opacity", 0.05)

    // Area generator
    const area = d3
      .area<TimelinePoint>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(d.score))
      .curve(d3.curveMonotoneX)

    // Line generator
    const line = d3
      .line<TimelinePoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.score))
      .curve(d3.curveMonotoneX)

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data([0, 30, 50, 70, 100])
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "var(--border-default)")
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.5)

    // Add area
    g.append("path")
      .datum(data)
      .attr("fill", `url(#areaGradient-${gradientId})`)
      .attr("d", area)

    // Add line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#a855f7")
      .attr("stroke-width", 2.5)
      .attr("d", line)

    // Add data points
    g.selectAll(".data-point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScale(d.score))
      .attr("r", (d) => (d.event ? 8 : 4))
      .attr("fill", (d) =>
        d.event ? eventIcons[d.event.type].color : "#a855f7"
      )
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        const dateStr = d.date.toLocaleDateString()
        const eventInfo = d.event
          ? `\n${eventIcons[d.event.type].emoji} ${d.event.description}`
          : ""
        setTooltip({
          visible: true,
          x: event.pageX,
          y: event.pageY,
          content: `${dateStr}\nScore: ${d.score}/100${eventInfo}`,
          score: d.score,
        })
      })
      .on("mouseleave", () => {
        setTooltip((prev) => ({ ...prev, visible: false }))
      })
      .on("click", (_, d) => onPointClick?.(d))

    // Add event markers
    const events = data.filter((d) => d.event)
    g.selectAll(".event-marker")
      .data(events)
      .enter()
      .append("text")
      .attr("class", "event-marker")
      .attr("x", (d) => xScale(d.date))
      .attr("y", (d) => yScale(d.score) - 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text((d) => (d.event ? eventIcons[d.event.type].emoji : ""))

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickFormat((d) => d3.timeFormat("%b %d")(d as Date))
      )
      .selectAll("text")
      .attr("fill", "var(--text-tertiary)")
      .attr("font-size", "10px")

    g.selectAll(".domain, .tick line").attr("stroke", "var(--border-default)")

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text")
      .attr("fill", "var(--text-tertiary)")
      .attr("font-size", "10px")

    // Y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -35)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--text-secondary)")
      .attr("font-size", "11px")
      .text("Privacy Score")
  }, [data, width, height, onPointClick, gradientId])

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<SVGSVGElement>) => {
      if (data.length === 0) return

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault()
          setFocusedPointIndex((prev) => (prev + 1) % data.length)
          break
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault()
          setFocusedPointIndex((prev) =>
            prev <= 0 ? data.length - 1 : prev - 1
          )
          break
        case "Enter":
        case " ":
          event.preventDefault()
          if (focusedPointIndex >= 0 && focusedPointIndex < data.length) {
            onPointClick?.(data[focusedPointIndex])
          }
          break
        case "Escape":
          event.preventDefault()
          setFocusedPointIndex(-1)
          break
      }
    },
    [data, focusedPointIndex, onPointClick]
  )

  // Generate accessible description
  const eventsCount = data.filter((d) => d.event).length
  const minScore = data.length > 0 ? Math.min(...data.map((d) => d.score)) : 0
  const maxScore = data.length > 0 ? Math.max(...data.map((d) => d.score)) : 100
  const accessibleDescription = `Privacy timeline spanning ${data.length} data points. Scores range from ${minScore} to ${maxScore}. ${eventsCount} notable events recorded.`

  return (
    <div
      ref={containerRef}
      className={`relative ${responsive ? "w-full min-h-[150px]" : ""}`}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
        role="img"
        aria-label={ariaLabel}
        aria-describedby={`timeline-desc-${descId}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (focusedPointIndex === -1 && data.length > 0) {
            setFocusedPointIndex(0)
          }
        }}
        onBlur={() => setFocusedPointIndex(-1)}
      >
        <desc id={`timeline-desc-${descId}`}>{accessibleDescription}</desc>
      </svg>

      {/* Screen reader live region for point selection */}
      <div role="status" aria-live="polite" className="sr-only">
        {focusedPointIndex >= 0 && data[focusedPointIndex] && (
          <>
            {data[focusedPointIndex].date.toLocaleDateString()}, score{" "}
            {data[focusedPointIndex].score}.
            {data[focusedPointIndex].event &&
              ` Event: ${data[focusedPointIndex].event.description}`}
          </>
        )}
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 px-3 py-2 text-sm rounded-lg shadow-lg pointer-events-none whitespace-pre-line"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 60,
            backgroundColor: "var(--surface-primary)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
          }}
          role="tooltip"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getScoreColor(tooltip.score) }}
              aria-hidden="true"
            />
            {tooltip.content}
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        className="flex flex-wrap justify-center gap-4 mt-2 text-xs"
        role="list"
        aria-label="Event type legend"
      >
        {Object.entries(eventIcons).map(([type, { emoji }]) => (
          <div key={type} className="flex items-center gap-1" role="listitem">
            <span aria-hidden="true">{emoji}</span>
            <span className="text-[var(--text-tertiary)]">
              {type.replace(/_/g, " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Generate mock timeline data for demo purposes
 */
export function generateMockTimeline(
  currentScore: number,
  days: number = 30
): TimelinePoint[] {
  const data: TimelinePoint[] = []
  const now = new Date()

  type EventType =
    | "address_reuse"
    | "exchange_deposit"
    | "cluster_link"
    | "sip_payment"

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Generate score with some variance
    const variance = Math.sin(i * 0.5) * 10 + (Math.random() - 0.5) * 10
    const baseScore = currentScore + (days - i) * 0.5 // Slight upward trend
    const score = Math.max(0, Math.min(100, baseScore + variance))

    const point: TimelinePoint = { date, score: Math.round(score) }

    // Add random events
    if (Math.random() < 0.15 && i > 0) {
      const eventTypes: EventType[] = [
        "address_reuse",
        "exchange_deposit",
        "cluster_link",
      ]
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]
      point.event = {
        type,
        description:
          type === "address_reuse"
            ? "Address reused in transaction"
            : type === "exchange_deposit"
              ? "Deposit to Binance"
              : "New cluster link detected",
      }
    }

    data.push(point)
  }

  return data
}
