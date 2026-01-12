import { create } from "zustand"
import type { Toast } from "@/types"

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = crypto.randomUUID()
    const newToast: Toast = { ...toast, id }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // Auto-remove after duration (default 5s)
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, duration)
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  clearToasts: () => set({ toasts: [] }),
}))

/**
 * Convenient toast helper methods
 * Usage: toast.success("Title", "Message")
 */
export const toast = {
  success: (title: string, message?: string) => {
    useToastStore.getState().addToast({
      type: "success",
      title,
      message,
    })
  },
  error: (title: string, message?: string) => {
    useToastStore.getState().addToast({
      type: "error",
      title,
      message,
    })
  },
  warning: (title: string, message?: string) => {
    useToastStore.getState().addToast({
      type: "warning",
      title,
      message,
    })
  },
  info: (title: string, message?: string) => {
    useToastStore.getState().addToast({
      type: "info",
      title,
      message,
    })
  },
}
