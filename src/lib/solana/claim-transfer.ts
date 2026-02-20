/**
 * Claim Transfer Module
 *
 * High-level claim flow for stealth transfers:
 * 1. Recover DKSAP shared secret via ECDH (spendingPrivate * ephemeralPub)
 * 2. Decrypt stealth seed from encrypted_amount field
 * 3. Reconstruct Keypair from seed, verify it matches stealth_recipient
 * 4. Build claim_transfer transaction with stealth Keypair as signer
 *
 * The caller must partialSign with the stealthSigner before wallet.sendTransaction.
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
} from "@solana/web3.js"
import { buildClaimTransferInstruction } from "@/lib/solana/program-client"
import { decryptStealthSeed } from "@/lib/solana/stealth-transfer"
import { sha256 } from "@noble/hashes/sha2.js"
import { sha512 } from "@noble/hashes/sha2.js"
import { bytesToHex, concatBytes } from "@noble/hashes/utils.js"
import { ed25519 } from "@noble/curves/ed25519.js"

export interface ClaimParams {
  /** TransferRecord PDA address (base58) */
  transferRecordPda: PublicKey
  /** Encrypted stealth seed from TransferRecord.encrypted_amount (48 bytes) */
  encryptedSeed: Uint8Array
  /** Ephemeral public key from TransferRecord (32 bytes, raw ed25519) */
  ephemeralPubkey: Uint8Array
  /** Expected stealth_recipient pubkey from TransferRecord */
  stealthRecipient: PublicKey
  /** Recipient's spending private key (hex, 0x-prefixed, 32-byte seed) */
  spendingPrivateKey: string
  /** Recipient's main wallet pubkey (receives the claimed SOL) */
  recipientPubkey: PublicKey
  /** Solana RPC URL */
  rpcUrl: string
}

export interface ClaimResult {
  /** Fully built transaction (needs partialSign + wallet send) */
  transaction: Transaction
  /** Stealth Keypair — must partialSign the transaction before sending */
  stealthSigner: Keypair
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16)
  }
  return bytes
}

// ed25519 curve order (L)
// 2^252 + 27742317777372353535851937790883648493
const ED25519_ORDER = BigInt(
  "7237005577332262213973186563042994240857116359379907606001950938285454250989"
)

/**
 * Get the ed25519 scalar from a 32-byte seed.
 *
 * Mirrors the SDK's getEd25519Scalar():
 * 1. SHA-512(seed) -> 64 bytes
 * 2. Take first 32 bytes, apply ed25519 clamping
 * 3. Interpret as little-endian scalar
 */
function getEd25519Scalar(seed: Uint8Array): bigint {
  const hash = sha512(seed)
  const scalar = hash.slice(0, 32)

  // Clamp per ed25519 spec
  scalar[0] &= 248
  scalar[31] &= 127
  scalar[31] |= 64

  // Little-endian to bigint
  let result = BigInt(0)
  for (let i = scalar.length - 1; i >= 0; i--) {
    result = (result << BigInt(8)) + BigInt(scalar[i])
  }
  return result
}

/**
 * Recover the DKSAP shared secret from spending private key and ephemeral public key.
 *
 * Computation: S = spending_scalar * ephemeral_point
 * sharedSecret = SHA-256(S.toBytes())
 *
 * This matches what the sender computed: S = ephemeral_scalar * spending_pubkey
 * Both are the same point on the curve (ECDH).
 */
export function recoverSharedSecret(
  spendingPrivateKey: string,
  ephemeralPubkey: Uint8Array
): Uint8Array {
  const spendingPrivBytes = hexToBytes(spendingPrivateKey)
  const rawScalar = getEd25519Scalar(spendingPrivBytes)
  const spendingScalar = rawScalar % ED25519_ORDER

  if (spendingScalar === BigInt(0)) {
    throw new Error("Invalid spending key: zero scalar")
  }

  const ephemeralPoint = ed25519.Point.fromHex(bytesToHex(ephemeralPubkey))
  const sharedSecretPoint = ephemeralPoint.multiply(spendingScalar)
  return sha256(sharedSecretPoint.toBytes())
}

/**
 * Build a claim transaction for a detected stealth payment.
 *
 * Flow:
 * 1. Recover shared secret via ECDH
 * 2. Decrypt stealth seed
 * 3. Reconstruct Keypair, verify pubkey matches stealthRecipient
 * 4. Build claim_transfer instruction
 * 5. Return transaction + stealthSigner for partialSign
 */
export async function buildClaimTransaction(
  params: ClaimParams
): Promise<ClaimResult> {
  const {
    transferRecordPda,
    encryptedSeed,
    ephemeralPubkey,
    stealthRecipient,
    spendingPrivateKey,
    recipientPubkey,
    rpcUrl,
  } = params

  // 1. Recover shared secret: S = spending_scalar * R
  const sharedSecret = recoverSharedSecret(spendingPrivateKey, ephemeralPubkey)

  // 2. Decrypt stealth seed
  const stealthSeed = decryptStealthSeed(encryptedSeed, sharedSecret)

  // 3. Reconstruct Keypair and verify
  const stealthKeypair = Keypair.fromSeed(stealthSeed)
  if (!stealthKeypair.publicKey.equals(stealthRecipient)) {
    throw new Error(
      `Stealth key mismatch: reconstructed ${stealthKeypair.publicKey.toBase58()} ` +
        `but expected ${stealthRecipient.toBase58()}`
    )
  }

  // 4. Compute nullifier: SHA-256(transferRecordPda || stealthSeed)
  const nullifier = sha256(
    concatBytes(transferRecordPda.toBytes(), stealthSeed)
  )

  // 5. Mock proof (128 bytes, deterministic)
  const proof = new Uint8Array(128)
  const proofSeed = sha256(nullifier)
  for (let i = 0; i < 128; i++) {
    proof[i] = proofSeed[i % 32]
  }

  // 6. Build instruction
  const ix = buildClaimTransferInstruction({
    transferRecordPda,
    stealthPubkey: stealthKeypair.publicKey,
    recipientPubkey,
    nullifier,
    proof,
  })

  // 7. Build transaction
  const connection = new Connection(rpcUrl, "confirmed")
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed")

  const tx = new Transaction({
    feePayer: recipientPubkey,
    blockhash,
    lastValidBlockHeight,
  })

  // Compute budget for claim_transfer
  tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }))
  tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }))
  tx.add(ix)

  return {
    transaction: tx,
    stealthSigner: stealthKeypair,
  }
}
