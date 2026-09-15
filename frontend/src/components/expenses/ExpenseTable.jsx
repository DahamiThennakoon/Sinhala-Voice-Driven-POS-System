import { Receipt, Pencil, Trash2 } from "lucide-react"
import EmptyState from "../common/EmptyState"

export default function ExpenseTable({ expenses, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return <EmptyState icon={Receipt} title="No expenses recorded" description="Add an expense to start tracking your outgoings." />
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
            <th className="font-medium px-4 py-3">Date</th>
            <th className="font-medium px-4 py-3">Category</th>
            <th className="font-medium px-4 py-3">Note</th>
            <th className="font-medium px-4 py-3 text-right">Amount</th>
            <th className="font-medium px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/60">
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{e.date}</td>
              <td className="px-4 py-3 font-sinhala font-medium text-gray-800">{e.category}</td>
              <td className="px-4 py-3 text-gray-500">{e.note || "—"}</td>
              <td className="px-4 py-3 text-right font-semibold text-danger-600">Rs. {Number(e.amount).toLocaleString()}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <button onClick={() => onEdit(e)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 focus-ring">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDelete(e)} className="p-1.5 rounded-lg text-gray-400 hover:text-danger-600 hover:bg-danger-50 focus-ring">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
