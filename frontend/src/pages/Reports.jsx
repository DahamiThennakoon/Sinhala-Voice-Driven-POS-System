import { useEffect, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import Header from "../components/layout/Header"
import Card from "../components/common/Card"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { fetchReports } from "../api"

export default function Reports() {
  const { openMobileNav } = useOutletContext()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => { try { setData(await fetchReports()) } finally { setLoading(false) } })()
  }, [])

  return (
    <>
      <Header title="Reports" subtitle="වාර්තා" onMenuClick={openMobileNav} />
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
        {loading ? <LoadingSpinner full label="Loading reports..." /> : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card><p className="text-xs text-gray-400">Monthly Income</p><p className="text-xl font-bold text-success-700 mt-1">Rs. {data.monthlySummary.income.toLocaleString()}</p></Card>
              <Card><p className="text-xs text-gray-400">Monthly Expenses</p><p className="text-xl font-bold text-danger-700 mt-1">Rs. {data.monthlySummary.expenses.toLocaleString()}</p></Card>
              <Card><p className="text-xs text-gray-400">Monthly Profit</p><p className="text-xl font-bold text-primary-700 mt-1">Rs. {data.monthlySummary.profit.toLocaleString()}</p></Card>
            </div>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Daily Sales vs Expenses (this week)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => `Rs. ${v.toLocaleString()}`} contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9" }} />
                    <Bar dataKey="sales" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Sales" />
                    <Bar dataKey="expenses" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </>
        )}
      </main>
    </>
  )
}
