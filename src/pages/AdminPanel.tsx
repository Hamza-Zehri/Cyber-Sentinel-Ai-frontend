import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiRequest, type UserAdmin, type RoleEntry, type AuditLogEntry, type PaginatedResponse } from "../lib/api"
import { Users, Shield, FileText, UserCheck, UserX, CheckCircle, XCircle } from "lucide-react"

type Tab = "users" | "roles" | "audit-logs"

function Badge({ label, variant }: { label: string; variant?: "green" | "red" | "amber" | "blue" }) {
  const colors = {
    green: "bg-signal/20 text-signal border-signal/30",
    red: "bg-alert-red/20 text-alert-red border-alert-red/30",
    amber: "bg-alert-amber/20 text-alert-amber border-alert-amber/30",
    blue: "bg-alert-blue/20 text-alert-blue border-alert-blue/30",
  }
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${colors[variant || "blue"]}`}>
      {label}
    </span>
  )
}

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("users")
  const [logPage, setLogPage] = useState(1)
  const [logModule, setLogModule] = useState("")
  const queryClient = useQueryClient()

  const { data: users } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiRequest<UserAdmin[]>("/api/v1/admin/users"),
  })

  const { data: roles } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: () => apiRequest<RoleEntry[]>("/api/v1/admin/roles"),
  })

  const { data: logs } = useQuery({
    queryKey: ["admin", "audit-logs", logPage, logModule],
    queryFn: () => {
      let url = `/api/v1/admin/audit-logs?page=${logPage}&page_size=30`
      if (logModule) url += `&module=${logModule}`
      return apiRequest<PaginatedResponse<AuditLogEntry>>(url)
    },
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      apiRequest<UserAdmin>(`/api/v1/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  })

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "users", label: "Users", icon: Users },
    { key: "roles", label: "Roles", icon: Shield },
    { key: "audit-logs", label: "Audit Logs", icon: FileText },
  ]

  const countRoles = (name: string) => users?.filter((u) => u.role === name).length ?? 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-soc-400 text-sm mt-1">User management, roles, and audit logs</p>
      </div>

      <div className="flex gap-1 bg-soc-800 rounded-xl p-1 border border-soc-700 w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? "bg-signal text-soc-900" : "text-soc-400 hover:text-soc-100"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="bg-soc-800 rounded-xl border border-soc-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-soc-700 text-soc-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Name</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Role</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Verified</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => (
                  <tr key={u.id} className="border-b border-soc-700/50 hover:bg-soc-700/20">
                    <td className="px-5 py-3 font-medium">{u.full_name}</td>
                    <td className="px-5 py-3 text-soc-400">{u.email}</td>
                    <td className="px-5 py-3"><Badge label={u.role} variant="blue" /></td>
                    <td className="px-5 py-3">
                      {u.is_active ? (
                        <Badge label="Active" variant="green" />
                      ) : (
                        <Badge label="Inactive" variant="red" />
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {u.is_verified ? (
                        <CheckCircle className="w-4 h-4 text-signal" />
                      ) : (
                        <XCircle className="w-4 h-4 text-soc-500" />
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => toggleActive.mutate({ id: u.id, is_active: !u.is_active })}
                        disabled={toggleActive.isPending}
                        className="text-soc-400 hover:text-signal transition-colors disabled:opacity-50"
                        title={u.is_active ? "Deactivate" : "Activate"}
                      >
                        {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "roles" && (
        <div className="grid gap-4">
          {roles?.map((r) => (
            <div key={r.id} className="bg-soc-800 rounded-xl border border-soc-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">{r.name}</h3>
                  <p className="text-xs text-soc-400 mt-0.5">{r.description || "No description"}</p>
                </div>
                <Badge label={`${countRoles(r.name)} users`} variant="amber" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {r.permission_codes.map((pc) => (
                  <Badge key={pc} label={pc} />
                ))}
                {r.permission_codes.length === 0 && (
                  <span className="text-xs text-soc-500">No permissions assigned</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "audit-logs" && (
        <div className="bg-soc-800 rounded-xl border border-soc-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-soc-700 flex items-center gap-3">
            <span className="text-xs text-soc-400 uppercase tracking-wider font-medium">Filter by module</span>
            <select
              value={logModule}
              onChange={(e) => { setLogModule(e.target.value); setLogPage(1) }}
              className="bg-soc-700 border border-soc-600 rounded-lg px-3 py-1.5 text-sm text-soc-100 outline-none"
            >
              <option value="">All</option>
              <option value="auth">Auth</option>
              <option value="admin">Admin</option>
              <option value="reports">Reports</option>
              <option value="settings">Settings</option>
              <option value="backups">Backups</option>
            </select>
            <div className="flex-1" />
            <span className="text-xs text-soc-500">{logs?.total ?? "—"} total entries</span>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-soc-700 text-soc-400 text-xs uppercase tracking-wider sticky top-0 bg-soc-800">
                  <th className="text-left px-5 py-3 font-medium">Time</th>
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Module</th>
                  <th className="text-left px-5 py-3 font-medium">Action</th>
                  <th className="text-left px-5 py-3 font-medium">Result</th>
                  <th className="text-left px-5 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs?.items?.map((log) => (
                  <tr key={log.id} className="border-b border-soc-700/50 hover:bg-soc-700/20">
                    <td className="px-5 py-3 mono text-xs text-soc-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-soc-400">{log.user_email || log.user_id?.slice(0, 8) || "—"}</td>
                    <td className="px-5 py-3"><Badge label={log.module} /></td>
                    <td className="px-5 py-3 font-mono text-xs">{log.action}</td>
                    <td className="px-5 py-3">
                      <Badge
                        label={log.result}
                        variant={log.result === "success" ? "green" : log.result === "failure" ? "red" : "amber"}
                      />
                    </td>
                    <td className="px-5 py-3 text-xs text-soc-400 max-w-[200px] truncate">{log.details || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {logs && logs.total > logs.page_size && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-soc-700">
              <button
                onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                disabled={logPage <= 1}
                className="text-sm text-soc-400 hover:text-soc-100 disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-soc-500">Page {logPage} of {Math.ceil(logs.total / logs.page_size)}</span>
              <button
                onClick={() => setLogPage((p) => p + 1)}
                disabled={logPage >= Math.ceil(logs.total / logs.page_size)}
                className="text-sm text-soc-400 hover:text-soc-100 disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
