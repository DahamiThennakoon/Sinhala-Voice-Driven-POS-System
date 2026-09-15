import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Store } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import Input from "../components/common/Input"
import Button from "../components/common/Button"
import { useToast } from "../components/common/Toast"

export default function Register() {
  const { register } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", shopName: "", email: "", password: "", role: "owner" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const isOwner = form.role === "owner"

  const submit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const payload = isOwner ? form : { ...form, shopName: "" }
      const session = await register(payload)
      push(`Account created — welcome, ${session.name}!`, "success")
      navigate(session.role === "owner" ? "/dashboard" : "/pos")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-paper px-4 py-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{ backgroundImage: "url('/dashboard.jpg')" }}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary-700 flex items-center justify-center shadow-lg shadow-primary-900/20 mb-3">
            <Store className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-primary-900">Create your account</h1>
        </div>

        <form onSubmit={submit} autoComplete="off" className="bg-white rounded-2xl shadow-card border border-primary-900/10 p-6 space-y-4">
          {error && <p className="text-sm text-danger-600 bg-danger-50 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <span className="block text-sm font-medium text-primary-900 mb-1.5">Role</span>
            <div className="grid grid-cols-2 gap-2">
              {["owner", "staff"].map((r) => (
                <button
                  key={r} type="button" onClick={() => setForm((f) => ({ ...f, role: r }))}
                  className={`py-2.5 rounded-xl border text-sm font-medium capitalize transition-colors
                    ${form.role === r ? "border-primary-500 bg-primary-50 text-primary-700" : "border-primary-900/15 text-primary-500"}`}
                >
                  {r === "staff" ? "Cashier" : "Owner"}
                </button>
              ))}
            </div>
          </div>

          <Input label="Full name" required value={form.name} onChange={set("name")} placeholder="Nimal Perera" autoComplete="off" />

          {isOwner && (
            <Input label="Shop name" required value={form.shopName} onChange={set("shopName")} placeholder="Perera Stores" autoComplete="off" />
          )}

          <Input label="Email" type="email" required value={form.email} onChange={set("email")} placeholder="you@shop.lk" autoComplete="off" />
          <Input label="Password" type="password" required value={form.password} onChange={set("password")} placeholder="At least 6 characters" minLength={6} autoComplete="new-password" />

          <Button type="submit" className="w-full" size="lg" loading={loading}>Create account</Button>
        </form>

        <p className="text-center text-sm text-white/90 mt-5">
          Already have an account? <Link to="/login" className="text-accent-400 font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}