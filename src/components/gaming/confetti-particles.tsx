"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"

const COLORS = [
  "#f97316", "#22c55e", "#3b82f6", "#a855f7",
  "#eab308", "#ef4444", "#06b6d4", "#ec4899",
]

interface ConfettiParticlesProps {
  count?: number
}

export function ConfettiParticles({ count = 20 }: ConfettiParticlesProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 300,
        y: -(Math.random() * 200 + 50),
        rotation: Math.random() * 720 - 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 6 + 4,
        delay: Math.random() * 0.3,
      })),
    [count]
  )

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
