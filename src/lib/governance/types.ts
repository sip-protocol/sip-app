import type { PrivacyLevel } from "@sip-protocol/types"

export type VoteStep =
  | "encrypting"
  | "committing"
  | "committed"
  | "revealing"
  | "revealed"
  | "failed"

export type ProposalStatus = "voting" | "reveal" | "completed" | "cancelled"

export interface DAO {
  id: string
  name: string
  icon: string
  token: string
  description: string
  proposalCount: number
}

export interface Proposal {
  id: string
  daoId: string
  daoName: string
  daoIcon: string
  title: string
  description: string
  choices: string[]
  status: ProposalStatus
  startTime: number
  endTime: number
  revealTime: number
  totalVotes: number
  quorum: number
  voterWeight?: string
  encryptionKey: string
}

export interface SerializedEncryptedVote {
  ciphertext: string
  nonce: string
  encryptionKeyHash: string
  proposalId: string
  voter: string
  timestamp: number
}

export interface PrivateVoteRecord {
  id: string
  proposalId: string
  daoName: string
  proposalTitle: string
  choice: number
  choiceLabel: string
  weight: string
  encryptedVote: SerializedEncryptedVote
  encryptionKey: string
  status: VoteStep
  privacyLevel: PrivacyLevel
  revealedChoice?: number
  revealedWeight?: string
  startedAt: number
  committedAt?: number
  revealedAt?: number
  error?: string
  stepTimestamps: Partial<Record<VoteStep, number>>
}

export interface VoteParams {
  proposalId: string
  choice: number
  weight: string
  privacyLevel: PrivacyLevel
}

export type VoteStepChangeCallback = (
  step: VoteStep,
  vote: PrivateVoteRecord,
) => void

export type GovernanceMode = "simulation" | "realms"
