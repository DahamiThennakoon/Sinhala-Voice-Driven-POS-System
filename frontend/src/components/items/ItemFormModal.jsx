import { useEffect, useState } from "react"
import Modal from "../common/Modal"
import Input from "../common/Input"
import Select from "../common/Select"
import Button from "../common/Button"

const blank = { name: "", category: "", costPrice: "", sellingPrice: "", stock: "", unit: "kg", lowStockThreshold: "" }

export default function ItemFormModal({ open, onClose, onSave, initial, categories }) {
  const [form, setForm] = useState(blank)

  useEffect(() => setForm(initial ? { ...initial } : blank), [initial, open])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = () => {
    if (!form.name || !form.sellingPrice) return
    onSave({
      ...form,
      costPrice: Number(form.costPrice) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
      stock: Number(form.stock) || 0,
      lowStockThreshold: Number(form.lowStockThreshold) || 0,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Item" : "Add Item"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>{initial ? "Save changes" : "Add item"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3.5">
        <div className="col-span-2"><Input label="Item name" value={form.name} onChange={set("name")} placeholder="සහල්" /></div>
        <Select label="Category" value={form.category} onChange={set("category")}>
          <option value="">Select category</option>
          <option value="ධාන්‍ය">ධාන්‍ය</option>
          <option value="බේකරි">බේකරි</option>
          <option value="එළවළු">එළවළු</option>
          <option value="පාන වර්ග">පාන වර්ග</option>
          <option value="වියළි බඩු">වියළි බඩු</option>
          <option value="කිරි නිෂ්පාදන">කිරි නිෂ්පාදන</option>
          <option value="සුලු ආහාර">සුලු ආහාර</option>
          <option value="පිරිසිදුකරණ">පිරිසිදුකරණ</option>
          <option value="වෙනත්">වෙනත්</option>
        </Select>
        <Select label="Unit" value={form.unit} onChange={set("unit")}>
          <option value="kg">kg</option>
          <option value="piece">piece</option>
          <option value="liter">liter</option>
          <option value="g">g</option>
        </Select>
        <Input label="Cost price (Rs.)" type="number" value={form.costPrice} onChange={set("costPrice")} />
        <Input label="Selling price (Rs.)" type="number" value={form.sellingPrice} onChange={set("sellingPrice")} />
        <Input label="Stock quantity" type="number" value={form.stock} onChange={set("stock")} />
        <Input label="Low-stock threshold" type="number" value={form.lowStockThreshold} onChange={set("lowStockThreshold")} />
      </div>
    </Modal>
  )
}
