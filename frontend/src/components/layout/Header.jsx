import { RefreshCw, Menu } from "lucide-react"

export default function Header({ title, subtitle, onRefresh, refreshing, onMenuClick }) {
  const today = new Date().toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  return (
    <header className="sticky top-0 z-20 bg-primary-800 border-b border-white/10">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onMenuClick} className="lg:hidden text-primary-100 hover:text-white focus-ring rounded-lg p-1 shrink-0">
            <Menu className="h-6 w-6" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{title}</h1>
            <p className="text-xs text-primary-200 truncate">{subtitle || today}</p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-primary-100 border border-white/15 hover:bg-primary-700 focus-ring shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>
    </header>
  )
}