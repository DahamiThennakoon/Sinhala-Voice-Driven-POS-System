import { useEffect, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Plus } from "lucide-react"
import Header from "../components/layout/Header"
import Card from "../components/common/Card"
import Button from "../components/common/Button"
import LoadingSpinner from "../components/common/LoadingSpinner"
import ExpenseTable from "../components/expenses/ExpenseTable"
import ExpenseFormModal from "../components/expenses/ExpenseFormModal"
import { fetchExpenses, fetchExpenseCategories, createExpense, updateExpense, deleteExpense } from "../api"
import { useToast } from "../components/common/Toast"

export default function Expenses() {
  const { openMobileNav } = useOutletContext()
  const { push } = useToast()
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [e, c] = await Promise.all([fetchExpenses(), fetchExpenseCategories()])
      setExpenses(e); setCategories(c)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (expense) => { setEditing(expense); setModalOpen(true) }

  const save = async (form) => {
    try {
      if (editing) {
        await updateExpense(editing.id, form)
        push("Expense updated", "success")
      } else {
        await createExpense(form)
        push("Expense added", "success")
      }
      setModalOpen(false)
      load()
    } catch {
      push("Couldn't save the expense", "error")
    }
  }

  const remove = async (expense) => {
    if (!confirm(`Delete this ${expense.category} expense of Rs. ${expense.amount}?`)) return
    try {
      await deleteExpense(expense.id)
      push("Expense deleted", "success")
      load()
    } catch {
      push("Couldn't delete the expense", "error")
    }
  }

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)

  return (
    <>
      <Header title="Expenses" subtitle="වියදම් කළමනාකරණය" onMenuClick={openMobileNav} />
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
        <Card className="flex items-center justify-between">
          <div><p className="text-sm text-gray-400">Total expenses</p><p className="text-2xl font-bold text-danger-600">Rs. {total.toLocaleString()}</p></div>
          <Button icon={Plus} onClick={openAdd}>Add Expense</Button>
        </Card>

        <Card padding="p-0">
          {loading ? <LoadingSpinner label="Loading expenses..." /> : <ExpenseTable expenses={expenses} onEdit={openEdit} onDelete={remove} />}
        </Card>
      </main>

      <ExpenseFormModal
        open={modalOpen} onClose={() => setModalOpen(false)} onSave={save}
        categories={categories} initial={editing}
      />
    </>
  )
}
