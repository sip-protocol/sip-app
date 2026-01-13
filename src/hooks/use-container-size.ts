"use client"

import { useState, useEffect, useCallback, RefObject } from "react"

interface ContainerSize {
  width: number
  height: number
}

/**
 * Hook to detect and track container dimensions using ResizeObserver.
 * Used for responsive D3.js visualizations that adapt to their container.
 *
 * @param containerRef - Ref to the container element to observe
 * @param defaultWidth - Default width when container is not yet measured
 * @param defaultHeight - Default height when container is not yet measured
 * @returns Current container dimensions
 */
export function useContainerSize(
  containerRef: RefObject<HTMLDivElement | null>,
  defaultWidth: number = 600,
  defaultHeight: number = 400
): ContainerSize {
  const [size, setSize] = useState<ContainerSize>({
    width: defaultWidth,
    height: defaultHeight,
  })

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setSize({
        width: Math.max(width, 100), // Minimum width to prevent collapse
        height: Math.max(height, 100), // Minimum height to prevent collapse
      })
    }
  }, [containerRef])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    // Initial measurement
    updateSize()

    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      // Use requestAnimationFrame to batch updates
      window.requestAnimationFrame(() => {
        for (const entry of entries) {
          if (entry.target === element) {
            const { width, height } = entry.contentRect
            setSize({
              width: Math.max(width, 100),
              height: Math.max(height, 100),
            })
          }
        }
      })
    })

    resizeObserver.observe(element)

    return () => {
      resizeObserver.disconnect()
    }
  }, [containerRef, updateSize])

  return size
}
