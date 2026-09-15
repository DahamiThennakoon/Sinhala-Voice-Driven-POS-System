import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/layout/Sidebar"
import MobileNav from "../components/layout/MobileNav"

export default function AppLayout() {
  const [navOpen, setNavOpen] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <Sidebar />
      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="relative flex-1 min-w-0 overflow-y-auto">
        <div
          className="fixed inset-0 lg:left-64 bg-cover bg-center opacity-[0.56] pointer-events-none"
          style={{ backgroundImage: "url('/dashboard.jpg')" }}
          aria-hidden="true"
        />
        <div className="relative">
          <Outlet context={{ openMobileNav: () => setNavOpen(true) }} />
        </div>
      </div>
    </div>
  )
}