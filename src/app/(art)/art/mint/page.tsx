import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mint Privacy NFT",
  description: "Mint your privacy art as compressed NFTs via Metaplex Bubblegum.",
}

export default function ArtMintPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Mint NFT</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Mint your privacy art as compressed NFTs. Compatible with Exchange Art
          at ~$0.001 per mint.
        </p>
      </div>

      {/* Empty State */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
        <p className="text-4xl mb-4">💎</p>
        <h2 className="text-lg font-semibold mb-2">Create art first</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          Generate privacy art in the Create tab, then come here to mint it as a
          compressed NFT on Solana.
        </p>
      </div>
    </div>
  )
}
