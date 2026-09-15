import { NavLink } from "react-router-dom"
import { LogOut, Store } from "lucide-react"
import { navItems } from "./navConfig"
import { useAuth } from "../../context/AuthContext"

export default function Sidebar() {
  const { user, logout, isOwner } = useAuth()
  const visibleItems = navItems.filter((item) => item.roles.includes(user?.role))

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 h-screen sticky top-0 bg-primary-800 border-r border-primary-900/40">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/10">
        <div className="h-9 w-9 rounded-xl bg-accent-400 flex items-center justify-center shrink-0">
          <Store className="h-5 w-5 text-primary-900" />
        </div>
        <div>
          <p className="font-bold text-white leading-tight">{user?.shopName || "Grocery Shop"}</p>
          <p className="text-xs text-primary-100 leading-tight">SinhalaPOS</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-1">
        {visibleItems.map(({ to, label, labelSi, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 pl-3.5 pr-3 py-2.5 rounded-xl text-sm font-medium transition-colors group ${
                isActive
                  ? "bg-primary-700 text-white before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-full before:bg-accent-400"
                  : "text-primary-50 hover:bg-primary-700/50 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-accent-400" : "text-primary-100 group-hover:text-white"}`} />
                <span className="flex-1">{label}</span>
                <span className="text-[11px] text-primary-200 font-sinhala hidden xl:inline">{labelSi}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-9 w-9 rounded-full bg-accent-400 text-primary-900 flex items-center justify-center font-semibold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-primary-100 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full mt-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-50 hover:bg-danger-600/20 hover:text-danger-200 transition-colors focus-ring"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  )
}