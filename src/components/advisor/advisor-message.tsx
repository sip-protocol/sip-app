"use client"

import { cn } from "@/lib/utils"
import { AdvisorMessage } from "@/lib/advisor"
import ReactMarkdown from "react-markdown"

interface AdvisorMessageProps {
  message: AdvisorMessage
}

export function AdvisorMessageBubble({ message }: AdvisorMessageProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-sip-purple-600 text-white"
            : "bg-[var(--surface-secondary)] text-[var(--text-primary)]"
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-2 prose-strong:text-sip-purple-600">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        <div
          className={cn(
            "text-xs mt-1",
            isUser ? "text-white/70" : "text-[var(--text-tertiary)]"
          )}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  )
}

function formatTime(date: Date): string {
  const d = new Date(date)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}
