"use client"

import { useRef, useEffect, useState, useCallback, useId } from "react"
import * as d3 from "d3"
import { nodeColors } from "./utils/colorScales"
import { useContainerSize } from "@/hooks/use-container-size"

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string
  type: "self" | "exchange" | "known" | "unknown"
  label?: string
  risk: number
  transactionCount?: number
}

export interface GraphEdge extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode
  target: string | GraphNode
  weight: number
  type: "send" | "receive"
}

interface NetworkGraphProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  width?: number
  height?: number
  responsive?: boolean
  ariaLabel?: string
  onNodeClick?: (node: GraphNode) => void
}

export function NetworkGraph({
  nodes,
  edges,
  width: propWidth,
  height: propHeight,
  responsive = false,
  ariaLabel = "Network graph visualization showing wallet connections and transaction relationships",
  onNodeClick,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const markerId = useId().replace(/:/g, "_") // Unique marker ID for this instance
  const descId = useId().replace(/:/g, "_") // Unique desc ID for accessibility
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [focusedNodeIndex, setFocusedNodeIndex] = useState<number>(-1)
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    content: string
  }>({ visible: false, x: 0, y: 0, content: "" })

  // Responsive sizing
  const containerSize = useContainerSize(containerRef, 600, 400)
  const width = responsive ? containerSize.width : (propWidth ?? 600)
  const height = responsive ? containerSize.height : (propHeight ?? 400)

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      setSelectedNode(node)
      onNodeClick?.(node)
    },
    [onNodeClick]
  )

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    // Create container group for zoom/pan
    const g = svg.append("g")

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    svg.call(zoom)

    // Create arrow marker for directed edges (unique ID per instance)
    svg
      .append("defs")
      .append("marker")
      .attr("id", `arrowhead-${markerId}`)
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .append("path")
      .attr("d", "M 0,-5 L 10,0 L 0,5")
      .attr("fill", "#6b7280")

    // Create force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphEdge>(edges)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35))

    // Create edges
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(edges)
      .enter()
      .append("line")
      .attr("stroke", "#4b5563")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.sqrt(d.weight) * 2)
      .attr("marker-end", `url(#arrowhead-${markerId})`)

    // Create node groups
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on("drag", (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )

    // Add circles to nodes
    node
      .append("circle")
      .attr("r", (d) => (d.type === "self" ? 25 : 18))
      .attr("fill", (d) => nodeColors[d.type])
      .attr("stroke", (d) =>
        selectedNode?.id === d.id ? "#ffffff" : "transparent"
      )
      .attr("stroke-width", 3)
      .on("click", (_, d) => handleNodeClick(d))
      .on("mouseenter", (event, d) => {
        const nodeType =
          d.type === "self"
            ? "Your Wallet"
            : d.type === "exchange"
              ? "Exchange"
              : d.type === "known"
                ? "Known Address"
                : "Unknown Address"

        setTooltip({
          visible: true,
          x: event.pageX,
          y: event.pageY,
          content: `${nodeType}${d.label ? `: ${d.label}` : ""}\n${d.transactionCount || 0} transactions`,
        })
      })
      .on("mouseleave", () => {
        setTooltip((prev) => ({ ...prev, visible: false }))
      })

    // Add icons/labels to nodes
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "white")
      .attr("font-size", (d) => (d.type === "self" ? "16px" : "12px"))
      .attr("pointer-events", "none")
      .text((d) => {
        if (d.type === "self") return "You"
        if (d.type === "exchange") return "CEX"
        if (d.label) return d.label.slice(0, 4)
        return d.id.slice(0, 4)
      })

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x || 0)
        .attr("y1", (d) => (d.source as GraphNode).y || 0)
        .attr("x2", (d) => (d.target as GraphNode).x || 0)
        .attr("y2", (d) => (d.target as GraphNode).y || 0)

      node.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`)
    })

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [nodes, edges, width, height, handleNodeClick, selectedNode, markerId])

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<SVGSVGElement>) => {
      if (nodes.length === 0) return

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault()
          setFocusedNodeIndex((prev) => (prev + 1) % nodes.length)
          break
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault()
          setFocusedNodeIndex((prev) =>
            prev <= 0 ? nodes.length - 1 : prev - 1
          )
          break
        case "Enter":
        case " ":
          event.preventDefault()
          if (focusedNodeIndex >= 0 && focusedNodeIndex < nodes.length) {
            handleNodeClick(nodes[focusedNodeIndex])
          }
          break
        case "Escape":
          event.preventDefault()
          setFocusedNodeIndex(-1)
          setSelectedNode(null)
          break
      }
    },
    [nodes, focusedNodeIndex, handleNodeClick]
  )

  // Generate accessible description
  const accessibleDescription = `Network graph with ${nodes.length} nodes and ${edges.length} connections. ${
    nodes.filter((n) => n.type === "exchange").length
  } exchange connections, ${
    nodes.filter((n) => n.type === "known").length
  } known addresses, ${
    nodes.filter((n) => n.type === "unknown").length
  } unknown addresses.`

  return (
    <div
      ref={containerRef}
      className={`relative ${responsive ? "w-full h-full min-h-[300px]" : ""}`}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-default)]"
        role="img"
        aria-label={ariaLabel}
        aria-describedby={`network-desc-${descId}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (focusedNodeIndex === -1 && nodes.length > 0) {
            setFocusedNodeIndex(0)
          }
        }}
        onBlur={() => setFocusedNodeIndex(-1)}
      >
        <desc id={`network-desc-${descId}`}>{accessibleDescription}</desc>
      </svg>

      {/* Screen reader live region for node selection */}
      <div role="status" aria-live="polite" className="sr-only">
        {focusedNodeIndex >= 0 && nodes[focusedNodeIndex] && (
          <>
            Focused on{" "}
            {nodes[focusedNodeIndex].label ||
              nodes[focusedNodeIndex].id.slice(0, 8)}
            , {nodes[focusedNodeIndex].type} node.
            {nodes[focusedNodeIndex].transactionCount !== undefined &&
              ` ${nodes[focusedNodeIndex].transactionCount} transactions.`}
          </>
        )}
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg pointer-events-none whitespace-pre-line"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
          role="tooltip"
        >
          {tooltip.content}
        </div>
      )}

      {/* Legend */}
      <div
        className="absolute bottom-3 left-3 flex flex-wrap gap-3 text-xs"
        role="list"
        aria-label="Node type legend"
      >
        {Object.entries(nodeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5" role="listitem">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="text-[var(--text-secondary)] capitalize">
              {type === "self" ? "You" : type}
            </span>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div
        className="absolute top-3 right-3 text-xs text-[var(--text-tertiary)]"
        aria-hidden="true"
      >
        Drag nodes to explore • Scroll to zoom
      </div>
    </div>
  )
}

/**
 * Generate network graph data from cluster analysis
 */
export function generateNetworkFromCluster(
  walletAddress: string,
  clusterData?: {
    linkedAddressCount: number
    clusters: Array<{
      addresses: string[]
      linkType: "common-input" | "change-address" | "consolidation"
      transactionCount: number
    }>
  },
  exchangeData?: {
    exchanges: Array<{
      address: string
      name: string
      transactionCount: number
    }>
  }
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const addressSet = new Set<string>()

  // Add self node
  nodes.push({
    id: walletAddress,
    type: "self",
    label: "Your Wallet",
    risk: 0,
    transactionCount: 0,
  })
  addressSet.add(walletAddress)

  // Add exchange nodes
  if (exchangeData?.exchanges) {
    for (const exchange of exchangeData.exchanges) {
      if (!addressSet.has(exchange.address)) {
        nodes.push({
          id: exchange.address,
          type: "exchange",
          label: exchange.name,
          risk: 80,
          transactionCount: exchange.transactionCount,
        })
        addressSet.add(exchange.address)
      }

      edges.push({
        source: walletAddress,
        target: exchange.address,
        weight: exchange.transactionCount,
        type: "send",
      })
    }
  }

  // Add cluster nodes
  if (clusterData?.clusters) {
    for (const cluster of clusterData.clusters) {
      for (const address of cluster.addresses) {
        if (address === walletAddress) continue

        if (!addressSet.has(address)) {
          nodes.push({
            id: address,
            type: "unknown",
            risk: 50,
            transactionCount: cluster.transactionCount,
          })
          addressSet.add(address)
        }

        edges.push({
          source: walletAddress,
          target: address,
          weight: cluster.transactionCount,
          type: cluster.linkType === "consolidation" ? "receive" : "send",
        })
      }
    }
  }

  return { nodes, edges }
}
