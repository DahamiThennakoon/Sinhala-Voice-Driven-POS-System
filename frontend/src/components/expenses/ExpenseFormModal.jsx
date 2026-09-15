import { useEffect, useState } from "react"
import Modal from "../common/Modal"
import Input from "../common/Input"
import Select from "../common/Select"
import Button from "../common/Button"

const blank = (categories) => ({ category: categories[0] || "", amount: "", note: "", date: new Date().toISOString().slice(0, 10) })

export default function ExpenseFormModal({ open, onClose, onSave, categories, initial }) {
  const [form, setForm] = useState(blank(categories))

  useEffect(() => {
    if (open) setForm(initial ? { ...initial } : blank(categories))
  }, [open, initial])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = () => {
    if (!form.amount) return
    onSave({ ...form, amount: Number(form.amount) })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Expense" : "Add Expense"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>{initial ? "Save changes" : "Save expense"}</Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <Select label="Category" value={form.category} onChange={set("category")}>
          <option value="">Select category</option>
          <option value="බඩු මිලදී ගැනීම">බඩු මිලදී ගැනීම</option>
          <option value="විදුලි බිල්">විදුලි බිල්</option>
          <option value="ප්‍රවාහන වියදම්">ප්‍රවාහන වියදම්</option>
          <option value="සේවක වැටුප්">සේවක වැටුප්</option>
          <option value="වෙනත්">වෙනත්</option>
        </Select>
        <Input label="Amount (Rs.)" type="number" value={form.amount} onChange={set("amount")} placeholder="0.00" />
        <Input label="Note" value={form.note} onChange={set("note")} placeholder="Optional note" />
        <Input label="Date" type="date" value={form.date} onChange={set("date")} />
      </div>
    </Modal>
  )
}
