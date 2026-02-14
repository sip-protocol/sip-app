import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { PostCard } from "@/components/social/post-card"
import { PrivacyLevel } from "@sip-protocol/types"
import type { SocialPost } from "@/lib/social/types"

const now = Date.now()
const HOUR = 3600000

const mockPost: SocialPost = {
  id: "post-test-01",
  authorProfileId: "profile-dolphin",
  authorUsername: "anon_dolphin",
  content: "Privacy is a right, not a privilege. Stealth addresses change everything.",
  timestamp: now - 2 * HOUR,
  likeCount: 42,
  commentCount: 7,
  isEncrypted: false,
  privacyLevel: PrivacyLevel.TRANSPARENT,
}

const encryptedPost: SocialPost = {
  id: "post-test-02",
  authorProfileId: "profile-cipher",
  authorUsername: "cipher_punk",
  content: "",
  encryptedContent: "0xencrypted_content_hash",
  timestamp: now - 5 * HOUR,
  likeCount: 31,
  commentCount: 3,
  isEncrypted: true,
  privacyLevel: PrivacyLevel.SHIELDED,
}

describe("PostCard", () => {
  it("renders author username", () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText("anon_dolphin")).toBeInTheDocument()
  })

  it("renders post content for public posts", () => {
    render(<PostCard post={mockPost} />)
    expect(
      screen.getByText("Privacy is a right, not a privilege. Stealth addresses change everything."),
    ).toBeInTheDocument()
  })

  it("renders timestamp", () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText("2h ago")).toBeInTheDocument()
  })

  it("shows encrypted indicator for encrypted posts", () => {
    render(<PostCard post={encryptedPost} />)
    expect(
      screen.getByText("Encrypted — viewing key required"),
    ).toBeInTheDocument()
  })

  it("does not show content for encrypted posts", () => {
    render(<PostCard post={encryptedPost} />)
    expect(
      screen.queryByText("0xencrypted_content_hash"),
    ).not.toBeInTheDocument()
  })

  it("renders like count", () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText("42")).toBeInTheDocument()
  })

  it("renders comment count", () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText("7")).toBeInTheDocument()
  })

  it("fires onLike callback", () => {
    const onLike = vi.fn()
    render(<PostCard post={mockPost} onLike={onLike} />)
    // Find the like button (contains heart + count)
    const likeButton = screen.getByText("42").closest("button")
    expect(likeButton).toBeTruthy()
    fireEvent.click(likeButton!)
    expect(onLike).toHaveBeenCalledWith("post-test-01")
  })
})
