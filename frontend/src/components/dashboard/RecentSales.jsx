import Card from "../common/Card"
import EmptyState from "../common/EmptyState"
import StatusBadge from "../common/StatusBadge"
import Button from "../common/Button"
import { Receipt } from "lucide-react"
import { Link } from "react-router-dom"

export default function RecentSales({ data = [] }) {
  return (
    <Card padding="p-0">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <h3 className="font-semibold text-gray-900">Recent Sales</h3>
        <Link to="/sales-history"><Button size="sm" variant="ghost">View All Sales</Button></Link>
      </div>
      {data.length === 0 ? (
        <div className="pb-5"><EmptyState icon={Receipt} title="No sales recorded yet" description="Sales made through the POS screen will show up here." /></div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-t border-gray-100">
                <th className="font-medium px-5 py-2.5">Time</th>
                <th className="font-medium px-5 py-2.5">Item</th>
                <th className="font-medium px-5 py-2.5">Qty</th>
                <th className="font-medium px-5 py-2.5">Total</th>
                <th className="font-medium px-5 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 6).map((s) => (
                <tr key={s.id} className="border-t border-gray-50">
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{s.datetime || s.date}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{s.item}</td>
                  <td className="px-5 py-3 text-gray-600">{s.quantity}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">Rs. {Number(s.total).toLocaleString()}</td>
                  <td className="px-5 py-3"><StatusBadge label={s.status || "Paid"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
