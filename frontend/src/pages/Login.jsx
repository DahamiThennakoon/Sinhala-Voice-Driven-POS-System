import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Store, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import Input from "../components/common/Input"
import Button from "../components/common/Button"
import { useToast } from "../components/common/Toast"

export default function Login() {
  const { login } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: "", password: "" })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const session = await login(form)
      push(`Welcome back, ${session.name}!`, "success")
      navigate(session.role === "owner" ? "/dashboard" : "/pos")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-paper px-4 overflow-hidden">
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
          <h1 className="text-xl font-bold text-primary-900">SinhalaPOS</h1>
          <p className="text-sm text-primary-600/70 font-sinhala mt-1">සිංහල හඬ POS පද්ධතිය</p>
        </div>

        <form onSubmit={submit} autoComplete="off" className="bg-white rounded-2xl shadow-card border border-primary-900/10 p-6 space-y-4">
          <h2 className="font-semibold text-primary-900 text-lg mb-1">Log in</h2>
          {error && <p className="text-sm text-danger-600 bg-danger-50 rounded-lg px-3 py-2">{error}</p>}
          <Input label="Email" type="email" required value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} 
            placeholder="you@shop.lk"
            autoComplete="off" />
          <div className="relative">
            <Input label="Password" type={showPw ? "text" : "password"} required value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} 
              placeholder="••••••••"
              autoComplete="new-password" />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-[38px] text-primary-400">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button type="submit" className="w-full" size="lg" loading={loading}>Log in</Button>
        </form>

        <p className="text-center text-sm text-white/90 mt-5">
          Don't have an account? <Link to="/register" className="text-accent-400 font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}