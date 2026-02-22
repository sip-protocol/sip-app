/**
 * Jupiter V6 API Client
 *
 * Thin wrapper around Jupiter's V6 REST API for fetching quotes
 * and building swap transactions. Supports stealth destination
 * accounts for SIP privacy-preserving swaps.
 */

const JUPITER_API_BASE = "https://quote-api.jup.ag/v6"

export interface JupiterQuoteResponse {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  priceImpactPct: string
  routePlan: Array<{
    swapInfo: {
      ammKey?: string
      label: string
      inputMint?: string
      outputMint?: string
      inAmount?: string
      outAmount?: string
      feeAmount?: string
      feeMint?: string
    }
    percent: number
  }>
}

export interface JupiterSwapResponse {
  swapTransaction: string
  lastValidBlockHeight: number
}

export interface GetQuoteParams {
  inputMint: string
  outputMint: string
  amount: string
  slippageBps: number
}

export interface GetSwapTransactionParams {
  quoteResponse: JupiterQuoteResponse
  userPublicKey: string
  destinationTokenAccount?: string
}

/**
 * Fetch a swap quote from Jupiter V6 API.
 *
 * @param params - Input/output mints, amount in smallest unit, slippage in basis points
 * @returns Parsed quote response with route plan and output amount
 * @throws Error if the API returns a non-ok response
 */
export async function getJupiterQuote(
  params: GetQuoteParams
): Promise<JupiterQuoteResponse> {
  const searchParams = new URLSearchParams({
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: params.amount,
    slippageBps: String(params.slippageBps),
  })

  const response = await fetch(
    `${JUPITER_API_BASE}/quote?${searchParams.toString()}`
  )

  if (!response.ok) {
    throw new Error("Failed to fetch Jupiter quote")
  }

  return response.json()
}

/**
 * Build a swap transaction via Jupiter V6 API.
 *
 * When `destinationTokenAccount` is provided, Jupiter routes the output
 * tokens directly to that account — used for SIP stealth ATAs so the
 * swap output lands in a privacy-preserving address.
 *
 * @param params - Quote response, user public key, optional stealth destination
 * @returns Serialized transaction (base64) and last valid block height
 * @throws Error if the API returns a non-ok response
 */
export async function getJupiterSwapTransaction(
  params: GetSwapTransactionParams
): Promise<JupiterSwapResponse> {
  const body: Record<string, unknown> = {
    quoteResponse: params.quoteResponse,
    userPublicKey: params.userPublicKey,
    wrapAndUnwrapSol: true,
    dynamicComputeUnitLimit: true,
    prioritizationFeeLamports: "auto",
  }

  if (params.destinationTokenAccount) {
    body.destinationTokenAccount = params.destinationTokenAccount
  }

  const response = await fetch(`${JUPITER_API_BASE}/swap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error("Failed to get swap transaction from Jupiter")
  }

  return response.json()
}
