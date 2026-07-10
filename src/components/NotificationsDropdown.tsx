import { useState, useRef, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiRequest, type NotificationItem } from "../lib/api"
import { Bell, CheckCheck } from "lucide-react"
import { cn } from "../lib/utils"

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data: unread } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => apiRequest<{ unread_count: number }>("/api/v1/notifications/unread-count"),
    refetchInterval: 15000,
  })

  const { data: notifs } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => apiRequest<{ total: number; items: NotificationItem[] }>("/api/v1/notifications?page_size=10"),
    enabled: open,
  })

  const markAllRead = useMutation({
    mutationFn: () => apiRequest<{ status: string }>("/api/v1/notifications/mark-all-read", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-soc-400 hover:text-soc-100 hover:bg-soc-700/50 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread && unread.unread_count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-alert-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread.unread_count > 9 ? "9+" : unread.unread_count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-soc-800 border border-soc-700 rounded-xl shadow-xl z-50 max-h-96 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-soc-700">
            <span className="text-sm font-semibold">Notifications</span>
            <button
              onClick={() => markAllRead.mutate()}
              className="flex items-center gap-1 text-xs text-soc-400 hover:text-signal transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {!notifs?.items?.length ? (
              <p className="text-sm text-soc-500 text-center py-8">No notifications</p>
            ) : (
              notifs.items.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "px-4 py-3 border-b border-soc-700/50 hover:bg-soc-700/30 transition-colors",
                    !n.is_read && "bg-signal/5"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                      !n.is_read ? "bg-signal" : "bg-soc-600"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-soc-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-soc-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
