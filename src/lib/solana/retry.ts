const NON_RETRYABLE = [
  "User rejected",
  "user rejected",
  "User cancelled",
  "Transaction cancelled",
  "Wallet not connected",
  "insufficient funds",
  "Insufficient balance",
]

interface RetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  onRetry?: (attempt: number, delayMs: number, error: Error) => void
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 1000, onRetry } = options
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (NON_RETRYABLE.some((msg) => lastError!.message.includes(msg))) {
        throw lastError
      }

      if (attempt < maxRetries) {
        const delay =
          baseDelayMs * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5)
        onRetry?.(attempt + 1, delay, lastError)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}
