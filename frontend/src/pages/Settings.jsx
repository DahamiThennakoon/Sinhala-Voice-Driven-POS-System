import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import Header from "../components/layout/Header"
import Card from "../components/common/Card"
import Input from "../components/common/Input"
import Select from "../components/common/Select"
import Button from "../components/common/Button"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../components/common/Toast"
import { fetchSettings, updateSettings } from "../api"

export default function Settings() {
  const { openMobileNav } = useOutletContext()
  const { user,updateUser } = useAuth()
  const { push } = useToast()
  const [form, setForm] = useState({
    shopName: user?.shopName || "", ownerName: user?.name || "",
    currency: "LKR (Rs.)", lowStockThreshold: 10, language: "Sinhala + English",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings().then((data) => {
      setForm((f) => ({ ...f, ...data }))
      setLoading(false)
    })
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings(form)
      updateUser({ shopName: form.shopName, name: form.ownerName })
      push("Settings saved", "success")
    } catch (err) {
      push("Failed to save settings — nothing was changed.", "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Header title="Settings" subtitle="සැකසුම්" onMenuClick={openMobileNav} />
      <main className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Shop details</h3>
          <div className="space-y-3.5">
            <Input label="Shop name" value={form.shopName} onChange={set("shopName")} disabled={loading} />
            <Input label="Owner name" value={form.ownerName} onChange={set("ownerName")} disabled={loading} />
            <Select label="Currency" value={form.currency} onChange={set("currency")} disabled={loading}>
              <option>LKR (Rs.)</option>
              <option>USD ($)</option>
            </Select>
            <Input label="Default low-stock threshold" type="number" value={form.lowStockThreshold} onChange={set("lowStockThreshold")} disabled={loading} />
            <Select label="Language" value={form.language} onChange={set("language")} disabled={loading}>
              <option>Sinhala + English</option>
              <option>Sinhala only</option>
              <option>English only</option>
            </Select>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Account</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="font-medium capitalize">{user?.role}</span></div>
          </div>
        </Card>

        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </main>
    </>
  )
}