import { Boxes } from "lucide-react"
import StatusBadge from "../common/StatusBadge"
import Button from "../common/Button"
import EmptyState from "../common/EmptyState"

function stockStatus(item) {
  if (item.stock <= 0) return "Out of Stock"
  if (item.stock <= item.lowStockThreshold) return "Low Stock"
  return "In Stock"
}

export default function StockTable({ items, onAdjust }) {
  if (items.length === 0) {
    return <EmptyState icon={Boxes} title="No stock data" description="Add items first to start tracking stock levels." />
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
            <th className="font-medium px-4 py-3">Item</th>
            <th className="font-medium px-4 py-3">Current Stock</th>
            <th className="font-medium px-4 py-3">Unit</th>
            <th className="font-medium px-4 py-3">Minimum Stock</th>
            <th className="font-medium px-4 py-3">Status</th>
            <th className="font-medium px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/60">
              <td className="px-4 py-3 font-sinhala font-medium text-gray-900 whitespace-nowrap">{item.name}</td>
              <td className="px-4 py-3 font-semibold text-gray-800">{item.stock}</td>
              <td className="px-4 py-3 text-gray-500">{item.unit}</td>
              <td className="px-4 py-3 text-gray-500">{item.lowStockThreshold}</td>
              <td className="px-4 py-3"><StatusBadge label={stockStatus(item)} /></td>
              <td className="px-4 py-3 text-right">
                <Button size="sm" variant="outline" onClick={() => onAdjust(item)}>Update stock</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
