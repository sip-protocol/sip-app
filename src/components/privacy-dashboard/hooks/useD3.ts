"use client"

import { useRef, useEffect, MutableRefObject } from "react"
import * as d3 from "d3"

/**
 * Custom hook for D3.js integration with React
 *
 * Handles the React/D3 lifecycle properly:
 * - Creates SVG reference
 * - Runs D3 code after mount
 * - Cleans up on unmount
 * - Re-renders when dependencies change
 */
export function useD3<T extends SVGSVGElement | HTMLDivElement = SVGSVGElement>(
  renderFn: (selection: d3.Selection<T, unknown, null, undefined>) => void,
  dependencies: React.DependencyList = []
): MutableRefObject<T | null> {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const element = ref.current
    if (element) {
      const selection = d3.select(element) as d3.Selection<
        T,
        unknown,
        null,
        undefined
      >
      renderFn(selection)
    }

    // Cleanup function - capture element before cleanup
    return () => {
      if (element) {
        d3.select(element).selectAll("*").remove()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return ref
}

/**
 * Hook for force-directed graph simulations
 */
export function useForceSimulation<NodeType extends d3.SimulationNodeDatum>(
  nodes: NodeType[],
  links: d3.SimulationLinkDatum<NodeType>[],
  options: {
    width: number
    height: number
    onTick?: () => void
  }
) {
  const simulationRef = useRef<d3.Simulation<
    NodeType,
    d3.SimulationLinkDatum<NodeType>
  > | null>(null)
  const { width, height, onTick } = options

  useEffect(() => {
    simulationRef.current = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<NodeType, d3.SimulationLinkDatum<NodeType>>(links)
          .id((d: NodeType) => (d as unknown as { id: string }).id)
          .distance(80)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30))

    if (onTick) {
      simulationRef.current.on("tick", onTick)
    }

    return () => {
      simulationRef.current?.stop()
    }
  }, [nodes, links, width, height, onTick])

  return simulationRef
}
