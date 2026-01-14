/**
 * Privacy Advisor API Route
 *
 * POST /api/advisor - Send a message to the privacy advisor
 */

import { NextRequest, NextResponse } from "next/server"
import {
  getAdvisor,
  AdvisorMessage,
  AdvisorContext,
  registerAdvisorProvider,
} from "@/lib/advisor"
import { LangChainAdvisor } from "@/lib/advisor/langchain-advisor"

// Register LangChain provider if API key is available
if (process.env.OPENAI_API_KEY) {
  registerAdvisorProvider(
    "langchain",
    () => new LangChainAdvisor(process.env.OPENAI_API_KEY!)
  )
}

/** Request body schema */
interface AdvisorRequest {
  messages: AdvisorMessage[]
  context?: AdvisorContext
  provider?: "mock" | "langchain"
}

/** Validate request body */
function validateRequest(body: unknown): body is AdvisorRequest {
  if (!body || typeof body !== "object") return false

  const req = body as AdvisorRequest

  if (!Array.isArray(req.messages)) return false
  if (req.messages.length === 0) return false

  // Validate each message has required fields
  for (const msg of req.messages) {
    if (!msg.id || !msg.role || !msg.content) return false
    if (!["user", "advisor", "system"].includes(msg.role)) return false
  }

  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!validateRequest(body)) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details:
            "Request must include messages array with valid message objects",
        },
        { status: 400 }
      )
    }

    // Determine which provider to use
    const providerName =
      body.provider || (process.env.OPENAI_API_KEY ? "langchain" : "mock")

    // Get the advisor
    const advisor = getAdvisor(providerName)

    // Convert timestamps from JSON
    const messages = body.messages.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }))

    // Get response from advisor
    const response = await advisor.chat(messages, body.context)

    return NextResponse.json({
      success: true,
      provider: advisor.name,
      message: response.message,
      recommendations: response.recommendations,
      suggestedActions: response.suggestedActions,
    })
  } catch (error) {
    console.error("Advisor API error:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/** Health check */
export async function GET() {
  const hasOpenAI = !!process.env.OPENAI_API_KEY

  return NextResponse.json({
    status: "ok",
    providers: {
      mock: true,
      langchain: hasOpenAI,
    },
    defaultProvider: hasOpenAI ? "langchain" : "mock",
  })
}
