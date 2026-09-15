import Card from "../common/Card"
import EmptyState from "../common/EmptyState"
import { Trophy } from "lucide-react"

export default function TopSellers({ data = [] }) {
  const max = Math.max(...data.map((d) => d.revenue || 0), 1)

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Top Selling Items</h3>
        <span className="text-xs text-gray-400 font-sinhala">වැඩිම විකුණුම්</span>
      </div>
      {data.length === 0 ? (
        <EmptyState icon={Trophy} title="No sales yet" description="Top sellers will appear here once sales come in." />
      ) : (
        <ul className="space-y-3">
          {data.slice(0, 5).map((item, i) => (
            <li key={item.item} className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.item}</p>
                  <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">Rs. {Number(item.revenue).toLocaleString()}</p>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(item.revenue / max) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{item.quantity} sold</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
