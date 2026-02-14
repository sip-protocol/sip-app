"use client"

import { useSocialHistoryStore } from "@/stores/social-history"
import { CreateProfileForm } from "@/components/social/create-profile-form"
import { IdentitySelector } from "@/components/social/identity-selector"

export function ProfilePageClient() {
  const { profiles } = useSocialHistoryStore()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Stealth Profile</h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          Manage your anonymous on-chain identity. Create and switch between
          stealth personas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Existing identities */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Identities</h2>
          {profiles.length > 0 ? (
            <IdentitySelector
              profiles={profiles}
              selected={profiles[0]?.id ?? null}
              onSelect={() => {}}
            />
          ) : (
            <div className="bg-[var(--surface-primary)] border border-[var(--border-default)] rounded-xl p-12 text-center">
              <p className="text-4xl mb-4">{"\u{1F464}"}</p>
              <h3 className="text-lg font-semibold mb-2">
                No stealth profiles yet
              </h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                Create a stealth identity to start interacting socially on-chain
                without revealing your wallet address.
              </p>
            </div>
          )}
        </div>

        {/* Create form */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Create New Identity</h2>
          <CreateProfileForm />
        </div>
      </div>
    </div>
  )
}
