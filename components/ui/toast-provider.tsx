"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "motion/react"

type ToastVariant = "default" | "success" | "error" | "info"

export type ToastOptions = {
  id?: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

type ToastRecord = Required<Pick<ToastOptions, "id">> &
  Omit<ToastOptions, "id">

type ToastContextValue = {
  toast: (options: ToastOptions) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const variantStyles: Record<ToastVariant, string> = {
  default: "border-border bg-card text-card-foreground",
  success:
    "border-emerald-500/40 bg-emerald-500/15 text-emerald-100 shadow-emerald-900/30",
  error:
    "border-destructive/40 bg-destructive/15 text-destructive-foreground shadow-destructive/30",
  info: "border-sky-500/40 bg-sky-500/15 text-sky-100 shadow-sky-900/30",
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const timeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
    const timer = timeouts.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timeouts.current.delete(id)
    }
  }, [])

  const toast = useCallback(
    ({ id, duration = 4000, ...rest }: ToastOptions) => {
      const nextId = id ?? crypto.randomUUID?.() ?? `${Date.now()}`
      setToasts((prev) => [...prev, { id: nextId, duration, ...rest }])
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(nextId), duration)
        timeouts.current.set(nextId, timer)
      }
    },
    [dismiss]
  )

  useEffect(() => {
    const timers = timeouts.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastViewport({
  toasts,
  dismiss,
}: {
  toasts: ToastRecord[]
  dismiss: (id: string) => void
}) {
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const el = document.createElement("div")
    el.className = "pointer-events-none fixed inset-0 z-[100]"
    document.body.appendChild(el)
    setContainer(el)
    return () => {
      document.body.removeChild(el)
    }
  }, [])

  if (!container) return null

  return createPortal(
    <div className="flex h-full flex-col items-end justify-end gap-2 p-4 sm:p-6">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={`pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${
              variantStyles[toast.variant ?? "default"]
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                {toast.title ? (
                  <p className="text-sm font-medium">{toast.title}</p>
                ) : null}
                {toast.description ? (
                  <p className="mt-1 text-sm opacity-80">{toast.description}</p>
                ) : null}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:text-foreground"
              >
                Close
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    container
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)

  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return ctx
}
