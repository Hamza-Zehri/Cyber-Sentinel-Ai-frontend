import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiRequest, type Alert, type PaginatedResponse } from "../lib/api"
import { CheckCircle, RefreshCw, AlertTriangle } from "lucide-react"

const severityColor: Record<string, string> = {
  critical: "bg-alert-red/20 text-alert-red border-alert-red/30",
  high: "bg-alert-amber/20 text-alert-amber border-alert-amber/30",
  medium: "bg-alert-blue/20 text-alert-blue border-alert-blue/30",
  low: "bg-soc-700 text-soc-300 border-soc-600",
}

export default function Alerts() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [severityFilter, setSeverityFilter] = useState("")
  const [resolvedFilter, setResolvedFilter] = useState<string>("")

  const { data, isLoading } = useQuery({
    queryKey: ["alerts", page, severityFilter, resolvedFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), page_size: "20" })
      if (severityFilter) params.set("severity", severityFilter)
      if (resolvedFilter) params.set("is_resolved", resolvedFilter)
      return apiRequest<PaginatedResponse<Alert>>(`/api/v1/alerts?${params}`)
    },
    refetchInterval: 10000,
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest<Alert>(`/api/v1/alerts/${id}/resolve`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  })

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 1

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-soc-400 text-sm mt-1">Security alerts detected by the IDS engine</p>
        </div>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ["alerts"] })} className="text-soc-400 hover:text-soc-100">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-3">
        <select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setPage(1) }}
          className="bg-soc-800 border border-soc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-signal">
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={resolvedFilter} onChange={(e) => { setResolvedFilter(e.target.value); setPage(1) }}
          className="bg-soc-800 border border-soc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-signal">
          <option value="">All Status</option>
          <option value="false">Unresolved</option>
          <option value="true">Resolved</option>
        </select>
      </div>

      <div className="bg-soc-800 rounded-xl border border-soc-700">
        {isLoading ? (
          <div className="p-5 animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-soc-700 rounded-lg" />)}
          </div>
        ) : !data?.items?.length ? (
          <div className="text-center py-16 text-soc-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No alerts found.</p>
          </div>
        ) : (
          <div className="divide-y divide-soc-700">
            {data.items.map((alert) => (
              <div key={alert.id} className="p-5 hover:bg-soc-700/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${severityColor[alert.severity] || severityColor.low}`}>
                        {alert.severity}
                      </span>
                      <span className="text-sm font-medium">{alert.alert_type.replace(/_/g, " ")}</span>
                      {alert.is_resolved && (
                        <span className="text-xs text-soc-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-soc-300">{alert.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-soc-400">
                      <span className="font-mono">{alert.timestamp?.slice(0, 19).replace("T", " ")}</span>
                      {alert.source_ip && <span className="font-mono">{alert.source_ip}</span>}
                      {alert.target_ip && <span className="font-mono">&rarr; {alert.target_ip}</span>}
                    </div>
                  </div>
                  {!alert.is_resolved && (
                    <button
                      onClick={() => resolveMutation.mutate(alert.id)}
                      className="flex items-center gap-1 text-xs bg-signal/20 text-signal border border-signal/30 px-3 py-1.5 rounded-lg hover:bg-signal/30 transition-colors whitespace-nowrap"
                    >
                      <CheckCircle className="w-3 h-3" /> Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {data && data.total > 0 && (
          <div className="flex items-center justify-between p-5 border-t border-soc-700">
            <p className="text-xs text-soc-400">{data.total} total alerts</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="px-3 py-1.5 text-xs bg-soc-700 rounded-lg disabled:opacity-40 hover:bg-soc-600 transition-colors">
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs text-soc-400">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs bg-soc-700 rounded-lg disabled:opacity-40 hover:bg-soc-600 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
