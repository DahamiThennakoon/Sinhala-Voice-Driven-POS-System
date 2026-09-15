import { useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Plus, Search } from "lucide-react"
import Header from "../components/layout/Header"
import Card from "../components/common/Card"
import Button from "../components/common/Button"
import LoadingSpinner from "../components/common/LoadingSpinner"
import ItemTable from "../components/items/ItemTable"
import ItemFormModal from "../components/items/ItemFormModal"
import { fetchItems, createItem, updateItem, deleteItem } from "../api"
import { useToast } from "../components/common/Toast"
import { mockItemCategories } from "../mock/mockData"

export default function Items() {
  const { openMobileNav } = useOutletContext()
  const { push } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = async () => {
    setLoading(true)
    try { setItems(await fetchItems()) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(
    () => items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const openAdd = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (item) => { setEditing(item); setModalOpen(true) }

  const save = async (form) => {
    try {
      if (editing) {
        await updateItem(editing.id, form)
        push("Item updated", "success")
      } else {
        await createItem(form)
        push("Item added", "success")
      }
      setModalOpen(false)
      load()
    } catch {
      push("Couldn't save the item", "error")
    }
  }

  const remove = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return
    try {
      await deleteItem(item.id)
      push("Item deleted", "success")
      load()
    } catch {
      push("Couldn't delete the item", "error")
    }
  }

  return (
    <>
      <Header title="Items" subtitle="භාණ්ඩ කළමනාකරණය" onMenuClick={openMobileNav} />
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        <Card padding="p-0">
          <div className="p-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-ring"
              />
            </div>
            <Button icon={Plus} onClick={openAdd}>Add Item</Button>
          </div>
          {loading ? <LoadingSpinner label="Loading items..." /> : <ItemTable items={filtered} onEdit={openEdit} onDelete={remove} />}
        </Card>
      </main>

      <ItemFormModal
        open={modalOpen} onClose={() => setModalOpen(false)} onSave={save}
        initial={editing}
        categories={[...new Set([...mockItemCategories, ...items.map((i) => i.category).filter(Boolean)])]}
      />
    </>
  )
}
