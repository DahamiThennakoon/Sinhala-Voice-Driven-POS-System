import { useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Search, X } from "lucide-react"
import Header from "../components/layout/Header"
import Card from "../components/common/Card"
import Select from "../components/common/Select"
import StatusBadge from "../components/common/StatusBadge"
import LoadingSpinner from "../components/common/LoadingSpinner"
import EmptyState from "../components/common/EmptyState"
import Modal from "../components/common/Modal"
import { fetchSalesHistory } from "../api"

export default function SalesHistory() {
  const { openMobileNav } = useOutletContext()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    (async () => { try { setSales(await fetchSalesHistory()) } finally { setLoading(false) } })()
  }, [])

  const filtered = useMemo(() => sales.filter((s) =>
    s.item.toLowerCase().includes(query.toLowerCase()) &&
    (!dateFilter || s.date === dateFilter) &&
    (paymentFilter === "all" || s.paymentMethod === paymentFilter)
  ), [sales, query, dateFilter, paymentFilter])

  return (
    <>
      <Header title="Sales History" subtitle="විකුණුම් ඉතිහාසය" onMenuClick={openMobileNav} />
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search item..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-ring" />
            </div>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus-ring" />
            <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="all">All payment methods</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Other">Other</option>
            </Select>
          </div>
        </Card>

        <Card padding="p-0">
          {loading ? <LoadingSpinner label="Loading sales..." /> : filtered.length === 0 ? (
            <EmptyState icon={Search} title="No sales match your filters" />
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="font-medium px-4 py-3">Sale ID</th>
                    <th className="font-medium px-4 py-3">Date</th>
                    <th className="font-medium px-4 py-3">Item</th>
                    <th className="font-medium px-4 py-3">Qty</th>
                    <th className="font-medium px-4 py-3">Total</th>
                    <th className="font-medium px-4 py-3">Payment</th>
                    <th className="font-medium px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} onClick={() => setSelected(s)} className="border-b border-gray-50 hover:bg-gray-50/60 cursor-pointer">
                      <td className="px-4 py-3 text-gray-400">#{s.id}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.date}</td>
                      <td className="px-4 py-3 font-sinhala font-medium text-gray-800">{s.item}</td>
                      <td className="px-4 py-3 text-gray-600">{s.quantity}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">Rs. {Number(s.total).toLocaleString()}</td>
                      <td className="px-4 py-3"><StatusBadge label={s.paymentMethod} /></td>
                      <td className="px-4 py-3"><StatusBadge label={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Sale #${selected?.id}`}>
        {selected && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{selected.date}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Item</span><span className="font-medium font-sinhala">{selected.item}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Quantity</span><span className="font-medium">{selected.quantity}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment</span><StatusBadge label={selected.paymentMethod} /></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge label={selected.status} /></div>
            <div className="flex justify-between pt-2 border-t border-gray-100"><span className="text-gray-700 font-medium">Total</span><span className="font-bold text-gray-900">Rs. {Number(selected.total).toLocaleString()}</span></div>
          </div>
        )}
      </Modal>
    </>
  )
}
