import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiRequest, type LoginActivity } from "../lib/api"
import { Globe, WifiOff, Shield, Clock, Filter, KeyRound, AlertTriangle } from "lucide-react"

interface HttpCredential {
  type: string
  src_ip: string
  dst_ip: string
  dst_port: number
  method: string
  path: string
  host: string
  form_data: Record<string, string>
  raw_body: string
  timestamp: string
}

interface LoginActivityResponse {
  total: number
  detections: LoginActivity[]
}

interface HttpCredentialResponse {
  total: number
  credentials: HttpCredential[]
}

const serviceColors: Record<string, string> = {
  "Facebook": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Snapchat": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Instagram": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "Twitter / X": "bg-sky-500/20 text-sky-400 border-sky-500/30",
  "WhatsApp": "bg-green-500/20 text-green-400 border-green-500/30",
  "LinkedIn": "bg-blue-700/20 text-blue-500 border-blue-700/30",
  "TikTok": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "YouTube": "bg-red-500/20 text-red-400 border-red-500/30",
  "Google": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  "Gmail": "bg-red-500/20 text-red-400 border-red-500/30",
  "Microsoft": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Discord": "bg-indigo-600/20 text-indigo-400 border-indigo-600/30",
  "Telegram": "bg-blue-400/20 text-blue-300 border-blue-400/30",
  "Netflix": "bg-red-600/20 text-red-400 border-red-600/30",
  "GitHub": "bg-gray-500/20 text-gray-300 border-gray-500/30",
}

const allServicesSorted = [
  "Facebook", "Snapchat", "Instagram", "Twitter / X", "WhatsApp",
  "LinkedIn", "TikTok", "YouTube", "Google", "Gmail", "Outlook",
  "Microsoft", "GitHub", "Discord", "Telegram", "Netflix", "Spotify",
  "Amazon", "Reddit", "Twitch", "Pinterest", "Yahoo", "Zoom", "Slack",
]

export default function Credentials() {
  const [tab, setTab] = useState<"dns" | "http">("dns")
  const [serviceFilter, setServiceFilter] = useState("")

  const { data: dnsData, isLoading: dnsLoading } = useQuery({
    queryKey: ["credentials", serviceFilter],
    queryFn: () => {
      const params = serviceFilter ? `?service=${encodeURIComponent(serviceFilter)}` : ""
      return apiRequest<LoginActivityResponse>(`/api/v1/credentials/detections${params}`)
    },
    refetchInterval: 2000,
  })

  const { data: httpData, isLoading: httpLoading } = useQuery({
    queryKey: ["http-credentials"],
    queryFn: () => apiRequest<HttpCredentialResponse>("/api/v1/credentials/http-credentials"),
    refetchInterval: 2000,
  })

  const detections = dnsData?.detections ?? []
  const credentials = httpData?.credentials ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-signal" />
            Credential Sniffer
          </h1>
          <p className="text-soc-400 text-sm mt-1">
            Extracts login activity from DNS queries and plaintext HTTP form submissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-soc-800 rounded-lg border border-soc-700 px-3 py-2">
            <Globe className="w-4 h-4 text-soc-400" />
            <span className="text-sm text-soc-300">{dnsData?.total ?? 0} sites</span>
          </div>
          <div className="flex items-center gap-2 bg-soc-800 rounded-lg border border-soc-700 px-3 py-2">
            <KeyRound className="w-4 h-4 text-alert-amber" />
            <span className="text-sm text-soc-300">{httpData?.total ?? 0} forms</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-soc-800 rounded-lg p-1 border border-soc-700 w-fit">
        <button
          onClick={() => setTab("dns")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "dns" ? "bg-soc-700 text-soc-100" : "text-soc-400 hover:text-soc-200"
          }`}
        >
          <Globe className="w-4 h-4 inline mr-1.5" />
          DNS Service Detection
        </button>
        <button
          onClick={() => setTab("http")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "http" ? "bg-soc-700 text-soc-100" : "text-soc-400 hover:text-soc-200"
          }`}
        >
          <KeyRound className="w-4 h-4 inline mr-1.5" />
          HTTP Credentials
        </button>
      </div>

      {tab === "dns" ? (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soc-400" />
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full bg-soc-800 border border-soc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-soc-100 focus:outline-none focus:ring-2 focus:ring-signal/50"
              >
                <option value="">All Services</option>
                {allServicesSorted.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <span className="text-xs text-soc-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Every 2s
            </span>
          </div>

          {dnsLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-soc-800 rounded-lg" />)}
            </div>
          ) : detections.length === 0 ? (
            <div className="text-center py-20 text-soc-500">
              <WifiOff className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No login activity detected yet.</p>
              <p className="text-xs text-soc-500 mt-1">
                Start packet capture and visit a supported site to see DNS lookups appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-soc-800 rounded-xl border border-soc-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-soc-700 text-soc-400 text-xs uppercase tracking-wider">
                    <th className="text-left py-3 px-4 font-medium">Service</th>
                    <th className="text-left py-3 px-4 font-medium">Domain</th>
                    <th className="text-left py-3 px-4 font-medium">Source IP</th>
                    <th className="text-left py-3 px-4 font-medium">Resolved IP</th>
                    <th className="text-left py-3 px-4 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {detections.map((d, i) => (
                    <tr key={`${d.timestamp}-${i}`} className="border-b border-soc-700/50 hover:bg-soc-700/20 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${
                          serviceColors[d.service] || "bg-soc-700 text-soc-300 border-soc-600"
                        }`}>{d.service}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-soc-200">{d.domain}</td>
                      <td className="py-3 px-4 font-mono text-xs text-soc-300">{d.src_ip}</td>
                      <td className="py-3 px-4 font-mono text-xs text-soc-400">{d.dst_ip || "-"}</td>
                      <td className="py-3 px-4 text-xs text-soc-400">
                        {new Date(d.timestamp + "Z").toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm">
            <AlertTriangle className="w-4 h-4 text-alert-amber shrink-0" />
            <span className="text-soc-300">
              <strong className="text-amber-400">HTTPS notice:</strong> Facebook, Snapchat, Gmail and most modern
              sites encrypt traffic — passwords won't appear here. Only <strong>unencrypted HTTP</strong> form
              submissions are visible. Use this to audit legacy/internal apps that still use HTTP.
            </span>
          </div>

          {httpLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-soc-800 rounded-lg" />)}
            </div>
          ) : credentials.length === 0 ? (
            <div className="text-center py-20 text-soc-500">
              <KeyRound className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No HTTP credentials captured yet.</p>
              <p className="text-xs text-soc-500 mt-1">
                Submit a form on an HTTP (not HTTPS) site while packet capture is running.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {credentials.map((c, i) => (
                <div key={`http-${c.timestamp}-${i}`} className="bg-soc-800 rounded-xl border border-soc-700 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-sm font-medium text-soc-200">{c.host}{c.path}</span>
                      <div className="text-xs text-soc-400 mt-0.5">
                        {c.src_ip}:{c.dst_port} &rarr; {c.dst_ip}
                      </div>
                    </div>
                    <span className="text-xs text-soc-400">
                      {new Date(c.timestamp + "Z").toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(c.form_data).map(([field, value]) => (
                      <div key={field} className="flex items-center gap-3 text-sm">
                        <span className="text-xs font-mono text-soc-400 bg-soc-700 px-2 py-0.5 rounded min-w-[80px]">
                          {field}
                        </span>
                        <span className="font-mono text-soc-100">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
