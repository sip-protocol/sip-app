# Dependency Security Audit

**Scope:** GitHub Dependabot alerts on `sip-protocol/sip-app` (single root `pnpm-lock.yaml`)
**Date:** 2026-06-12
**Method:** Per-alert triage — advisory analysis (`gh api /advisories/<GHSA>`), consumer-chain mapping (`pnpm why`), and vulnerable-code-path reachability review. Fixes applied via scoped `pnpm.overrides` capped to the same major; cross-major bumps are never forced blind.

## Summary

58 open alerts triaged: **46 fixed** via scoped overrides (+1 direct devDependency), **12 recommended for dismissal** with reachability evidence below.

| Disposition | Alerts |
|---|---|
| Fixed via override | axios x23, protobufjs 7.x part of x9, langsmith x4, vite x3, lodash x2, lodash-es x2, file-type #22, zod #24, @babel/runtime #28, bn.js #37, minimatch #42, flatted #60, follow-redirects #82, brace-expansion #111, postcss #112, qs #143, tmp #144, ws #145 |
| Recommend dismiss (`not_used`) | crypto-js #38, uuid #142, file-type #43, protobufjs #85/#131–137/#141 (residual 6.11.6 instance) |

---

## Dismissal Recommendations

### #38 — crypto-js (CRITICAL, GHSA-xwcq-pm8m-c4vf)

**Advisory:** crypto-js PBKDF2 defaults are ~1,000x weaker than the 1993 spec (SHA1, 1 iteration). The vulnerable surface is the `PBKDF2` function specifically.

**Instance:** `crypto-js@3.3.0`
**Consumer chain:** `merkletreejs@0.2.32` (declares `crypto-js: ^3.1.9-1`) ← `@metaplex-foundation/js@0.18.3` ← `@sunrisestake/client@0.1.16` ← sip-app

**Verdict: vulnerable code not used.**
- `merkletreejs@0.2.32/dist/*.js` imports only `crypto-js` and `crypto-js/sha256`; **zero `PBKDF2` references** (grep across the published dist).
- merkletreejs uses crypto-js exclusively for hash functions (SHA256) in Merkle tree construction — no key derivation anywhere on the path.
- The patched `crypto-js@4.2.0` is already in the tree for all other consumers (`@particle-network/crypto`, `merkletreejs@0.3.11`).
- A forced 3.x → 4.x override would be a cross-major bump against the consumer's declared `^3.1.9-1` range and is not justified by an unreachable code path.

### #142 — uuid (MEDIUM, GHSA-w5hq-g745-h8pq)

**Advisory:** `v3()`, `v5()`, `v6()` API methods perform silent out-of-bounds writes **only when the caller passes an external output `buf`**. `v4()`, `v1()`, `v7()` correctly throw `RangeError`.

**Instances:** `uuid@8.3.2`, `uuid@9.0.1`, `uuid@10.0.0` (also `uuid@14.0.0`, which is outside the vulnerable range)

**Consumer call-site audit (published dist code):**
| Consumer | uuid version | API used |
|---|---|---|
| `@keystonehq/bc-ur-registry-sol@0.9.5` (Keystone wallet adapter) | 8.3.2 | `uuid.parse()` only |
| `@solflare-wallet/sdk@1.4.2` (Solflare wallet adapter) | 9.0.1 | `v4()` only |
| `@langchain/core@0.3.80` (via @sip-protocol/sdk) | 10.0.0 | `v4()` only (6 call sites) |

**Verdict: vulnerable code not used.** No consumer calls `v3`/`v5`/`v6` at all, let alone with a caller-provided buffer. A forced cross-major override to 11.1.1 against consumers declaring `^8`/`^9`/`^10` is not justified.

### #43 — file-type (MEDIUM, GHSA-5v7r-6r5c-r473)

**Advisory:** Infinite loop in the ASF (WMV/WMA) parser when a crafted file has a zero-size sub-header. Affects applications that run file-type detection on untrusted input. Patched in 21.3.1 (cross-major from the consumer's pin).

**Instance:** `file-type@16.5.4` (after this PR — #22, the HIGH ReDoS in the same package, is fixed by overriding 16.5.3 → 16.5.4 within the consumer's major)
**Consumer chain:** `@audius/sdk@13.0.1` (declares `file-type: 16.5.3` exact) ← sip-app

**Verdict: vulnerable code not invoked by this application.**
- `@audius/sdk` invokes file-type on its **upload** paths (MIME sniffing of files being uploaded).
- sip-app's only Audius usage is read-only (`src/lib/music/audius-reader.ts`): `tracks.getTrendingTracks`, `tracks.getTrack`, `tracks.searchTracks`. No upload API is called anywhere in the app, so the ASF parser never receives input — trusted or otherwise.
- `file-type >= 17` is ESM-only; forcing it under @audius/sdk's CJS dist is a breaking cross-major change. Revisit if/when @audius/sdk ships a release on file-type ≥ 21.3.1.

### #85, #131–137, #141 — protobufjs residual 6.11.6 instance (CRITICAL #85; the rest HIGH/MEDIUM)

**Advisories (all 9):** arbitrary code execution via crafted JSON descriptors (GHSA-xq3m-2v4x-88gg), prototype pollution/code-generation gadgets, unbounded recursion in `Root.fromJSON()`/`Namespace.addJSON()`, unsafe option paths, code injection via generated `toObject` bytes defaults, overlong UTF-8 decoding. All target the **schema-loading / reflection / runtime-codegen** surface (`parse`, `load`, `Root.fromJSON`, reflection-generated message code) — plus one decode-path issue (overlong UTF-8) that requires **string fields**.

**State after this PR:** the 7.x instances (`7.4.0`, `7.5.5` via `@trezor/protobuf`) are overridden to `>=7.5.8 <8` (resolved: 7.6.2), which satisfies every patched range. The alerts continue to match only `protobufjs@6.11.6`.

**Residual instance:** `protobufjs@6.11.6`
**Consumer chain:** `@confio/ics23@0.6.8` (declares `protobufjs: ^6.8.8`) ← `@cosmjs/stargate@0.32.4` ← `@wormhole-foundation/sdk-cosmwasm@1.0.3` ← `@wormhole-foundation/sdk@1.0.3` ← `@audius/sdk@13.0.1` ← sip-app

**Verdict: vulnerable code not used.**
- `@confio/ics23`'s only protobufjs usage is `build/generated/codecimpl.js`, which is **static pbjs-generated code** importing `require("protobufjs/minimal")` — the minimal runtime only (Reader/Writer).
- Zero calls to `fromJSON`/`parse`/`load`/`loadSync` anywhere in the published build (the lone grep hit is `testvectors.spec.js`, a test file that is never imported by consumers).
- Zero `reader.string()` calls in the generated decoders (ics23 proof messages contain only bytes/varint fields), so the overlong-UTF-8 decode advisory is unreachable as well.
- protobufjs 6.x has no patched release (line is EOL); the only "fix" would be forcing 6.11.6 → 7.x against `@confio/ics23`'s declared `^6.8.8` — a blind cross-major bump into the cosmjs proto stack, declined per policy.

---

## Fix Details (override block)

All overrides in root `package.json` → `pnpm.overrides`, version-range-scoped so safe majors elsewhere in the tree are never forced (e.g. `ws@7.5.11`, `brace-expansion@5.0.6`, `minimatch@10.2.5`, `zod@4.x`, `uuid@14` are untouched).

Notes on non-obvious entries:
- `axios@<1` → `>=1.16.0 <2`: continues this repo's pre-existing decision to lift legacy `axios@0.x` declarations (`@audius/sdk` declares `0.19.2`) onto the 1.x line; previously the value was an unbounded `>=0.30.3`, which had let the resolution sit on a vulnerable 1.13.5.
- `vite` is additionally declared as a direct devDependency (`^7.3.2`): vitest 4 declares vite as a **non-optional peerDependency**, and pnpm overrides do not rewrite peer ranges — the auto-installed peer kept resolving to 7.3.1. Providing the peer from the root is the reliable fix.
- `langsmith@<0.6.0` → `>=0.6.0 <0.7`: `@langchain/core@0.3.80` declares `^0.3.67`; 0.6.3 exports every subpath core imports (`.`, `./run_trees`, `./schemas`, `./singletons/traceable`) and `langchain@1.4.4` itself declares `langsmith@>=0.5.0 <1.0.0`, so the deduped 0.6.3 resolution is in-range for every dependent. LangSmith tracing is additionally inert in this app (no `LANGSMITH_API_KEY`/tracing env configured) and the `pullPrompt` surface (HIGH advisory #139) is never called.
- `protobufjs@>=7 <7.5.8` → `>=7.5.8 <8`: scoped to the 7.x line so the 6.11.6 instance (see dismissal above) is not cross-major-forced.

## Verification

- `pnpm typecheck` — clean (baseline: clean)
- `pnpm test -- --run` — 131 files / 1275 tests passed (baseline: 131 / 1275)
- `pnpm build` (`next build --webpack`) — succeeds (baseline: succeeds)
- Lockfile greps confirm every override target resolves at/above its patched version and every intentionally-preserved version (out-of-range majors, dismissal candidates) is unchanged.
