import { describe, it, expect } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useFeed } from "@/hooks/use-feed"

describe("useFeed", () => {
  it("starts with loading state", () => {
    const { result } = renderHook(() => useFeed())
    expect(result.current.isLoading).toBe(true)
  })

  it("loads posts and profiles", async () => {
    const { result } = renderHook(() => useFeed())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.posts.length).toBeGreaterThanOrEqual(10)
    expect(result.current.profiles.length).toBeGreaterThanOrEqual(5)
  })

  it("filters to encrypted posts", async () => {
    const { result } = renderHook(() => useFeed())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => result.current.setFilter("encrypted"))

    expect(result.current.filter).toBe("encrypted")
    expect(result.current.posts.every((p) => p.isEncrypted)).toBe(true)
    expect(result.current.posts.length).toBeGreaterThanOrEqual(1)
  })

  it("filters to public posts", async () => {
    const { result } = renderHook(() => useFeed())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => result.current.setFilter("public"))

    expect(result.current.posts.every((p) => !p.isEncrypted)).toBe(true)
    expect(result.current.posts.length).toBeGreaterThanOrEqual(1)
  })

  it("shows all posts with 'all' filter", async () => {
    const { result } = renderHook(() => useFeed())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const totalPosts = result.current.posts.length

    act(() => result.current.setFilter("encrypted"))
    const encrypted = result.current.posts.length

    act(() => result.current.setFilter("public"))
    const publicPosts = result.current.posts.length

    act(() => result.current.setFilter("all"))

    expect(result.current.posts.length).toBe(totalPosts)
    expect(encrypted + publicPosts).toBe(totalPosts)
  })
})
