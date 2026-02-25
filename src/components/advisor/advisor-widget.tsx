"use client"

import { ChatCircleIcon, XIcon } from "@phosphor-icons/react"
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
        <div className="mb-4 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[80vh] rounded-2xl shadow-2xl border border-[var(--border-default)] overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
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
          <XIcon size={24} className="text-white" />
        ) : (
          <ChatCircleIcon size={24} className="text-white" />
        )}
      </button>
    </div>
  )
}

