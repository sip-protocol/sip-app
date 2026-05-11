import { describe, it, expect } from "vitest"
import {
  classifyInput,
  isReadyToSend,
  targetUri,
  SIP_ADDRESS_REGEX,
  SNS_DOMAIN_REGEX,
  type RecipientResolution,
} from "@/components/payments/recipient-resolution"

// ── fixture helpers ────────────────────────────────────────────────────────────

const VALID_SIP =
  "sip:solana:CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB:7x3Fh9wKLmPQrYvNJeS5tWXB2kZdGcA4np8Hu1VfRz6E"

// ── SIP_ADDRESS_REGEX ─────────────────────────────────────────────────────────

describe("SIP_ADDRESS_REGEX", () => {
  it("matches a valid sip:solana URI", () => {
    expect(SIP_ADDRESS_REGEX.test(VALID_SIP)).toBe(true)
  })

  it("rejects sip:ethereum URIs", () => {
    expect(
      SIP_ADDRESS_REGEX.test(
        "sip:ethereum:CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB:7x3Fh9wKLmPQrYvNJeS5tWXB2kZdGcA4np8Hu1VfRz6E",
      ),
    ).toBe(false)
  })

  it("rejects URIs with missing viewing key", () => {
    expect(
      SIP_ADDRESS_REGEX.test(
        "sip:solana:CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB",
      ),
    ).toBe(false)
  })

  it("rejects empty string", () => {
    expect(SIP_ADDRESS_REGEX.test("")).toBe(false)
  })

  it("rejects plain Solana address", () => {
    expect(
      SIP_ADDRESS_REGEX.test("CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB"),
    ).toBe(false)
  })
})

// ── SNS_DOMAIN_REGEX ──────────────────────────────────────────────────────────

describe("SNS_DOMAIN_REGEX", () => {
  it("matches simple .sol domain", () => {
    expect(SNS_DOMAIN_REGEX.test("alice.sol")).toBe(true)
  })

  it("matches subdomain .sol", () => {
    expect(SNS_DOMAIN_REGEX.test("pay.alice.sol")).toBe(true)
  })

  it("matches uppercase (case-insensitive flag)", () => {
    expect(SNS_DOMAIN_REGEX.test("ALICE.SOL")).toBe(true)
  })

  it("matches hyphenated domain", () => {
    expect(SNS_DOMAIN_REGEX.test("my-wallet.sol")).toBe(true)
  })

  it("rejects domain without .sol suffix", () => {
    expect(SNS_DOMAIN_REGEX.test("alice.eth")).toBe(false)
  })

  it("rejects bare .sol", () => {
    expect(SNS_DOMAIN_REGEX.test(".sol")).toBe(false)
  })

  it("rejects domain with trailing dot (before trim)", () => {
    // classifyInput strips trailing dot; regex itself rejects it
    expect(SNS_DOMAIN_REGEX.test("alice.sol.")).toBe(false)
  })
})

// ── classifyInput ─────────────────────────────────────────────────────────────

describe("classifyInput", () => {
  it("returns empty for blank string", () => {
    expect(classifyInput("")).toStrictEqual({ kind: "empty" })
  })

  it("returns empty for whitespace-only string", () => {
    expect(classifyInput("   ")).toStrictEqual({ kind: "empty" })
  })

  it("returns sip-uri for a valid sip:solana URI", () => {
    expect(classifyInput(VALID_SIP)).toStrictEqual({
      kind: "sip-uri",
      uri: VALID_SIP,
    })
  })

  it("trims whitespace before classifying sip URI", () => {
    expect(classifyInput(`  ${VALID_SIP}  `)).toStrictEqual({
      kind: "sip-uri",
      uri: VALID_SIP,
    })
  })

  it("returns sns-resolving for alice.sol", () => {
    expect(classifyInput("alice.sol")).toStrictEqual({
      kind: "sns-resolving",
      domain: "alice.sol",
    })
  })

  it("lowercases the domain in sns-resolving", () => {
    expect(classifyInput("ALICE.SOL")).toStrictEqual({
      kind: "sns-resolving",
      domain: "alice.sol",
    })
  })

  it("strips trailing dot from domain", () => {
    expect(classifyInput("alice.sol.")).toStrictEqual({
      kind: "sns-resolving",
      domain: "alice.sol",
    })
  })

  it("returns invalid for a bare Solana address", () => {
    const r = classifyInput("CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB")
    expect(r.kind).toBe("invalid")
  })

  it("returns invalid for random text", () => {
    const r = classifyInput("hello world")
    expect(r.kind).toBe("invalid")
  })

  it("returns invalid for sip:ethereum URI", () => {
    const r = classifyInput(
      "sip:ethereum:CVDFLCAjXhVWiPXH9nTCTpCgVzmDVoiPzNJYuccr1dqB:7x3Fh9wKLmPQrYvNJeS5tWXB2kZdGcA4np8Hu1VfRz6E",
    )
    expect(r.kind).toBe("invalid")
  })
})

// ── isReadyToSend ─────────────────────────────────────────────────────────────

describe("isReadyToSend", () => {
  const readyCases: RecipientResolution[] = [
    { kind: "sip-uri", uri: VALID_SIP },
    { kind: "sns-resolved", domain: "alice.sol", uri: VALID_SIP },
  ]

  const notReadyCases: RecipientResolution[] = [
    { kind: "empty" },
    { kind: "sns-resolving", domain: "alice.sol" },
    { kind: "sns-not-found-record", domain: "alice.sol" },
    { kind: "sns-not-found-domain", domain: "alice.sol" },
    { kind: "sns-malformed", domain: "alice.sol", reason: "json-parse" },
    { kind: "invalid", input: "garbage" },
  ]

  for (const r of readyCases) {
    it(`returns true for kind="${r.kind}"`, () => {
      expect(isReadyToSend(r)).toBe(true)
    })
  }

  for (const r of notReadyCases) {
    it(`returns false for kind="${r.kind}"`, () => {
      expect(isReadyToSend(r)).toBe(false)
    })
  }
})

// ── targetUri ─────────────────────────────────────────────────────────────────

describe("targetUri", () => {
  it("returns uri from sip-uri resolution", () => {
    expect(
      targetUri({ kind: "sip-uri", uri: VALID_SIP }),
    ).toBe(VALID_SIP)
  })

  it("returns uri from sns-resolved resolution", () => {
    expect(
      targetUri({ kind: "sns-resolved", domain: "alice.sol", uri: VALID_SIP }),
    ).toBe(VALID_SIP)
  })

  it("returns null for non-ready states", () => {
    expect(targetUri({ kind: "empty" })).toBeNull()
    expect(targetUri({ kind: "sns-resolving", domain: "alice.sol" })).toBeNull()
    expect(targetUri({ kind: "sns-not-found-record", domain: "alice.sol" })).toBeNull()
    expect(targetUri({ kind: "invalid", input: "garbage" })).toBeNull()
  })
})
