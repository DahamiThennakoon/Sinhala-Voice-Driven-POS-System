import { useEffect, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import Header from "../components/layout/Header"
import SummaryCard from "../components/dashboard/SummaryCard"
import TopSellers from "../components/dashboard/TopSellers"
import StockAlerts from "../components/dashboard/StockAlerts"
import RecentSales from "../components/dashboard/RecentSales"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { fetchDashboard } from "../api"
import { useAuth } from "../context/AuthContext"

export default function Dashboard() {
  const { user } = useAuth()
  const { openMobileNav } = useOutletContext()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const d = await fetchDashboard(new Date().toISOString().slice(0, 10))
      setData(d)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <>
      <Header
        title={`Welcome, ${user?.name?.split(" ")[0] || "there"} 👋`}
        onRefresh={() => load(true)}
        refreshing={refreshing}
        onMenuClick={openMobileNav}
      />
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        {loading ? (
          <LoadingSpinner full label="Loading dashboard..." />
        ) : (
          <div className="space-y-6">
            {/* Stat cards sit on a softly blurred backdrop */}
            <div className="relative rounded-2xl overflow-hidden p-4 sm:p-5">
              <div
                className="absolute inset-0 bg-cover bg-center scale-110 blur-md opacity-40"
                style={{ backgroundImage: "url('/dashboard.jpeg')" }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-paper/70" aria-hidden="true" />
              <div className="relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <SummaryCard label="Today's Income" value={data.todayIncome} icon={TrendingUp} tone="success" />
                <SummaryCard label="Today's Expenses" value={data.todayExpense} icon={TrendingDown} tone="danger" />
                <SummaryCard label="Today's Profit" value={data.todayProfit} icon={DollarSign} tone="primary" />
                <SummaryCard label="Monthly Income" value={data.monthlyIncome} icon={Wallet} tone="warning" hint="This month, all sales" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <TopSellers data={data.topSellers} />
              <StockAlerts data={data.lowStock} />
            </div>

            <RecentSales data={data.recentSales} />
          </div>
        )}
      </main>
    </>
  )
}