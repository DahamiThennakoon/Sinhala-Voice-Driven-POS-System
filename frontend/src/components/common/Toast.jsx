import { createContext, useCallback, useContext, useState } from "react"
import { CheckCircle2, XCircle, Info, X } from "lucide-react"

const ToastContext = createContext(null)

const icons = { success: CheckCircle2, error: XCircle, info: Info }
const styles = {
  success: "bg-success-600",
  error: "bg-danger-600",
  info: "bg-gray-900",
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id))

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
        {toasts.map((t) => {
          const Icon = icons[t.type]
          return (
            <div
              key={t.id}
              className={`${styles[t.type]} text-white rounded-xl shadow-lg px-4 py-3 flex items-start gap-2.5 animate-[fadeIn_0.2s_ease-out]`}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm flex-1">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
