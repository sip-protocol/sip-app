import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  getJupiterQuote,
  getJupiterSwapTransaction,
  type JupiterQuoteResponse,
} from "@/lib/dex/jupiter-client"

const mockQuoteResponse: JupiterQuoteResponse = {
  inputMint: "So11111111111111111111111111111111111111112",
  outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  inAmount: "1000000000",
  outAmount: "23456789",
  priceImpactPct: "0.01",
  routePlan: [
    {
      swapInfo: {
        ammKey: "Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crLCEgFbof",
        label: "Raydium",
        inputMint: "So11111111111111111111111111111111111111112",
        outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        inAmount: "1000000000",
        outAmount: "23456789",
        feeAmount: "12345",
        feeMint: "So11111111111111111111111111111111111111112",
      },
      percent: 100,
    },
  ],
}

const mockSwapResponse = {
  swapTransaction: "base64EncodedTransaction...",
  lastValidBlockHeight: 123456789,
}

describe("getJupiterQuote", () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("fetches quote with correct URL params", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockQuoteResponse),
    })

    const result = await getJupiterQuote({
      inputMint: "So11111111111111111111111111111111111111112",
      outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      amount: "1000000000",
      slippageBps: 50,
    })

    expect(fetchSpy).toHaveBeenCalledOnce()
    const calledUrl = fetchSpy.mock.calls[0][0] as string
    expect(calledUrl).toContain("https://quote-api.jup.ag/v6/quote")
    expect(calledUrl).toContain("inputMint=So11111111111111111111111111111111111111112")
    expect(calledUrl).toContain("outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
    expect(calledUrl).toContain("amount=1000000000")
    expect(calledUrl).toContain("slippageBps=50")
    expect(result).toEqual(mockQuoteResponse)
  })

  it("throws on API error", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 400,
    })

    await expect(
      getJupiterQuote({
        inputMint: "So11111111111111111111111111111111111111112",
        outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        amount: "1000000000",
        slippageBps: 50,
      })
    ).rejects.toThrow("Failed to fetch Jupiter quote")
  })
})

describe("getJupiterSwapTransaction", () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("POSTs to swap endpoint with correct body", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSwapResponse),
    })

    const result = await getJupiterSwapTransaction({
      quoteResponse: mockQuoteResponse,
      userPublicKey: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    })

    expect(fetchSpy).toHaveBeenCalledOnce()
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://quote-api.jup.ag/v6/swap",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: mockQuoteResponse,
          userPublicKey: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: "auto",
        }),
      })
    )
    expect(result).toEqual(mockSwapResponse)
  })

  it("passes destinationTokenAccount when provided", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSwapResponse),
    })

    const stealthAta = "9xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgXYZ"

    await getJupiterSwapTransaction({
      quoteResponse: mockQuoteResponse,
      userPublicKey: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      destinationTokenAccount: stealthAta,
    })

    const calledBody = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(calledBody.destinationTokenAccount).toBe(stealthAta)
    expect(calledBody.quoteResponse).toEqual(mockQuoteResponse)
    expect(calledBody.userPublicKey).toBe("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU")
    expect(calledBody.wrapAndUnwrapSol).toBe(true)
    expect(calledBody.dynamicComputeUnitLimit).toBe(true)
    expect(calledBody.prioritizationFeeLamports).toBe("auto")
  })

  it("throws on API error", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    await expect(
      getJupiterSwapTransaction({
        quoteResponse: mockQuoteResponse,
        userPublicKey: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      })
    ).rejects.toThrow("Failed to get swap transaction from Jupiter")
  })
})
