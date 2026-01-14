"use client"

import { useEffect, useRef } from "react"
import { useAdvisor } from "@/hooks/use-advisor"
import { AdvisorMessageBubble } from "./advisor-message"
import { AdvisorInput } from "./advisor-input"
import { cn } from "@/lib/utils"

interface AdvisorChatProps {
  className?: string
}

export function AdvisorChat({ className }: AdvisorChatProps) {
  const { messages, isLoading, sendMessage, clearHistory } = useAdvisor()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-[var(--surface-primary)]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sip-purple-500 to-sip-purple-700 flex items-center justify-center">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Privacy Advisor
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              {isLoading ? "Thinking..." : "Online"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={clearHistory}
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          title="Clear chat history"
        >
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <AdvisorMessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--surface-secondary)] rounded-2xl px-4 py-3">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <AdvisorInput onSend={sendMessage} disabled={isLoading} />
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <span
        className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  )
}
