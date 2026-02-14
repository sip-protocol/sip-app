import { describe, it, expect, beforeEach } from "vitest"
import { useSocialHistoryStore } from "@/stores/social-history"
import { PrivacyLevel } from "@sip-protocol/types"
import type { SocialActionRecord, StealthProfile } from "@/lib/social/types"

function makeMockAction(overrides?: Partial<SocialActionRecord>): SocialActionRecord {
  return {
    id: `action_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "profile",
    profileId: "profile-test",
    status: "profile_created",
    privacyLevel: PrivacyLevel.SHIELDED,
    startedAt: Date.now(),
    completedAt: Date.now(),
    stepTimestamps: {},
    ...overrides,
  }
}

function makeMockProfile(overrides?: Partial<StealthProfile>): StealthProfile {
  return {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    username: "test_user",
    bio: "Test bio",
    stealthAddress: "sip:solana:0x" + "aa".repeat(32),
    stealthMetaAddress: "st:sol:0x" + "bb".repeat(32),
    viewingPrivateKey: "0x" + "cc".repeat(32),
    spendingPrivateKey: "0x" + "dd".repeat(32),
    createdAt: Date.now(),
    postCount: 0,
    followerCount: 0,
    followingCount: 0,
    ...overrides,
  }
}

describe("useSocialHistoryStore", () => {
  beforeEach(() => {
    useSocialHistoryStore.setState({ actions: [], profiles: [] })
  })

  it("has empty initial state", () => {
    const state = useSocialHistoryStore.getState()
    expect(state.actions).toEqual([])
    expect(state.profiles).toEqual([])
  })

  it("adds an action", () => {
    const action = makeMockAction({ id: "test-1" })
    useSocialHistoryStore.getState().addAction(action)

    const state = useSocialHistoryStore.getState()
    expect(state.actions).toHaveLength(1)
    expect(state.actions[0].id).toBe("test-1")
  })

  it("prepends new actions (newest first)", () => {
    const a1 = makeMockAction({ id: "first" })
    const a2 = makeMockAction({ id: "second" })

    const store = useSocialHistoryStore.getState()
    store.addAction(a1)
    store.addAction(a2)

    const state = useSocialHistoryStore.getState()
    expect(state.actions[0].id).toBe("second")
    expect(state.actions[1].id).toBe("first")
  })

  it("caps at MAX_SOCIAL_HISTORY (100)", () => {
    const store = useSocialHistoryStore.getState()

    for (let i = 0; i < 105; i++) {
      store.addAction(makeMockAction({ id: `a-${i}` }))
    }

    expect(useSocialHistoryStore.getState().actions).toHaveLength(100)
  })

  it("updates an action", () => {
    const action = makeMockAction({ id: "update-me", status: "generating_stealth" })
    useSocialHistoryStore.getState().addAction(action)

    useSocialHistoryStore.getState().updateAction("update-me", {
      status: "profile_created",
      completedAt: Date.now(),
    })

    const updated = useSocialHistoryStore.getState().getAction("update-me")
    expect(updated?.status).toBe("profile_created")
    expect(updated?.completedAt).toBeDefined()
  })

  it("getAction returns undefined for missing id", () => {
    const result = useSocialHistoryStore.getState().getAction("nonexistent")
    expect(result).toBeUndefined()
  })

  it("getActionsByType filters correctly", () => {
    const store = useSocialHistoryStore.getState()
    store.addAction(makeMockAction({ id: "a1", type: "profile" }))
    store.addAction(makeMockAction({ id: "a2", type: "post" }))
    store.addAction(makeMockAction({ id: "a3", type: "profile" }))
    store.addAction(makeMockAction({ id: "a4", type: "follow" }))

    const profiles = useSocialHistoryStore.getState().getActionsByType("profile")
    expect(profiles).toHaveLength(2)
    expect(profiles.every((a) => a.type === "profile")).toBe(true)
  })

  it("adds a profile", () => {
    const profile = makeMockProfile({ id: "p-1", username: "anon_test" })
    useSocialHistoryStore.getState().addProfile(profile)

    const profiles = useSocialHistoryStore.getState().getProfiles()
    expect(profiles).toHaveLength(1)
    expect(profiles[0].username).toBe("anon_test")
  })

  it("getActiveProfile returns the most recent profile", () => {
    const store = useSocialHistoryStore.getState()
    store.addProfile(makeMockProfile({ id: "p-old", username: "old_user" }))
    store.addProfile(makeMockProfile({ id: "p-new", username: "new_user" }))

    const active = useSocialHistoryStore.getState().getActiveProfile()
    expect(active?.username).toBe("new_user")
  })

  it("clears all history", () => {
    const store = useSocialHistoryStore.getState()
    store.addAction(makeMockAction())
    store.addProfile(makeMockProfile())

    expect(useSocialHistoryStore.getState().actions).toHaveLength(1)
    expect(useSocialHistoryStore.getState().profiles).toHaveLength(1)

    useSocialHistoryStore.getState().clearHistory()
    expect(useSocialHistoryStore.getState().actions).toEqual([])
    expect(useSocialHistoryStore.getState().profiles).toEqual([])
  })
})
