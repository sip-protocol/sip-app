"use client"

import { motion } from "framer-motion"

interface DeathRevivalCardProps {
  category: string
  whyItDied: string
  howWeRevive: string
  sponsor: string
  sponsorRole: string
  gradient: string
}

export function DeathRevivalCard({
  category,
  whyItDied,
  howWeRevive,
  sponsor,
  sponsorRole,
  gradient,
}: DeathRevivalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] overflow-hidden"
    >
      {/* Header */}
      <div className={`px-4 py-2 bg-gradient-to-r ${gradient} bg-opacity-20`}>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
          {category}
        </p>
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border-default)]">
        {/* Death side */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg" aria-hidden="true">
              {"\u{1F480}"}
            </span>
            <h3 className="text-sm font-semibold text-red-400">Why It Died</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {whyItDied}
          </p>
        </div>

        {/* Revival side */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg" aria-hidden="true">
              {"\u{1F331}"}
            </span>
            <h3 className="text-sm font-semibold text-emerald-400">
              How We Revive It
            </h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {howWeRevive}
          </p>
        </div>
      </div>

      {/* Sponsor footer */}
      <div className="px-4 py-2.5 border-t border-[var(--border-default)] bg-[var(--surface-primary)]">
        <p className="text-xs text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">
            Powered by {sponsor}
          </span>
          {" \u2014 "}
          {sponsorRole}
        </p>
      </div>
    </motion.div>
  )
}
