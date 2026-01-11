import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Payment History",
  description: "View your private payment transaction history.",
}

export default function PaymentHistoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">History</h1>
          <p className="text-[var(--text-secondary)]">
            Your private payment transaction history
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            Export
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["All", "Sent", "Received", "Pending"].map((filter, i) => (
          <button
            key={filter}
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
              i === 0
                ? "bg-sip-purple-600 text-white"
                : "bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center">
          <span className="text-3xl">📜</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">No transactions yet</h2>
        <p className="text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
          Your private payment history will appear here once you send or receive
          payments.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="/payments/send"
            className="px-6 py-3 text-sm font-medium rounded-xl bg-sip-purple-600 text-white hover:bg-sip-purple-700 transition-colors"
          >
            Send Payment
          </a>
          <a
            href="/payments/receive"
            className="px-6 py-3 text-sm font-medium rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            Receive Payment
          </a>
        </div>
      </div>

      {/* Transaction List Preview (for when there are transactions) */}
      {/*
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-2xl divide-y divide-[var(--border-default)]">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-4 hover:bg-[var(--surface-secondary)] transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'sent' ? 'bg-red-100' : 'bg-green-100'}`}>
                  {tx.type === 'sent' ? '↗️' : '↘️'}
                </div>
                <div>
                  <p className="font-medium">{tx.type === 'sent' ? 'Sent' : 'Received'}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${tx.type === 'sent' ? 'text-red-500' : 'text-green-500'}`}>
                  {tx.type === 'sent' ? '-' : '+'}{tx.amount} SOL
                </p>
                <p className="text-sm text-[var(--text-secondary)]">{tx.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      */}
    </div>
  )
}
