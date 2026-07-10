import { useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "../lib/auth-context"
import { cn } from "../lib/utils"
import { NotificationsDropdown } from "./NotificationsDropdown"
import { apiRequest, type InterfaceInfo } from "../lib/api"
import {
  Shield,
  LayoutDashboard,
  Network,
  Bell,
  Bot,
  LogOut,
  Menu,
  X,
  User,
  FileText,
  Settings2,
  ShieldAlert,
  Wifi,
  KeyRound,
} from "lucide-react"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/network", label: "Network Monitor", icon: Network },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/credentials", label: "Credential Sniffer", icon: KeyRound },
  { to: "/ai-tools", label: "AI Security", icon: Bot },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/admin", label: "Admin Panel", icon: ShieldAlert },
  { to: "/settings", label: "Settings", icon: Settings2 },
  { to: "/profile", label: "Profile", icon: User },
]

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: ifaces } = useQuery({
    queryKey: ["network-interfaces"],
    queryFn: () => apiRequest<InterfaceInfo[]>("/api/v1/network/interfaces"),
    refetchInterval: 5000,
  })
  const usbDongle = ifaces?.find((i) => i.name.toLowerCase().includes("wi-fi 2") || i.name.toLowerCase().includes("usb"))
  const mainIface = ifaces?.find((i) => i.connected && i.name.toLowerCase().includes("wi-fi"))

  const handleLogout = async () => {
    await logout("")
    navigate("/login")
  }

  return (
    <div className="flex h-screen bg-soc-900">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-soc-800 border-r border-soc-700 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-2 px-6 h-16 border-b border-soc-700">
          <Shield className="w-6 h-6 text-signal" />
          <span className="font-bold text-lg tracking-tight">Cyber Sentinel</span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-soc-700 text-signal font-medium"
                  : "text-soc-300 hover:text-soc-100 hover:bg-soc-700/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-soc-700">
          <div className="flex items-center gap-3 mb-3 px-4">
            <div className="w-8 h-8 rounded-full bg-soc-600 flex items-center justify-center text-xs font-bold">
              {user?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name}</p>
              <p className="text-xs text-soc-400 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-soc-300 hover:text-alert-red hover:bg-soc-700/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-soc-800 border-b border-soc-700 flex items-center px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="text-soc-300 lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4 mr-auto">
            <div className="flex items-center gap-3">
              <Wifi className="w-4 h-4 text-soc-400" />
              {mainIface && (
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${mainIface.connected ? "bg-signal" : "bg-alert-red"}`} />
                  <span className="text-xs text-soc-400">{mainIface.name}</span>
                </div>
              )}
              {usbDongle && (
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${usbDongle.connected ? "bg-signal" : "bg-alert-red"}`} />
                  <span className={`text-xs ${usbDongle.connected ? "text-signal" : "text-alert-red"}`}>{usbDongle.name}</span>
                </div>
              )}
            </div>
          </div>
          <NotificationsDropdown />
        </header>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <button className="absolute top-4 right-4 text-soc-300" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
