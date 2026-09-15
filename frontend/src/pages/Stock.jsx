import { useEffect, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Boxes, AlertTriangle, PackageX, Wallet } from "lucide-react"
import Header from "../components/layout/Header"
import Card from "../components/common/Card"
import LoadingSpinner from "../components/common/LoadingSpinner"
import StockTable from "../components/stock/StockTable"
import StockAdjustModal from "../components/stock/StockAdjustModal"
import { fetchItems, updateStock } from "../api"
import { useToast } from "../components/common/Toast"

function StatTile({ icon: Icon, label, value, tone }) {
  const tones = {
    primary: "bg-primary-50 text-primary-600", warning: "bg-warning-50 text-warning-600",
    danger: "bg-danger-50 text-danger-600", success: "bg-success-50 text-success-600",
  }
  return (
    <Card className="flex items-center gap-3.5">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
      <div><p className="text-xs text-gray-400">{label}</p><p className="text-xl font-bold text-gray-900">{value}</p></div>
    </Card>
  )
}

export default function Stock() {
  const { openMobileNav } = useOutletContext()
  const { push } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [adjustItem, setAdjustItem] = useState(null)

  const load = async () => {
    setLoading(true)
    try { setItems(await fetchItems()) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const lowStock = items.filter((i) => i.stock > 0 && i.stock <= i.lowStockThreshold).length
  const outOfStock = items.filter((i) => i.stock <= 0).length
  const totalValue = items.reduce((s, i) => s + i.stock * (i.costPrice || i.sellingPrice || 0), 0)

  const save = async (item, newTotal, reason) => {
    try {
      await updateStock(item.name, newTotal, item.lowStockThreshold)
      push(`${item.name} stock updated to ${newTotal} ${item.unit} (${reason})`, "success")
      setAdjustItem(null)
      load()
    } catch {
      push("Couldn't update stock", "error")
    }
  }

  return (
    <>
      <Header title="Stock" subtitle="තොග කළමනාකරණය" onMenuClick={openMobileNav} />
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile icon={Boxes} label="Total items" value={items.length} tone="primary" />
          <StatTile icon={AlertTriangle} label="Low-stock items" value={lowStock} tone="warning" />
          <StatTile icon={PackageX} label="Out-of-stock items" value={outOfStock} tone="danger" />
          <StatTile icon={Wallet} label="Total stock value" value={`Rs. ${totalValue.toLocaleString()}`} tone="success" />
        </div>

        <Card padding="p-0">
          {loading ? <LoadingSpinner label="Loading stock..." /> : <StockTable items={items} onAdjust={setAdjustItem} />}
        </Card>
      </main>

      <StockAdjustModal open={!!adjustItem} onClose={() => setAdjustItem(null)} item={adjustItem} onSave={save} />
    </>
  )
}
