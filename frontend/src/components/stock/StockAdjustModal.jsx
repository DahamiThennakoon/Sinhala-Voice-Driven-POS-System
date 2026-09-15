import { useEffect, useState } from "react"
import Modal from "../common/Modal"
import Input from "../common/Input"
import Button from "../common/Button"

export default function StockAdjustModal({ open, onClose, item, onSave }) {
  const [adjustment, setAdjustment] = useState("")
  const [reason, setReason] = useState("New stock")

  useEffect(() => { setAdjustment(""); setReason("New stock") }, [item, open])

  if (!item) return null
  const delta = Number(adjustment) || 0
  const newTotal = Math.max(item.stock + delta, 0)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Update stock — ${item.name}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(item, newTotal, reason)}>Save</Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
          <span className="text-sm text-gray-500">Current</span>
          <span className="font-sinhala font-semibold text-gray-900">{item.name} — {item.stock} {item.unit}</span>
        </div>
        <Input
          label={`Adjustment (${item.unit}) — use negative to reduce`}
          type="number"
          value={adjustment}
          onChange={(e) => setAdjustment(e.target.value)}
          placeholder="+10"
        />
        <Input label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="flex items-center justify-between bg-primary-50 rounded-xl px-4 py-3">
          <span className="text-sm text-primary-700">New total</span>
          <span className="font-bold text-primary-800">{newTotal} {item.unit}</span>
        </div>
      </div>
    </Modal>
  )
}
