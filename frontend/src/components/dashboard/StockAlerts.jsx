import Card from "../common/Card"
import EmptyState from "../common/EmptyState"
import Button from "../common/Button"
import { AlertTriangle, PackageCheck } from "lucide-react"
import { Link } from "react-router-dom"

export default function StockAlerts({ data = [] }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Low Stock Alerts</h3>
        <span className="text-xs text-gray-400 font-sinhala">තොග දැනුම්දීම්</span>
      </div>
      {data.length === 0 ? (
        <EmptyState icon={PackageCheck} title="All stocked up" description="No items are running low right now." />
      ) : (
        <ul className="space-y-2.5">
          {data.map((s) => (
            <li key={s.item} className="flex items-center gap-3 p-3 rounded-xl bg-warning-50/60 border border-warning-100">
              <div className="h-9 w-9 rounded-lg bg-warning-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4.5 w-4.5 text-warning-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{s.item}</p>
                <p className="text-xs text-gray-500">
                  {s.quantity} {s.unit} left · min {s.threshold} {s.unit}
                </p>
              </div>
              <Link to="/stock">
                <Button size="sm" variant="outline">Restock</Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
