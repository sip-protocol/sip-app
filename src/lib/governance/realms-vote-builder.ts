/**
 * SPL Governance castVote Transaction Builder
 *
 * Constructs a signable Transaction that casts a vote on an SPL Governance
 * proposal via the Realms program. Used alongside the existing SIP
 * verify_commitment memo writes to add real on-chain governance votes.
 *
 * Program: GovER5Lthms3bLBqWub97yVRs6buSgstyZvo8jaxYMB6
 */

import {
  Connection,
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
} from "@solana/web3.js"
import {
  getGovernanceProgramVersion,
  withCastVote,
  Vote,
  VoteKind,
  VoteChoice,
  getProposal as getSplProposal,
} from "@solana/spl-governance"

// SPL Governance v3 program ID (used by Realms)
const GOVERNANCE_PROGRAM_ID = new PublicKey(
  "GovER5Lthms3bLBqWub97yVRs6buSgstyZvo8jaxYMB6"
)

export interface CastVoteParams {
  realmPubkey: PublicKey
  governancePubkey: PublicKey
  proposalPubkey: PublicKey
  tokenOwnerRecordPubkey: PublicKey
  voterPubkey: PublicKey
  voterWeightRecordPubkey?: PublicKey
  choice: number
}

/**
 * Build a castVote transaction for SPL Governance.
 *
 * Fetches the on-chain proposal to resolve governingTokenMint and
 * proposalOwnerRecord, then constructs the full vote instruction
 * with ComputeBudget priority fees.
 */
export async function buildCastVoteTransaction(
  connection: Connection,
  params: CastVoteParams
): Promise<Transaction> {
  const {
    realmPubkey,
    governancePubkey,
    proposalPubkey,
    tokenOwnerRecordPubkey,
    voterPubkey,
    voterWeightRecordPubkey,
    choice,
  } = params

  // Fetch program version for correct serialization
  const programVersion = await getGovernanceProgramVersion(
    connection,
    GOVERNANCE_PROGRAM_ID
  )

  // Fetch the on-chain proposal to get governingTokenMint + proposalOwnerRecord
  const proposalAccount = await getSplProposal(connection, proposalPubkey)
  const proposal = proposalAccount.account

  // Build the Vote object for the chosen option
  const vote = new Vote({
    voteType: VoteKind.Approve,
    approveChoices: [new VoteChoice({ rank: choice, weightPercentage: 100 })],
    deny: undefined,
    veto: undefined,
  })

  // Assemble the transaction
  const tx = new Transaction()

  // ComputeBudget: 200K CU limit + 50K microLamports priority
  tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }))
  tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }))

  // Add castVote instruction (mutates the instructions array)
  await withCastVote(
    tx.instructions,
    GOVERNANCE_PROGRAM_ID,
    programVersion,
    realmPubkey,
    governancePubkey,
    proposalPubkey,
    proposal.tokenOwnerRecord, // proposalOwnerRecord (the proposer's TOR)
    tokenOwnerRecordPubkey, // voter's tokenOwnerRecord
    voterPubkey, // governanceAuthority (signer)
    proposal.governingTokenMint,
    vote,
    voterPubkey, // payer
    voterWeightRecordPubkey
  )

  tx.feePayer = voterPubkey

  return tx
}
