"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const COLORS = [
  "#f97316", "#22c55e", "#3b82f6", "#a855f7",
  "#eab308", "#ef4444", "#06b6d4", "#ec4899",
]

// Deterministic pseudo-random generator (mulberry32)
function seededRandom(seed: number) {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface ConfettiParticlesProps {
  count?: number
}

function generateParticles(count: number) {
  const rand = seededRandom(42)
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (rand() - 0.5) * 300,
    y: -(rand() * 200 + 50),
    rotation: rand() * 720 - 360,
    color: COLORS[Math.floor(rand() * COLORS.length)],
    size: rand() * 6 + 4,
    delay: rand() * 0.3,
  }))
}

export function ConfettiParticles({ count = 20 }: ConfettiParticlesProps) {
  const [particles] = useState(() => generateParticles(count))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [1, 1, 0],
            scale: [0, 1, 0.5],
            rotate: p.rotation,
          }}
          transition={{
            duration: 1.2,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  )
}
