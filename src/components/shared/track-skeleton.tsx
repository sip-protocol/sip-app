export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-default)] animate-pulse">
          <div className="h-7 w-16 bg-gray-800 rounded mb-2" />
          <div className="h-4 w-24 bg-gray-800/60 rounded" />
        </div>
      ))}
    </div>
  )
}

export function CardListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-default)] animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <div className="h-5 w-3/4 bg-gray-800 rounded mb-2" />
              <div className="h-3 w-full bg-gray-800/60 rounded mb-1" />
              <div className="h-3 w-2/3 bg-gray-800/60 rounded" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-16 bg-gray-800/40 rounded" />
            <div className="h-6 w-20 bg-gray-800/40 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
