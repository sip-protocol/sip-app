import type { Connection } from "@solana/web3.js"

interface ConfirmResult {
  confirmed: boolean
  error?: string
}

export async function confirmTransactionWithRetry(
  connection: Connection,
  signature: string,
  options: { timeoutMs?: number } = {}
): Promise<ConfirmResult> {
  const { timeoutMs = 30_000 } = options

  try {
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed")

    const result = await Promise.race([
      connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      ),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Confirmation timeout")), timeoutMs)
      ),
    ])

    if (result.value.err) {
      return { confirmed: false, error: JSON.stringify(result.value.err) }
    }

    return { confirmed: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return {
      confirmed: false,
      error: msg.includes("timeout") ? "timeout" : msg,
    }
  }
}
