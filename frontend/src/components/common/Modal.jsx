import { X } from "lucide-react"

export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
  if (!open) return null
  const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white w-full ${widths[size]} rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto scrollbar-thin`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus-ring rounded-lg p-1">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
