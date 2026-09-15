import { Banknote, MoreHorizontal } from "lucide-react"

const methods = [
  { id: "Cash", label: "Cash", icon: Banknote },
  { id: "Other", label: "Other", icon: MoreHorizontal },
]

export default function PaymentSection({ value, onChange }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">Payment method</p>
      <div className="grid grid-cols-2 gap-2">
        {methods.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-colors focus-ring
              ${value === id ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
    </div>
  )
}