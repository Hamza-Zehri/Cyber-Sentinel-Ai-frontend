import { useQuery } from "@tanstack/react-query"
import { apiRequest, getAccessToken, type Alert, type CaptureStatus } from "../lib/api"
import { Shield, Network, Bell, AlertTriangle } from "lucide-react"

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-soc-800 rounded-xl border border-soc-700 p-5">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-soc-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const isAuthed = !!getAccessToken()

  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiRequest<{ status: string; environment: string }>("/api/health"),
  })

  const { data: captureStatus } = useQuery({
    queryKey: ["capture-status"],
    queryFn: () => apiRequest<CaptureStatus>("/api/v1/network/capture/status"),
    enabled: isAuthed,
    refetchInterval: 5000,
  })

  const { data: alerts } = useQuery({
    queryKey: ["alerts", "recent"],
    queryFn: () => apiRequest<{ total: number; items: Alert[] }>("/api/v1/alerts?page_size=5"),
    enabled: isAuthed,
    refetchInterval: 10000,
  })

  const unresolvedAlerts = alerts?.items?.filter((a) => !a.is_resolved) || []
  const highCritical = unresolvedAlerts.filter((a) => a.severity === "high" || a.severity === "critical")

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-soc-400 text-sm mt-1">
          {health?.status === "ok" ? "System operational" : "Connecting..."} &middot; {health?.environment || "..."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Shield}
          label="Capture Status"
          value={captureStatus?.is_running ? "Running" : "Stopped"}
          color={captureStatus?.is_running ? "bg-signal/20 text-signal" : "bg-soc-700 text-soc-400"}
        />
        <StatCard
          icon={Network}
          label="Packets Captured"
          value={captureStatus?.packets_captured ?? "—"}
          color="bg-alert-blue/20 text-alert-blue"
        />
        <StatCard
          icon={Bell}
          label="Total Alerts"
          value={alerts?.total ?? "—"}
          color="bg-alert-amber/20 text-alert-amber"
        />
        <StatCard
          icon={AlertTriangle}
          label="Unresolved (High/Critical)"
          value={highCritical.length}
          color={highCritical.length > 0 ? "bg-alert-red/20 text-alert-red" : "bg-signal/20 text-signal"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-soc-800 rounded-xl border border-soc-700 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-soc-400 mb-4">Recent Alerts</h2>
          {!alerts?.items?.length ? (
            <p className="text-soc-500 text-sm">No alerts yet.</p>
          ) : (
            <div className="space-y-2">
              {alerts.items.map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 text-sm">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    alert.severity === "critical" ? "bg-alert-red" :
                    alert.severity === "high" ? "bg-alert-amber" :
                    alert.severity === "medium" ? "bg-alert-blue" : "bg-soc-400"
                  }`} />
                  <span className="mono text-xs text-soc-400 w-20">{alert.timestamp?.slice(11, 19)}</span>
                  <span className="flex-1 truncate">{alert.alert_type}</span>
                  <span className="text-soc-400 text-xs">{alert.severity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-soc-800 rounded-xl border border-soc-700 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-soc-400 mb-4">Capture Status</h2>
          {!captureStatus ? (
            <p className="text-soc-500 text-sm">Not available.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-soc-400">Status</span>
                <span className={captureStatus.is_running ? "text-signal" : "text-soc-400"}>
                  {captureStatus.is_running ? "Active" : "Idle"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-soc-400">Packets Captured</span>
                <span className="font-mono">{captureStatus.packets_captured}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-soc-400">Alerts Raised</span>
                <span className="font-mono">{captureStatus.alerts_raised}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-soc-400">Interface</span>
                <span className="font-mono">{captureStatus.interface || "—"}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
