"use client"

import type { Connection } from "@solana/web3.js"
import {
  resolveSIPStealth,
  buildPublishTx,
  deriveStealthKeys,
  invalidateCache,
  MetaAddress,
  Malformed,
  NetworkError,
  NotFound,
  OnChainError,
  UserRejected,
  type ResolveResult,
} from "@sip-protocol/sns-stealth"
import type { WalletContextState } from "@solana/wallet-adapter-react"

export async function resolve(
  connection: Connection,
  domain: string,
): Promise<ResolveResult> {
  return resolveSIPStealth(connection, domain)
}

export async function publish(
  connection: Connection,
  domain: string,
  wallet: WalletContextState,
): Promise<{ signature: string }> {
  if (!wallet.publicKey || !wallet.signMessage || !wallet.sendTransaction) {
    throw new Error(
      "Wallet not connected or does not support signMessage/sendTransaction",
    )
  }

  const keys = await deriveStealthKeys(
    { signMessage: wallet.signMessage },
    domain,
  )

  const tx = await buildPublishTx(
    connection,
    domain,
    { spending: keys.spending, viewing: keys.viewing },
    wallet.publicKey,
  )

  const signature = await wallet.sendTransaction(tx, connection)
  invalidateCache(domain)
  return { signature }
}

export {
  invalidateCache,
  MetaAddress,
  Malformed,
  NetworkError,
  NotFound,
  OnChainError,
  UserRejected,
}
export type { ResolveResult }
