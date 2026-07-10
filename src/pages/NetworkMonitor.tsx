import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiRequest, type CaptureStatus, type Packet, type PaginatedResponse, type InterfaceInfo } from "../lib/api"
import {
  Play, Square, RefreshCw, Wifi, WifiOff,
  Info, ChevronDown, ChevronUp, BookOpen, Trash2,
} from "lucide-react"

const protoColor = (p: string) => {
  switch (p) {
    case "TCP": return "bg-alert-blue/20 text-alert-blue border-alert-blue/30"
    case "UDP": return "bg-alert-amber/20 text-alert-amber border-alert-amber/30"
    case "ICMP": return "bg-alert-red/20 text-alert-red border-alert-red/30"
    case "ARP": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    case "DNS": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
    default: return "bg-soc-700 text-soc-300 border-soc-600"
  }
}

const flagExplanations: Record<string, string> = {
  SYN: "Connection request",
  ACK: "Acknowledgment",
  FIN: "Close connection",
  RST: "Connection reset",
  PSH: "Push data immediately",
  URG: "Urgent data",
}

const MAC_VENDORS: Record<string, string> = {
  "E0:2E:0B": "Intel", "00:0F:00": "Realtek", "74:5D:22": "Realtek",
  "00:15:5D": "Hyper-V", "00:50:56": "VMware", "00:0C:29": "VMware",
  "08:00:27": "Oracle/VB", "00:1A:4B": "Raspberry Pi", "B8:27:EB": "Raspberry Pi",
  "DC:A6:32": "Raspberry Pi", "F8:59:71": "Xiaomi", "18:FE:34": "Samsung",
  "AC:84:C6": "Apple", "F0:18:98": "Apple", "A4:D9:31": "Cisco",
  "00:26:AB": "Cisco", "00:24:97": "HP", "10:1F:74": "Netgear",
  "C0:3F:0E": "TP-Link", "50:C7:BF": "TP-Link", "F4:F2:6D": "D-Link",
  "00:24:01": "Dell", "F8:BC:12": "Dell", "34:DE:1A": "Intel",
  "3C:DF:1E": "Intel", "A0:36:9F": "Intel", "00:1E:4C": "Synology",
  "00:11:32": "ASUS",
}

function macVendor(mac: string | null): string | null {
  if (!mac || mac.length < 8) return null
  return MAC_VENDORS[mac.toUpperCase().slice(0, 8)] || null
}

function PacketRow({ p }: { p: Packet }) {
  const [expanded, setExpanded] = useState(false)
  const isDns = p.protocol === "DNS"
  const flags = p.flags ? p.flags.split(",").filter(Boolean) : []
  const vendor = macVendor(p.mac_address)

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        className="border-b border-soc-700/30 hover:bg-soc-700/20 transition-colors cursor-pointer font-mono text-xs"
      >
        <td className="py-2.5 px-3 text-soc-400 whitespace-nowrap">{p.timestamp?.slice(11, 23)}</td>
        <td className="py-2.5 px-3">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${protoColor(p.protocol)}`}>
            {p.protocol}
          </span>
        </td>
        <td className="py-2.5 px-3 text-soc-100">
          {p.src_ip}<span className="text-soc-500">:{p.src_port ?? "—"}</span>
        </td>
        <td className="py-2.5 px-3 text-soc-100">
          {p.dst_ip}<span className="text-soc-500">:{p.dst_port ?? "—"}</span>
        </td>
        <td className="py-2.5 px-3 text-right text-soc-400">{p.size_bytes}</td>
        <td className="py-2.5 px-3">
          {flags.length > 0 ? (
            <div className="flex gap-1">
              {flags.map((f) => (
                <span key={f} title={flagExplanations[f] || f}
                  className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                    f === "SYN" ? "bg-alert-amber/20 text-alert-amber" :
                    f === "ACK" ? "bg-signal/20 text-signal" :
                    f === "RST" ? "bg-alert-red/20 text-alert-red" :
                    f === "FIN" ? "bg-soc-600 text-soc-300" :
                    "bg-soc-700 text-soc-400"
                  }`}
                >{f}</span>
              ))}
            </div>
          ) : isDns ? (
            <span className="text-cyan-400/70">query</span>
          ) : (
            <span className="text-soc-600">—</span>
          )}
        </td>
        <td className="py-2.5 px-3 text-right text-soc-500">{p.ttl ?? "—"}</td>
        <td className="py-2.5 px-1 text-soc-500">
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-soc-700/10 border-b border-soc-700/30">
          <td colSpan={8} className="px-6 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-soc-500 block">Source</span>
                <span className="font-mono">{p.src_ip}:{p.src_port ?? "—"}</span>
              </div>
              <div>
                <span className="text-soc-500 block">Destination</span>
                <span className="font-mono">{p.dst_ip}:{p.dst_port ?? "—"}</span>
              </div>
              <div>
                <span className="text-soc-500 block">Size</span>
                <span className="font-mono">{p.size_bytes} bytes</span>
              </div>
              <div>
                <span className="text-soc-500 block">TTL</span>
                <span className="font-mono">{p.ttl ?? "—"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-soc-500 block">MAC Address</span>
                <span className="font-mono">{p.mac_address || "—"}</span>
                {vendor && <span className="text-signal ml-2 text-[10px]">({vendor})</span>}
              </div>
              <div className="col-span-2">
                <span className="text-soc-500 block">Flags</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {flags.length > 0 ? flags.map((f) => (
                    <span key={f} title={flagExplanations[f]} className="text-soc-300 font-mono">{f}</span>
                  )) : <span className="text-soc-600">—</span>}
                </div>
              </div>
            </div>
            {flags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-soc-500">
                {flags.map((f) => flagExplanations[f] && (
                  <span key={f}><strong>{f}</strong>: {flagExplanations[f]}</span>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

const protocolGuides = [
  { proto: "TCP", color: "text-alert-blue", what: "Used for web (HTTP/HTTPS), email, SSH, file transfers", watch: "Many RST = scans. Many SYN without ACK = port scan." },
  { proto: "UDP", color: "text-alert-amber", what: "Used for DNS, video calls, gaming, DHCP", watch: "No handshake — can be spoofed easily." },
  { proto: "ICMP", color: "text-alert-red", what: "Ping, traceroute, network diagnostics", watch: "Flood of ICMP = possible DDoS or network scan." },
  { proto: "ARP", color: "text-purple-400", what: "Resolves IP → MAC on local network", watch: "Multiple ARP replies from different MACs = ARP spoofing." },
  { proto: "DNS", color: "text-cyan-400", what: "Converts domains to IPs", watch: "Suspicious domains = malware beaconing (C2)." },
]

export default function NetworkMonitor() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [protocolFilter, setProtocolFilter] = useState("")
  const [selectedIface, setSelectedIface] = useState("Wi-Fi")
  const [showGuide, setShowGuide] = useState(false)

  const { data: status } = useQuery({
    queryKey: ["capture-status"],
    queryFn: () => apiRequest<CaptureStatus>("/api/v1/network/capture/status"),
    refetchInterval: 2000,
  })

  const { data: ifaces } = useQuery({
    queryKey: ["network-interfaces"],
    queryFn: () => apiRequest<InterfaceInfo[]>("/api/v1/network/interfaces"),
    refetchInterval: 5000,
  })

  const { data: packets, isLoading } = useQuery({
    queryKey: ["packets", page, protocolFilter],
    queryFn: () => apiRequest<PaginatedResponse<Packet>>(
      `/api/v1/network/packets?page=${page}&page_size=25${protocolFilter ? `&protocol=${protocolFilter}` : ""}`
    ),
    refetchInterval: status?.is_running ? 2000 : false,
  })

  const startMutation = useMutation({
    mutationFn: () => apiRequest<CaptureStatus>("/api/v1/network/capture/start", {
      method: "POST", body: JSON.stringify({ interface: selectedIface }),
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["capture-status"] }); setPage(1) },
  })

  const stopMutation = useMutation({
    mutationFn: () => apiRequest<CaptureStatus>("/api/v1/network/capture/stop", { method: "POST" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["capture-status"] }) },
  })

  const resetMutation = useMutation({
    mutationFn: () => apiRequest<{ deleted: number }>("/api/v1/network/packets", { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packets"] })
      queryClient.invalidateQueries({ queryKey: ["capture-status"] })
      setPage(1)
    },
  })

  const totalPages = packets ? Math.ceil(packets.total / packets.page_size) : 1
  const connectedIfaces = ifaces?.filter((i) => i.connected) || []

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Network Monitor</h1>
          <p className="text-soc-400 text-sm mt-1">Click any packet row to see details and flag meanings</p>
        </div>
        <div className="flex items-center gap-3">
          {!status?.is_running ? (
            <>
              <select
                value={selectedIface}
                onChange={(e) => setSelectedIface(e.target.value)}
                className="bg-soc-700 border border-soc-600 rounded-lg px-3 py-2 text-sm text-soc-100 outline-none"
              >
                {connectedIfaces.map((iface) => (
                  <option key={iface.name} value={iface.name}>{iface.name}</option>
                ))}
                {connectedIfaces.length === 0 && <option value="">No interfaces</option>}
              </select>
              <button
                onClick={() => startMutation.mutate()}
                disabled={startMutation.isPending || connectedIfaces.length === 0}
                className="flex items-center gap-2 bg-signal text-soc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-signal-dim transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" /> Start
              </button>
            </>
          ) : (
            <button
              onClick={() => stopMutation.mutate()}
              className="flex items-center gap-2 bg-alert-red/20 text-alert-red border border-alert-red/30 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-alert-red/30 transition-colors"
            >
              <Square className="w-4 h-4" /> Stop
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-soc-800 rounded-xl border border-soc-700 p-4">
          <div className="flex items-center gap-2 text-sm">
            {status?.is_running ? <Wifi className="w-4 h-4 text-signal animate-pulse" /> : <WifiOff className="w-4 h-4 text-soc-500" />}
            <span className="text-soc-400">Capture</span>
            <span className={`ml-auto font-semibold ${status?.is_running ? "text-signal" : "text-soc-500"}`}>
              {status?.is_running ? "Live" : "Off"}
            </span>
          </div>
        </div>
        <div className="bg-soc-800 rounded-xl border border-soc-700 p-4">
          <p className="text-xs text-soc-400">Interface</p>
          <p className="text-sm font-semibold mt-1 truncate">{status?.interface || "—"}</p>
        </div>
        <div className="bg-soc-800 rounded-xl border border-soc-700 p-4">
          <p className="text-xs text-soc-400">Packets Captured</p>
          <p className="text-lg font-bold mt-1 text-signal">{status?.packets_captured ?? 0}</p>
        </div>
        <div className="bg-soc-800 rounded-xl border border-soc-700 p-4">
          <p className="text-xs text-soc-400">Alerts Triggered</p>
          <p className="text-lg font-bold mt-1 text-alert-amber">{status?.alerts_raised ?? 0}</p>
        </div>
      </div>

      {/* Protocol Guide Toggle */}
      <button
        onClick={() => setShowGuide(!showGuide)}
        className="flex items-center gap-2 text-sm text-soc-400 hover:text-signal transition-colors"
      >
        <BookOpen className="w-4 h-4" />
        {showGuide ? "Hide" : "Show"} Protocol Guide & Tips
        {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {showGuide && (
        <div className="bg-soc-800 rounded-xl border border-soc-700 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-soc-400 mb-4">Protocol Reference</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {protocolGuides.map((g) => (
              <div key={g.proto} className="bg-soc-900/50 rounded-lg p-4 border border-soc-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-bold ${g.color}`}>{g.proto}</span>
                </div>
                <p className="text-xs text-soc-300 mb-2">{g.what}</p>
                <div className="flex items-start gap-1.5">
                  <Info className="w-3 h-3 text-alert-amber mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-soc-400">{g.watch}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-soc-900/50 rounded-lg border border-soc-700/50">
            <h4 className="text-xs font-semibold text-soc-400 mb-2">TCP Flag Meanings</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-soc-300">
              {Object.entries(flagExplanations).map(([flag, desc]) => (
                <div key={flag} className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    flag === "SYN" ? "bg-alert-amber/20 text-alert-amber" :
                    flag === "ACK" ? "bg-signal/20 text-signal" :
                    flag === "RST" ? "bg-alert-red/20 text-alert-red" :
                    "bg-soc-700 text-soc-400"
                  }`}>{flag}</span>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Packets Table */}
      <div className="bg-soc-800 rounded-xl border border-soc-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-soc-700">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-soc-400">Packets</h2>
            <span className="text-xs text-soc-500">({packets?.total ?? 0})</span>
            {status?.is_running && (
              <span className="flex items-center gap-1 text-[10px] text-signal">
                <span className="w-1.5 h-1.5 bg-signal rounded-full animate-pulse" />
                live
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={protocolFilter}
              onChange={(e) => { setProtocolFilter(e.target.value); setPage(1) }}
              className="bg-soc-900 border border-soc-600 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-signal"
            >
              <option value="">All Protocols</option>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="ICMP">ICMP</option>
              <option value="ARP">ARP</option>
              <option value="DNS">DNS</option>
            </select>
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ["packets"] })} className="text-soc-400 hover:text-soc-100">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { if (confirm("Clear all captured packets?")) resetMutation.mutate() }}
              disabled={resetMutation.isPending || !packets?.total}
              className="flex items-center gap-1 text-xs text-soc-400 hover:text-alert-red transition-colors disabled:opacity-30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3 p-5">
            {[...Array(8)].map((_, i) => <div key={i} className="h-8 bg-soc-700 rounded-lg" />)}
          </div>
        ) : !packets?.items?.length ? (
          <div className="text-center py-16 text-soc-500">
            <WifiOff className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No packets yet.</p>
            <p className="text-xs text-soc-500 mt-1">Select an interface above and click Start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-soc-400 border-b border-soc-700 text-[11px] uppercase tracking-wider sticky top-0 bg-soc-800 z-10">
                  <th className="text-left py-2.5 px-3 font-medium">Time</th>
                  <th className="text-left py-2.5 px-3 font-medium">Proto</th>
                  <th className="text-left py-2.5 px-3 font-medium">Source</th>
                  <th className="text-left py-2.5 px-3 font-medium">Destination</th>
                  <th className="text-right py-2.5 px-3 font-medium">Size</th>
                  <th className="text-left py-2.5 px-3 font-medium">Flags</th>
                  <th className="text-right py-2.5 px-3 font-medium">TTL</th>
                  <th className="py-2.5 px-1 w-5"></th>
                </tr>
              </thead>
              <tbody>
                {packets.items.map((p) => <PacketRow key={p.id} p={p} />)}
              </tbody>
            </table>
          </div>
        )}

        {packets && packets.total > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-soc-700">
            <p className="text-xs text-soc-500">{packets.total} packets</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-xs bg-soc-700 rounded-lg disabled:opacity-40 hover:bg-soc-600 transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs text-soc-400">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs bg-soc-700 rounded-lg disabled:opacity-40 hover:bg-soc-600 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
