import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

type ToastVariant = "default" | "destructive"

export type Toast = {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

type ToastCtx = {
  push: (t: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastCtx | null>(null)

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>")
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const push = React.useCallback((t: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const toast: Toast = { id, duration: 3500, ...t }
    setToasts((prev) => [...prev, toast])
    // auto-dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, toast.duration)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto rounded-md border p-3 shadow-md bg-card text-card-foreground",
                t.variant === "destructive" && "border-destructive/40 bg-destructive text-destructive-foreground"
              )}
            >
              {t.title && <div className="text-sm font-semibold">{t.title}</div>}
              {t.description && <div className="text-sm opacity-90">{t.description}</div>}
              <button
                onClick={() => dismiss(t.id)}
                className={cn(
                  "mt-2 rounded-md border px-2 py-1 text-xs",
                  t.variant === "destructive" ? "border-destructive-foreground/50" : "border-border"
                )}
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}
