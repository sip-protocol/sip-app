"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckIcon, XIcon } from "@phosphor-icons/react"

interface ActionToastProps {
  message: string
  type: "success" | "error"
  onClose: () => void
}

export function ActionToast({ message, type, onClose }: ActionToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const isSuccess = type === "success"

  return (
    <AnimatePresence>
      <motion.div
        role="status"
        aria-live="polite"
        className="fixed bottom-6 right-6 z-50 max-w-sm"
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.95 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm ${
            isSuccess
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-red-500/10 border-red-500/20"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              isSuccess ? "bg-emerald-500/20" : "bg-red-500/20"
            }`}
          >
            {isSuccess ? (
              <CheckIcon size={12} weight="bold" className="text-emerald-400" />
            ) : (
              <XIcon size={12} weight="bold" className="text-red-400" />
            )}
          </div>

          <p
            className={`text-sm font-medium ${
              isSuccess ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {message}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Dismiss notification"
          >
            <XIcon size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
