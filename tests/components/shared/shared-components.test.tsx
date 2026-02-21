import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"

// Mock framer-motion to render plain divs (avoids animation API issues in happy-dom)
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      // Strip motion-specific props, keep role/aria/className
      const { initial, animate, exit, transition, ...rest } = props
      return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children as React.ReactNode}</div>
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { PageTransition } from "@/components/shared/page-transition"
import { TrackPageSkeleton } from "@/components/shared/track-skeleton"
import { ActionToast } from "@/components/shared/action-toast"

// ── PageTransition ────────────────────────────────────────────────────────

describe("PageTransition", () => {
  it("renders children", () => {
    render(
      <PageTransition>
        <p>Hello World</p>
      </PageTransition>
    )
    expect(screen.getByText("Hello World")).toBeInTheDocument()
  })

  it("renders multiple children", () => {
    render(
      <PageTransition>
        <p>First</p>
        <p>Second</p>
      </PageTransition>
    )
    expect(screen.getByText("First")).toBeInTheDocument()
    expect(screen.getByText("Second")).toBeInTheDocument()
  })
})

// ── TrackPageSkeleton ─────────────────────────────────────────────────────

describe("TrackPageSkeleton", () => {
  it("renders default 3 skeleton cards", () => {
    const { container } = render(<TrackPageSkeleton />)
    // The grid contains skeleton card divs with animate-pulse class
    const cards = container.querySelectorAll(".grid > div")
    expect(cards).toHaveLength(3)
  })

  it("renders custom count of skeleton cards", () => {
    const { container } = render(<TrackPageSkeleton count={5} />)
    const cards = container.querySelectorAll(".grid > div")
    expect(cards).toHaveLength(5)
  })

  it("renders 1 card when count=1", () => {
    const { container } = render(<TrackPageSkeleton count={1} />)
    const cards = container.querySelectorAll(".grid > div")
    expect(cards).toHaveLength(1)
  })

  it("renders header skeleton placeholder", () => {
    const { container } = render(<TrackPageSkeleton />)
    // Header has h-8 w-48 skeleton bar
    const headerBar = container.querySelector(".h-8.w-48")
    expect(headerBar).toBeTruthy()
  })
})

// ── ActionToast ───────────────────────────────────────────────────────────

describe("ActionToast", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders success message with emerald/green styling", () => {
    const onClose = vi.fn()
    const { container } = render(
      <ActionToast message="Transfer complete" type="success" onClose={onClose} />
    )
    expect(screen.getByText("Transfer complete")).toBeInTheDocument()
    // Success uses emerald color classes
    const messageEl = screen.getByText("Transfer complete")
    expect(messageEl.className).toContain("emerald")
  })

  it("renders error message with red styling", () => {
    const onClose = vi.fn()
    const { container } = render(
      <ActionToast message="Something failed" type="error" onClose={onClose} />
    )
    expect(screen.getByText("Something failed")).toBeInTheDocument()
    const messageEl = screen.getByText("Something failed")
    expect(messageEl.className).toContain("red")
  })

  it("has role=status for accessibility", () => {
    const onClose = vi.fn()
    render(
      <ActionToast message="Done" type="success" onClose={onClose} />
    )
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("has dismiss button with accessible label", () => {
    const onClose = vi.fn()
    render(
      <ActionToast message="Done" type="success" onClose={onClose} />
    )
    expect(screen.getByLabelText("Dismiss notification")).toBeInTheDocument()
  })

  it("calls onClose after 4 seconds", () => {
    const onClose = vi.fn()
    render(
      <ActionToast message="Auto dismiss" type="success" onClose={onClose} />
    )
    expect(onClose).not.toHaveBeenCalled()

    vi.advanceTimersByTime(3999)
    expect(onClose).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
