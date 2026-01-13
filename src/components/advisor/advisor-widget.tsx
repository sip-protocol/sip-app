"use client"

import { useAdvisorOpen } from "@/hooks/use-advisor"
import { AdvisorChat } from "./advisor-chat"
import { cn } from "@/lib/utils"

interface AdvisorWidgetProps {
  className?: string
}

export function AdvisorWidget({ className }: AdvisorWidgetProps) {
  const { isOpen, toggleOpen } = useAdvisorOpen()

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      {/* Chat Panel */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[520px] rounded-2xl shadow-2xl border border-[var(--border-default)] overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          <AdvisorChat />
        </div>
      )}

      {/* Toggle Button */}
      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg transition-all duration-200",
          "flex items-center justify-center",
          "bg-gradient-to-br from-sip-purple-500 to-sip-purple-700",
          "hover:scale-105 hover:shadow-xl",
          "focus:outline-none focus:ring-2 focus:ring-sip-purple-500/50"
        )}
        aria-label={isOpen ? "Close privacy advisor" : "Open privacy advisor"}
      >
        {isOpen ? (
          <CloseIcon className="w-6 h-6 text-white" />
        ) : (
          <ChatIcon className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  )
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}
