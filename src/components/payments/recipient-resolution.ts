/**
 * Types and pure helpers for the recipient resolution state machine.
 *
 * Kept separate so both RecipientInput (UI) and tests can import without
 * pulling in React or async logic.
 */

// ── Regex constants ───────────────────────────────────────────────────────────

/** SIP meta-address: sip:solana:<spend(base58)>:<view(base58)> */
export const SIP_ADDRESS_REGEX =
  /^sip:solana:[1-9A-HJ-NP-Za-km-z]{32,44}:[1-9A-HJ-NP-Za-km-z]{32,44}$/

/**
 * SNS domain: any number of labels (alphanumeric + hyphen) separated by dots,
 * ending in .sol (case-insensitive).
 */
export const SNS_DOMAIN_REGEX = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.sol$/i

// ── Resolution state tagged union ─────────────────────────────────────────────

/** The recipient input has been cleared. */
export type REmpty = { kind: "empty" }

/** A valid sip:solana:… URI — ready to send. */
export type RSipUri = { kind: "sip-uri"; uri: string }

/** A .sol domain is being resolved over the network. */
export type RSnsResolving = { kind: "sns-resolving"; domain: string }

/**
 * SIP-STEALTH record found for the domain — ready to send.
 * `uri` is the constructed sip:solana:… string.
 */
export type RSnsResolved = { kind: "sns-resolved"; domain: string; uri: string }

/**
 * Domain exists but has no SIP-STEALTH record.
 * Show warn-and-downgrade UX.
 */
export type RSnsNotFoundRecord = {
  kind: "sns-not-found-record"
  domain: string
}

/** Domain not registered on SNS. Red error. */
export type RSnsNotFoundDomain = {
  kind: "sns-not-found-domain"
  domain: string
}

/** Domain exists but the SIP-STEALTH record is malformed. Red error. */
export type RSnsMalformed = {
  kind: "sns-malformed"
  domain: string
  reason: string
}

/** Input matches neither a sip: URI nor a .sol domain. Red error. */
export type RInvalid = { kind: "invalid"; input: string }

export type RecipientResolution =
  | REmpty
  | RSipUri
  | RSnsResolving
  | RSnsResolved
  | RSnsNotFoundRecord
  | RSnsNotFoundDomain
  | RSnsMalformed
  | RInvalid

// ── Pure helpers ──────────────────────────────────────────────────────────────

/** Return true when the resolution represents a ready-to-send state. */
export function isReadyToSend(
  r: RecipientResolution
): r is RSipUri | RSnsResolved {
  return r.kind === "sip-uri" || r.kind === "sns-resolved"
}

/** Extract the target sip: URI from a ready resolution (or null). */
export function targetUri(r: RecipientResolution): string | null {
  if (r.kind === "sip-uri") return r.uri
  if (r.kind === "sns-resolved") return r.uri
  return null
}

/** Classify a raw input string into initial resolution state (no I/O). */
export function classifyInput(raw: string): RecipientResolution {
  const trimmed = raw.trim().replace(/\.$/, "") // strip trailing dot
  if (trimmed === "") return { kind: "empty" }
  if (SIP_ADDRESS_REGEX.test(trimmed)) return { kind: "sip-uri", uri: trimmed }
  if (SNS_DOMAIN_REGEX.test(trimmed))
    return { kind: "sns-resolving", domain: trimmed.toLowerCase() }
  return { kind: "invalid", input: trimmed }
}
