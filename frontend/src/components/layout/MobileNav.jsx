import { NavLink } from "react-router-dom"
import { X, Store, LogOut } from "lucide-react"
import { navItems } from "./navConfig"
import { useAuth } from "../../context/AuthContext"

export default function MobileNav({ open, onClose }) {
  const { user, logout } = useAuth()
  const visibleItems = navItems.filter((item) => item.roles.includes(user?.role))

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col animate-[fadeIn_0.15s_ease-out]">
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <p className="font-bold text-gray-900">SinhalaPOS</p>
          </div>
          <button onClick={onClose} className="text-gray-400 p-1"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {visibleItems.map(({ to, label, labelSi, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium ${
                  isActive ? "bg-primary-50 text-primary-700" : "text-gray-600"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{label}</span>
              <span className="text-[11px] text-gray-400 font-sinhala">{labelSi}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-medium text-danger-600">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </div>
    </div>
  )
}
