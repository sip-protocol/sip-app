"use client"

import { cn } from "@/lib/utils"
import { truncate } from "@/lib/utils"

export type TxStatus = "idle" | "pending" | "confirmed" | "error"

interface TransactionStatusProps {
  status: TxStatus
  txHash?: string
  error?: string
}

export function TransactionStatus({
  status,
  txHash,
  error,
}: TransactionStatusProps) {
  if (status === "idle") return null

  return (
    <div
      className={cn(
        "mt-6 p-4 rounded-xl border",
        status === "pending" &&
          "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
        status === "confirmed" &&
          "bg-sip-green-50 border-sip-green-200 dark:bg-sip-green-900/20 dark:border-sip-green-800",
        status === "error" &&
          "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">
          {status === "pending" && "⏳"}
          {status === "confirmed" && "✅"}
          {status === "error" && "❌"}
        </span>
        <div className="flex-1">
          <p
            className={cn(
              "font-medium",
              status === "pending" && "text-blue-900 dark:text-blue-100",
              status === "confirmed" &&
                "text-sip-green-900 dark:text-sip-green-100",
              status === "error" && "text-red-900 dark:text-red-100"
            )}
          >
            {status === "pending" && "Transaction Pending..."}
            {status === "confirmed" && "Transaction Confirmed!"}
            {status === "error" && "Transaction Failed"}
          </p>
          {txHash && status === "confirmed" && (
            <a
              href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-sip-purple-600 hover:underline mt-1 inline-block"
            >
              View on Explorer: {truncate(txHash, 8, 8)}
            </a>
          )}
          {error && status === "error" && (
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
