/**
 * SIP Privacy Program Client
 *
 * Builds instructions for the SIP Privacy Anchor program on Solana.
 * Used by commitment-store.ts (verify_commitment) and stealth-transfer.ts (shielded_transfer).
 *
 * Program: S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at
 * Deployed: Mainnet-beta + Devnet
 *
 * NOTE: Uses Uint8Array + DataView instead of Buffer methods for browser compatibility.
 * The browser Buffer polyfill does not support writeBigUInt64LE/writeUInt32LE.
 */

import {
  Connection,
  PublicKey,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js"

// ─────────────────────────────────────────────────────────────────────────────
// Program Constants
// ─────────────────────────────────────────────────────────────────────────────

export const SIP_PROGRAM_ID = new PublicKey(
  "S1PMFspo4W6BYKHWkHNF7kZ3fnqibEXg3LQjxepS9at"
)

export const CONFIG_PDA = new PublicKey(
  "BVawZkppFewygA5nxdrLma4ThKx8Th7bW4KTCkcWTZwZ"
)

export const FEE_COLLECTOR = new PublicKey(
  "S1P6j1yeTm6zkewQVeihrTZvmfoHABRkHDhabWTuWMd"
)

const TRANSFER_RECORD_SEED = new TextEncoder().encode("transfer_record")

// Discriminators from IDL (sha256("global:<instruction_name>")[0..8])
const VERIFY_COMMITMENT_DISC = new Uint8Array([
  0xae, 0x7c, 0x0e, 0x39, 0x3c, 0x50, 0xc4, 0x92,
])

const SHIELDED_TRANSFER_DISC = new Uint8Array([
  0xbf, 0x82, 0x05, 0x7f, 0x7c, 0xbb, 0xee, 0xbc,
])

// sha256("global:claim_transfer")[0..8]
const CLAIM_TRANSFER_DISC = new Uint8Array([
  0xca, 0xb2, 0x3a, 0xbe, 0xe6, 0xea, 0xe5, 0x11,
])

const NULLIFIER_SEED = new TextEncoder().encode("nullifier")

// ─────────────────────────────────────────────────────────────────────────────
// Binary helpers (browser-safe — no Buffer methods)
// ─────────────────────────────────────────────────────────────────────────────

function writeU64LE(buf: Uint8Array, value: bigint, offset: number): void {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  view.setBigUint64(offset, value, true)
}

function readU64LE(buf: Uint8Array, offset: number): bigint {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  return view.getBigUint64(offset, true)
}

function writeU32LE(buf: Uint8Array, value: number, offset: number): void {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  view.setUint32(offset, value, true)
}

function bigintToLeBytes(value: bigint): Uint8Array {
  const buf = new Uint8Array(8)
  writeU64LE(buf, value, 0)
  return buf
}

// ─────────────────────────────────────────────────────────────────────────────
// verify_commitment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a verify_commitment instruction for the SIP program.
 *
 * Accounts: [payer (signer)]
 * Args: commitment [u8; 33], value u64, blinding [u8; 32]
 *
 * Emits CommitmentVerifiedEvent on success.
 */
export function buildVerifyCommitmentInstruction(params: {
  payer: PublicKey
  /** 33-byte compressed secp256k1 point */
  commitment: Uint8Array
  /** Committed value as u64 */
  value: bigint
  /** 32-byte blinding factor */
  blinding: Uint8Array
}): TransactionInstruction {
  const { payer, commitment, value, blinding } = params

  if (commitment.length !== 33) {
    throw new Error(`commitment must be 33 bytes, got ${commitment.length}`)
  }
  if (blinding.length !== 32) {
    throw new Error(`blinding must be 32 bytes, got ${blinding.length}`)
  }

  // Instruction data: discriminator (8) + commitment (33) + value (8) + blinding (32) = 81 bytes
  const data = new Uint8Array(81)
  let offset = 0

  data.set(VERIFY_COMMITMENT_DISC, offset)
  offset += 8

  data.set(commitment, offset)
  offset += 33

  writeU64LE(data, value, offset)
  offset += 8

  data.set(blinding, offset)

  return new TransactionInstruction({
    keys: [{ pubkey: payer, isSigner: true, isWritable: false }],
    programId: SIP_PROGRAM_ID,
    data: Buffer.from(data),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// shielded_transfer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a shielded_transfer instruction for the SIP program.
 *
 * Accounts: [config (PDA), transfer_record (PDA), sender (signer+writable),
 *            stealth_account (writable), fee_collector (writable), system_program]
 * Args: amount_commitment, stealth_pubkey, ephemeral_pubkey, viewing_key_hash,
 *        encrypted_amount, proof, actual_amount
 */
export async function buildShieldedTransferInstruction(params: {
  connection: Connection
  sender: PublicKey
  /** 33-byte Pedersen commitment */
  amountCommitment: Uint8Array
  /** Stealth address recipient */
  stealthPubkey: PublicKey
  /** 33-byte ephemeral public key */
  ephemeralPubkey: Uint8Array
  /** 32-byte viewing key hash */
  viewingKeyHash: Uint8Array
  /** Encrypted amount bytes */
  encryptedAmount: Uint8Array
  /** ZK proof bytes */
  proof: Uint8Array
  /** Actual amount in lamports */
  actualAmount: bigint
}): Promise<TransactionInstruction> {
  const {
    connection,
    sender,
    amountCommitment,
    stealthPubkey,
    ephemeralPubkey,
    viewingKeyHash,
    encryptedAmount,
    proof,
    actualAmount,
  } = params

  if (amountCommitment.length !== 33) {
    throw new Error(
      `amountCommitment must be 33 bytes, got ${amountCommitment.length}`
    )
  }
  if (ephemeralPubkey.length !== 33) {
    throw new Error(
      `ephemeralPubkey must be 33 bytes, got ${ephemeralPubkey.length}`
    )
  }
  if (viewingKeyHash.length !== 32) {
    throw new Error(
      `viewingKeyHash must be 32 bytes, got ${viewingKeyHash.length}`
    )
  }

  // Fetch config to get total_transfers for PDA derivation
  const configAccount = await connection.getAccountInfo(CONFIG_PDA)
  if (!configAccount) {
    throw new Error("SIP Privacy program not initialized on this network")
  }

  // Parse total_transfers from config (offset: 8 discriminator + 32 authority + 2 fee_bps + 1 paused = 43)
  const totalTransfers = readU64LE(configAccount.data, 43)

  // Derive transfer record PDA
  const [transferRecordPda] = PublicKey.findProgramAddressSync(
    [
      TRANSFER_RECORD_SEED,
      sender.toBuffer(),
      bigintToLeBytes(totalTransfers),
    ],
    SIP_PROGRAM_ID
  )

  // Build instruction data
  const size =
    8 + // discriminator
    33 + // amount_commitment
    32 + // stealth_pubkey (Pubkey)
    33 + // ephemeral_pubkey
    32 + // viewing_key_hash
    4 +
    encryptedAmount.length + // encrypted_amount Vec<u8>
    4 +
    proof.length + // proof Vec<u8>
    8 // actual_amount u64

  const data = new Uint8Array(size)
  let offset = 0

  data.set(SHIELDED_TRANSFER_DISC, offset)
  offset += 8

  data.set(amountCommitment, offset)
  offset += 33

  data.set(stealthPubkey.toBuffer(), offset)
  offset += 32

  data.set(ephemeralPubkey, offset)
  offset += 33

  data.set(viewingKeyHash, offset)
  offset += 32

  writeU32LE(data, encryptedAmount.length, offset)
  offset += 4
  data.set(encryptedAmount, offset)
  offset += encryptedAmount.length

  writeU32LE(data, proof.length, offset)
  offset += 4
  data.set(proof, offset)
  offset += proof.length

  writeU64LE(data, actualAmount, offset)

  return new TransactionInstruction({
    keys: [
      { pubkey: CONFIG_PDA, isSigner: false, isWritable: true },
      { pubkey: transferRecordPda, isSigner: false, isWritable: true },
      { pubkey: sender, isSigner: true, isWritable: true },
      { pubkey: stealthPubkey, isSigner: false, isWritable: true },
      { pubkey: FEE_COLLECTOR, isSigner: false, isWritable: true },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: SIP_PROGRAM_ID,
    data: Buffer.from(data),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// claim_transfer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a claim_transfer instruction for the SIP program.
 *
 * Accounts: [config (PDA), transfer_record (mut), nullifier_record (init),
 *            stealth_account (signer+mut), recipient (signer+mut+payer), system_program]
 * Args: nullifier [u8; 32], proof Vec<u8>
 *
 * The stealth_account must sign (proves ownership of stealth private key).
 * The recipient is the main wallet that receives the drained SOL.
 */
export function buildClaimTransferInstruction(params: {
  /** TransferRecord PDA address */
  transferRecordPda: PublicKey
  /** Stealth account public key (must be signer) */
  stealthPubkey: PublicKey
  /** Recipient's main wallet (receives funds, pays for nullifier PDA) */
  recipientPubkey: PublicKey
  /** 32-byte nullifier = SHA-256(transferRecordPda || stealthSeed) */
  nullifier: Uint8Array
  /** ZK proof bytes (mock: 128 bytes) */
  proof: Uint8Array
}): TransactionInstruction {
  const {
    transferRecordPda,
    stealthPubkey,
    recipientPubkey,
    nullifier,
    proof,
  } = params

  if (nullifier.length !== 32) {
    throw new Error(`nullifier must be 32 bytes, got ${nullifier.length}`)
  }

  // Derive nullifier PDA
  const [nullifierRecordPda] = PublicKey.findProgramAddressSync(
    [NULLIFIER_SEED, nullifier],
    SIP_PROGRAM_ID
  )

  // Instruction data: discriminator (8) + nullifier (32) + proof Vec (4 + proof.length)
  const size = 8 + 32 + 4 + proof.length
  const data = new Uint8Array(size)
  let offset = 0

  data.set(CLAIM_TRANSFER_DISC, offset)
  offset += 8

  data.set(nullifier, offset)
  offset += 32

  writeU32LE(data, proof.length, offset)
  offset += 4
  data.set(proof, offset)

  return new TransactionInstruction({
    keys: [
      { pubkey: CONFIG_PDA, isSigner: false, isWritable: false },
      { pubkey: transferRecordPda, isSigner: false, isWritable: true },
      { pubkey: nullifierRecordPda, isSigner: false, isWritable: true },
      { pubkey: stealthPubkey, isSigner: true, isWritable: true },
      { pubkey: recipientPubkey, isSigner: true, isWritable: true },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: SIP_PROGRAM_ID,
    data: Buffer.from(data),
  })
}
