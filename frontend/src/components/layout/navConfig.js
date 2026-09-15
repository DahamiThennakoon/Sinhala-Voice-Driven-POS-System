import {
  LayoutDashboard, ShoppingCart, Package, Boxes, Receipt,
  History, BarChart3, Settings,
} from "lucide-react"

// roles: which account roles can see this nav item
export const navItems = [
  { to: "/dashboard", label: "Dashboard", labelSi: "උපකරණ පුවරුව", icon: LayoutDashboard, roles: ["owner"] },
  { to: "/pos", label: "New Sale", labelSi: "විකුණුම්", icon: ShoppingCart, roles: ["owner", "admin"] },
  { to: "/items", label: "Items", labelSi: "භාණ්ඩ", icon: Package, roles: ["owner"] },
  { to: "/stock", label: "Stock", labelSi: "තොග", icon: Boxes, roles: ["owner", "admin"] },
  { to: "/expenses", label: "Expenses", labelSi: "වියදම්", icon: Receipt, roles: ["owner", "admin"] },
  { to: "/sales-history", label: "Sales History", labelSi: "විකුණුම් ඉතිහාසය", icon: History, roles: ["owner", "admin"] },
  { to: "/reports", label: "Reports", labelSi: "වාර්තා", icon: BarChart3, roles: ["owner"] },
  { to: "/settings", label: "Settings", labelSi: "සැකසුම්", icon: Settings, roles: ["owner"] },
]
