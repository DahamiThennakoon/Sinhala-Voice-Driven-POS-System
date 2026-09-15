import { Minus, Plus, Trash2 } from "lucide-react"

export default function CartItem({ line, onInc, onDec, onRemove }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-sinhala font-medium text-gray-900 truncate">{line.name}</p>
        <p className="text-xs text-gray-400">Rs. {line.sellingPrice} / {line.unit}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={() => onDec(line.id)} className="h-7 w-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 focus-ring">
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-7 text-center text-sm font-semibold">{line.qty}</span>
        <button onClick={() => onInc(line.id)} className="h-7 w-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 focus-ring">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="w-20 text-right font-semibold text-gray-900 shrink-0">Rs. {(line.qty * line.sellingPrice).toLocaleString()}</p>
      <button onClick={() => onRemove(line.id)} className="text-gray-300 hover:text-danger-600 focus-ring shrink-0">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
