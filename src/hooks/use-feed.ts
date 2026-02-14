"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { TapestryReader } from "@/lib/social/tapestry-reader"
import type { SocialPost, StealthProfile } from "@/lib/social/types"

export type FeedFilter = "all" | "encrypted" | "public"

export interface UseFeedReturn {
  posts: SocialPost[]
  isLoading: boolean
  filter: FeedFilter
  setFilter: (filter: FeedFilter) => void
  profiles: StealthProfile[]
}

export function useFeed(): UseFeedReturn {
  const [allPosts, setAllPosts] = useState<SocialPost[]>([])
  const [profiles, setProfiles] = useState<StealthProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FeedFilter>("all")

  useEffect(() => {
    const reader = new TapestryReader("simulation")

    async function load() {
      setIsLoading(true)
      try {
        const [feedData, profileData] = await Promise.all([
          reader.getFeed(),
          reader.getProfiles(),
        ])
        setAllPosts(feedData)
        setProfiles(profileData)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const posts = useMemo(() => {
    if (filter === "all") return allPosts
    if (filter === "encrypted") return allPosts.filter((p) => p.isEncrypted)
    return allPosts.filter((p) => !p.isEncrypted)
  }, [allPosts, filter])

  const handleSetFilter = useCallback((f: FeedFilter) => {
    setFilter(f)
  }, [])

  return {
    posts,
    isLoading,
    filter,
    setFilter: handleSetFilter,
    profiles,
  }
}
