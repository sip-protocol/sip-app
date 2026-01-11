import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { useToastStore } from "@/stores/toast"

describe("useToastStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useToastStore.setState({ toasts: [] })
    // Use fake timers for testing auto-removal
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("initial state", () => {
    it("starts with empty toasts array", () => {
      const state = useToastStore.getState()
      expect(state.toasts).toEqual([])
    })
  })

  describe("addToast", () => {
    it("adds a toast with generated id", () => {
      const { addToast } = useToastStore.getState()

      addToast({
        type: "success",
        title: "Test Toast",
        message: "This is a test",
      })

      const { toasts } = useToastStore.getState()
      expect(toasts).toHaveLength(1)
      expect(toasts[0].type).toBe("success")
      expect(toasts[0].title).toBe("Test Toast")
      expect(toasts[0].message).toBe("This is a test")
      expect(toasts[0].id).toBeDefined()
    })

    it("adds multiple toasts", () => {
      const { addToast } = useToastStore.getState()

      addToast({ type: "success", title: "Toast 1" })
      addToast({ type: "error", title: "Toast 2" })
      addToast({ type: "warning", title: "Toast 3" })

      const { toasts } = useToastStore.getState()
      expect(toasts).toHaveLength(3)
    })

    it("auto-removes toast after default duration (5s)", () => {
      const { addToast } = useToastStore.getState()

      addToast({ type: "info", title: "Auto-remove test" })

      expect(useToastStore.getState().toasts).toHaveLength(1)

      // Fast-forward 5 seconds
      vi.advanceTimersByTime(5000)

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it("uses custom duration when provided", () => {
      const { addToast } = useToastStore.getState()

      addToast({ type: "info", title: "Custom duration", duration: 2000 })

      expect(useToastStore.getState().toasts).toHaveLength(1)

      // Fast-forward 2 seconds
      vi.advanceTimersByTime(2000)

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it("does not auto-remove when duration is 0", () => {
      const { addToast } = useToastStore.getState()

      addToast({ type: "info", title: "Persistent toast", duration: 0 })

      expect(useToastStore.getState().toasts).toHaveLength(1)

      // Fast-forward 10 seconds
      vi.advanceTimersByTime(10000)

      // Should still be there
      expect(useToastStore.getState().toasts).toHaveLength(1)
    })

    it("handles all toast types", () => {
      const { addToast } = useToastStore.getState()
      const types = ["success", "error", "warning", "info"] as const

      types.forEach((type) => {
        addToast({ type, title: `${type} toast`, duration: 0 })
      })

      const { toasts } = useToastStore.getState()
      expect(toasts).toHaveLength(4)
      types.forEach((type, index) => {
        expect(toasts[index].type).toBe(type)
      })
    })
  })

  describe("removeToast", () => {
    it("removes toast by id", () => {
      const { addToast, removeToast } = useToastStore.getState()

      addToast({ type: "success", title: "Toast 1", duration: 0 })
      addToast({ type: "error", title: "Toast 2", duration: 0 })

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(2)

      const idToRemove = toasts[0].id
      removeToast(idToRemove)

      const remainingToasts = useToastStore.getState().toasts
      expect(remainingToasts).toHaveLength(1)
      expect(remainingToasts[0].title).toBe("Toast 2")
    })

    it("does nothing when id does not exist", () => {
      const { addToast, removeToast } = useToastStore.getState()

      addToast({ type: "success", title: "Toast 1", duration: 0 })

      removeToast("non-existent-id")

      expect(useToastStore.getState().toasts).toHaveLength(1)
    })
  })

  describe("clearToasts", () => {
    it("removes all toasts", () => {
      const { addToast, clearToasts } = useToastStore.getState()

      addToast({ type: "success", title: "Toast 1", duration: 0 })
      addToast({ type: "error", title: "Toast 2", duration: 0 })
      addToast({ type: "warning", title: "Toast 3", duration: 0 })

      expect(useToastStore.getState().toasts).toHaveLength(3)

      clearToasts()

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it("works on empty toasts array", () => {
      const { clearToasts } = useToastStore.getState()

      clearToasts()

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })
  })
})
