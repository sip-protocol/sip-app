/**
 * Bubblegum cNFT Minting Client
 *
 * Shared infrastructure for minting compressed NFTs (cNFTs) via Metaplex
 * Bubblegum's `mintToCollectionV1` instruction. Used by Art, Channel, and
 * Ticketing tracks to mint privacy-preserving cNFTs to stealth addresses.
 *
 * Builds raw TransactionInstruction objects compatible with @solana/wallet-adapter-react's
 * `sendTransaction` — no UMI dependency at runtime.
 *
 * Instruction layout references:
 * - Bubblegum program: BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY
 * - Discriminator: [153, 18, 178, 47, 197, 158, 86, 15]
 * - Account order: treeConfig, leafOwner, leafDelegate, merkleTree, payer,
 *   treeCreatorOrDelegate, collectionAuthority, collectionAuthorityRecordPda,
 *   collectionMint, collectionMetadata, collectionEdition, bubblegumSigner,
 *   logWrapper, compressionProgram, tokenMetadataProgram, systemProgram
 */

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  ComputeBudgetProgram,
  SystemProgram,
} from "@solana/web3.js"

// ─────────────────────────────────────────────────────────────────────────────
// Program Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Metaplex Bubblegum program ID */
export const BUBBLEGUM_PROGRAM_ID = new PublicKey(
  "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY"
)

/** SPL Noop (log wrapper) program ID */
export const SPL_NOOP_PROGRAM_ID = new PublicKey(
  "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"
)

/** SPL Account Compression program ID */
export const SPL_ACCOUNT_COMPRESSION_PROGRAM_ID = new PublicKey(
  "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK"
)

/** Token Metadata program ID */
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
)

/** mintToCollectionV1 discriminator (sha256("global:mint_to_collection_v1")[0..8]) */
const MINT_TO_COLLECTION_V1_DISC = new Uint8Array([
  153, 18, 178, 47, 197, 158, 86, 15,
])

// ─────────────────────────────────────────────────────────────────────────────
// Borsh Serialization Helpers (browser-safe, no Buffer methods)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Growable byte buffer for Borsh serialization.
 * Avoids fixed-size allocation issues with variable-length metadata.
 */
class BorshWriter {
  private buf: Uint8Array
  private pos = 0

  constructor(initialCapacity = 512) {
    this.buf = new Uint8Array(initialCapacity)
  }

  private grow(needed: number): void {
    const required = this.pos + needed
    if (required <= this.buf.length) return
    let newSize = this.buf.length * 2
    while (newSize < required) newSize *= 2
    const next = new Uint8Array(newSize)
    next.set(this.buf)
    this.buf = next
  }

  writeU8(value: number): void {
    this.grow(1)
    this.buf[this.pos++] = value & 0xff
  }

  writeU16LE(value: number): void {
    this.grow(2)
    const view = new DataView(this.buf.buffer, this.buf.byteOffset)
    view.setUint16(this.pos, value, true)
    this.pos += 2
  }

  writeU32LE(value: number): void {
    this.grow(4)
    const view = new DataView(this.buf.buffer, this.buf.byteOffset)
    view.setUint32(this.pos, value, true)
    this.pos += 4
  }

  writeBytes(data: Uint8Array): void {
    this.grow(data.length)
    this.buf.set(data, this.pos)
    this.pos += data.length
  }

  /** Borsh string: u32 length prefix + UTF-8 bytes */
  writeString(str: string): void {
    const encoded = new TextEncoder().encode(str)
    this.writeU32LE(encoded.length)
    this.writeBytes(encoded)
  }

  /** Borsh bool: single byte 0/1 */
  writeBool(value: boolean): void {
    this.writeU8(value ? 1 : 0)
  }

  /** Borsh Option<T>: 0 = None, 1 + value = Some */
  writeOptionU8(value: number | null): void {
    if (value === null) {
      this.writeU8(0)
    } else {
      this.writeU8(1)
      this.writeU8(value)
    }
  }

  /** Borsh Option with an enum value (u8 discriminant) */
  writeOptionEnum(value: number | null): void {
    if (value === null) {
      this.writeU8(0)
    } else {
      this.writeU8(1)
      this.writeU8(value)
    }
  }

  /** Borsh PublicKey: 32 bytes */
  writePublicKey(key: PublicKey): void {
    this.writeBytes(key.toBytes())
  }

  toBytes(): Uint8Array {
    return this.buf.slice(0, this.pos)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PDA Derivation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derive the TreeConfig PDA for a given merkle tree.
 * Seeds: [merkleTree.toBytes()]
 */
export function findTreeConfigPda(merkleTree: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [merkleTree.toBytes()],
    BUBBLEGUM_PROGRAM_ID
  )
}

/**
 * Derive the collection metadata PDA (Token Metadata program).
 * Seeds: ["metadata", TOKEN_METADATA_PROGRAM_ID, mint]
 */
export function findMetadataPda(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      new TextEncoder().encode("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBytes(),
      mint.toBytes(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  )
}

/**
 * Derive the master edition PDA (Token Metadata program).
 * Seeds: ["metadata", TOKEN_METADATA_PROGRAM_ID, mint, "edition"]
 */
export function findMasterEditionPda(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      new TextEncoder().encode("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBytes(),
      mint.toBytes(),
      new TextEncoder().encode("edition"),
    ],
    TOKEN_METADATA_PROGRAM_ID
  )
}

/**
 * Derive the Bubblegum signer PDA.
 * Seeds: ["collection_cpi"]
 */
export function findBubblegumSignerPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [new TextEncoder().encode("collection_cpi")],
    BUBBLEGUM_PROGRAM_ID
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Public Types
// ─────────────────────────────────────────────────────────────────────────────

/** Creator entry for cNFT metadata */
export interface CNFTCreator {
  address: PublicKey
  /** Whether this creator is verified (set to false — verified on-chain) */
  verified: boolean
  /** Royalty share percentage (0-100, all creators must sum to 100) */
  share: number
}

export interface MintCNFTParams {
  connection: Connection
  /** Fee payer / tree authority (signer) */
  payer: PublicKey
  /** Stealth address as recipient (unlinkable) */
  recipient: PublicKey
  /** Merkle tree address for cNFT storage */
  merkleTree: PublicKey
  /** Collection mint address */
  collectionMint: PublicKey
  /** NFT metadata */
  metadata: {
    name: string
    symbol?: string
    uri: string
    /** Royalty basis points (0-10000), default 0 */
    sellerFeeBasisPoints?: number
    /** Creators list, default to payer with 100% share */
    creators?: CNFTCreator[]
    /** Whether the metadata is mutable, default true */
    isMutable?: boolean
  }
}

export interface MintCNFTResult {
  /** Signable transaction for wallet adapter */
  transaction: Transaction
  /** Derived tree config PDA (useful for downstream tracking) */
  treeConfigPda: PublicKey
}

// ─────────────────────────────────────────────────────────────────────────────
// Borsh Metadata Encoding
// ─────────────────────────────────────────────────────────────────────────────

/** Token standard enum values (Borsh u8 discriminant) */
enum TokenStandard {
  NonFungible = 0,
  FungibleAsset = 1,
  Fungible = 2,
  NonFungibleEdition = 3,
}

/** Token program version enum values (Borsh u8 discriminant) */
enum TokenProgramVersion {
  Original = 0,
  Token2022 = 1,
}

/**
 * Serialize MetadataArgs in Borsh format matching Bubblegum's expected layout:
 *
 * struct MetadataArgs {
 *   name: String,
 *   symbol: String,
 *   uri: String,
 *   seller_fee_basis_points: u16,
 *   primary_sale_happened: bool,
 *   is_mutable: bool,
 *   edition_nonce: Option<u8>,
 *   token_standard: Option<TokenStandard>,
 *   collection: Option<Collection>,
 *   uses: Option<Uses>,
 *   token_program_version: TokenProgramVersion,
 *   creators: Vec<Creator>,
 * }
 */
function serializeMetadataArgs(
  metadata: MintCNFTParams["metadata"],
  collectionMint: PublicKey,
  payer: PublicKey
): Uint8Array {
  const writer = new BorshWriter(1024)

  // name: String
  writer.writeString(metadata.name)
  // symbol: String
  writer.writeString(metadata.symbol ?? "")
  // uri: String
  writer.writeString(metadata.uri)
  // seller_fee_basis_points: u16
  writer.writeU16LE(metadata.sellerFeeBasisPoints ?? 0)
  // primary_sale_happened: bool
  writer.writeBool(false)
  // is_mutable: bool
  writer.writeBool(metadata.isMutable ?? true)
  // edition_nonce: Option<u8> — None for cNFTs
  writer.writeOptionU8(null)
  // token_standard: Option<TokenStandard> — Some(NonFungible)
  writer.writeOptionEnum(TokenStandard.NonFungible)
  // collection: Option<Collection> — Some({ verified: false, key: collectionMint })
  // The `verified` field is set to false; Bubblegum verifies it on-chain
  writer.writeU8(1) // Some
  writer.writeBool(false) // verified = false (Bubblegum verifies)
  writer.writePublicKey(collectionMint) // key
  // uses: Option<Uses> — None
  writer.writeU8(0) // None
  // token_program_version: TokenProgramVersion
  writer.writeU8(TokenProgramVersion.Original)
  // creators: Vec<Creator>
  const creators = metadata.creators ?? [
    { address: payer, verified: false, share: 100 },
  ]
  writer.writeU32LE(creators.length)
  for (const creator of creators) {
    writer.writePublicKey(creator.address)
    writer.writeBool(creator.verified)
    writer.writeU8(creator.share)
  }

  return writer.toBytes()
}

// ─────────────────────────────────────────────────────────────────────────────
// Instruction Builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a Bubblegum `mintToCollectionV1` TransactionInstruction.
 *
 * This produces a raw instruction with the correct account layout and
 * Borsh-serialized metadata args, avoiding UMI as a runtime dependency.
 *
 * Accounts (16 total, in order):
 *  0. treeConfig (PDA, writable)
 *  1. leafOwner (recipient stealth address)
 *  2. leafDelegate (= leafOwner)
 *  3. merkleTree (writable)
 *  4. payer (signer)
 *  5. treeCreatorOrDelegate (signer = payer)
 *  6. collectionAuthority (signer = payer)
 *  7. collectionAuthorityRecordPda (Bubblegum program ID)
 *  8. collectionMint
 *  9. collectionMetadata (PDA, writable)
 * 10. collectionEdition (PDA)
 * 11. bubblegumSigner (PDA)
 * 12. logWrapper (SPL Noop)
 * 13. compressionProgram (SPL Account Compression)
 * 14. tokenMetadataProgram
 * 15. systemProgram
 */
export function buildMintToCollectionV1Instruction(params: {
  payer: PublicKey
  recipient: PublicKey
  merkleTree: PublicKey
  collectionMint: PublicKey
  metadata: MintCNFTParams["metadata"]
}): TransactionInstruction {
  const { payer, recipient, merkleTree, collectionMint, metadata } = params

  // Derive PDAs
  const [treeConfigPda] = findTreeConfigPda(merkleTree)
  const [collectionMetadataPda] = findMetadataPda(collectionMint)
  const [collectionEditionPda] = findMasterEditionPda(collectionMint)
  const [bubblegumSignerPda] = findBubblegumSignerPda()

  // Serialize instruction data: discriminator + MetadataArgs
  const metadataBytes = serializeMetadataArgs(metadata, collectionMint, payer)
  const data = new Uint8Array(8 + metadataBytes.length)
  data.set(MINT_TO_COLLECTION_V1_DISC, 0)
  data.set(metadataBytes, 8)

  return new TransactionInstruction({
    keys: [
      { pubkey: treeConfigPda, isSigner: false, isWritable: true },
      { pubkey: recipient, isSigner: false, isWritable: false },
      { pubkey: recipient, isSigner: false, isWritable: false }, // leafDelegate = leafOwner
      { pubkey: merkleTree, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: false }, // treeCreatorOrDelegate
      { pubkey: payer, isSigner: true, isWritable: false }, // collectionAuthority
      { pubkey: BUBBLEGUM_PROGRAM_ID, isSigner: false, isWritable: false }, // collectionAuthorityRecordPda
      { pubkey: collectionMint, isSigner: false, isWritable: false },
      { pubkey: collectionMetadataPda, isSigner: false, isWritable: true },
      { pubkey: collectionEditionPda, isSigner: false, isWritable: false },
      { pubkey: bubblegumSignerPda, isSigner: false, isWritable: false },
      { pubkey: SPL_NOOP_PROGRAM_ID, isSigner: false, isWritable: false },
      {
        pubkey: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: TOKEN_METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: BUBBLEGUM_PROGRAM_ID,
    data: Buffer.from(data),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Transaction Builder (public API)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a compressed NFT mint transaction using Metaplex Bubblegum.
 *
 * The cNFT is minted to the stealth recipient address, making it
 * unlinkable to the actual owner's wallet. Produces a signable Transaction
 * compatible with @solana/wallet-adapter-react's `sendTransaction`.
 *
 * @param params - Mint parameters (connection, payer, recipient, tree, collection, metadata)
 * @returns Transaction + treeConfigPda for tracking
 *
 * @example
 * ```ts
 * const { transaction, treeConfigPda } = await buildMintCNFTTransaction({
 *   connection,
 *   payer: walletPubkey,
 *   recipient: stealthAddress,
 *   merkleTree: treePubkey,
 *   collectionMint: collectionPubkey,
 *   metadata: { name: "SIP Art #1", uri: "https://arweave.net/..." },
 * })
 * // Sign and send via wallet adapter
 * await sendTransaction(transaction, connection)
 * ```
 */
export async function buildMintCNFTTransaction(
  params: MintCNFTParams
): Promise<MintCNFTResult> {
  const { connection, payer, recipient, merkleTree, collectionMint, metadata } =
    params

  // Validate inputs
  if (!metadata.name || metadata.name.length === 0) {
    throw new Error("metadata.name is required")
  }
  if (!metadata.uri || metadata.uri.length === 0) {
    throw new Error("metadata.uri is required")
  }
  if (
    metadata.sellerFeeBasisPoints !== undefined &&
    (metadata.sellerFeeBasisPoints < 0 || metadata.sellerFeeBasisPoints > 10000)
  ) {
    throw new Error("sellerFeeBasisPoints must be between 0 and 10000")
  }
  if (metadata.creators) {
    const totalShare = metadata.creators.reduce((sum, c) => sum + c.share, 0)
    if (totalShare !== 100) {
      throw new Error(`Creator shares must sum to 100, got ${totalShare}`)
    }
  }

  // Fetch recent blockhash
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed")

  const tx = new Transaction({
    feePayer: payer,
    blockhash,
    lastValidBlockHeight,
  })

  // Compute budget: cNFT mints need ~200K CU
  tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }))
  tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }))

  // Bubblegum mintToCollectionV1 instruction
  tx.add(
    buildMintToCollectionV1Instruction({
      payer,
      recipient,
      merkleTree,
      collectionMint,
      metadata,
    })
  )

  const [treeConfigPda] = findTreeConfigPda(merkleTree)

  return { transaction: tx, treeConfigPda }
}
