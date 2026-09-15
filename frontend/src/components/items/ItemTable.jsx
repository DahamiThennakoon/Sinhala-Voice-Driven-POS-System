import { Pencil, Trash2, Package } from "lucide-react"
import StatusBadge from "../common/StatusBadge"
import EmptyState from "../common/EmptyState"

function stockStatus(item) {
  if (item.stock <= 0) return "Out of Stock"
  if (item.stock <= item.lowStockThreshold) return "Low Stock"
  return "In Stock"
}

export default function ItemTable({ items, onEdit, onDelete }) {
  if (items.length === 0) {
    return <EmptyState icon={Package} title="No items yet" description="Add your first item to start building your catalog." />
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
            <th className="font-medium px-4 py-3">Item</th>
            <th className="font-medium px-4 py-3">Category</th>
            <th className="font-medium px-4 py-3">Selling Price</th>
            <th className="font-medium px-4 py-3">Stock</th>
            <th className="font-medium px-4 py-3">Unit</th>
            <th className="font-medium px-4 py-3">Status</th>
            <th className="font-medium px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/60">
              <td className="px-4 py-3 font-sinhala font-medium text-gray-900 whitespace-nowrap">{item.name}</td>
              <td className="px-4 py-3 text-gray-500">{item.category}</td>
              <td className="px-4 py-3 font-semibold text-gray-800">Rs. {item.sellingPrice}</td>
              <td className="px-4 py-3 text-gray-700">{item.stock}</td>
              <td className="px-4 py-3 text-gray-500">{item.unit}</td>
              <td className="px-4 py-3"><StatusBadge label={stockStatus(item)} /></td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 focus-ring">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-danger-600 hover:bg-danger-50 focus-ring">
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
