"use client"

import { useState, useEffect, useRef } from "react"

const HEX_CHARS = "0123456789abcdef"

interface HashVisualizationProps {
  hash: string
  className?: string
}

export function HashVisualization({ hash, className }: HashVisualizationProps) {
  const cleanHash = hash.startsWith("0x") ? hash.slice(2) : hash
  const [revealedCount, setRevealedCount] = useState(0)
  const [scrambled, setScrambled] = useState(() =>
    Array.from(
      { length: cleanHash.length },
      () => HEX_CHARS[Math.floor(Math.random() * 16)]
    ).join("")
  )
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRevealedCount((prev) => {
        if (prev >= cleanHash.length) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return prev
        }
        return prev + 1
      })

      setScrambled(
        Array.from(
          { length: cleanHash.length },
          () => HEX_CHARS[Math.floor(Math.random() * 16)]
        ).join("")
      )
    }, 40)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [cleanHash.length])

  const displayed =
    cleanHash.slice(0, revealedCount) + scrambled.slice(revealedCount)

  return (
    <div className={className}>
      <code className="font-mono text-sm tracking-wider break-all">
        <span className="text-[var(--text-tertiary)]">0x</span>
        {displayed.split("").map((char, i) => (
          <span
            key={i}
            className={
              i < revealedCount ? "text-orange-400" : "text-orange-400/40"
            }
          >
            {char}
          </span>
        ))}
      </code>
    </div>
  )
}
