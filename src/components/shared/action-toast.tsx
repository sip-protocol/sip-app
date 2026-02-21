"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

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
              <svg
                className="w-3 h-3 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            ) : (
              <svg
                className="w-3 h-3 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
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
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
