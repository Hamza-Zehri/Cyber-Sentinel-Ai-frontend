import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { apiRequest, type PhishingResult, type MalwareResult, type PasswordResult } from "../lib/api"
import { Upload, Key, Search } from "lucide-react"

type Tab = "phishing" | "malware" | "password"

function ResultBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-soc-900 rounded-lg border border-soc-700 p-4 mt-4">
      <h3 className="text-sm font-semibold text-soc-400 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  )
}

function PhishingTab() {
  const [url, setUrl] = useState("")
  const mutation = useMutation({
    mutationFn: (u: string) =>
      apiRequest<PhishingResult>("/api/v1/ai/phishing/check", {
        method: "POST",
        body: JSON.stringify({ url: u }),
      }),
  })

  return (
    <div>
      <div className="flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 bg-soc-900 border border-soc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-signal"
        />
        <button onClick={() => url && mutation.mutate(url)} disabled={mutation.isPending}
          className="bg-signal text-soc-900 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-signal-dim transition-colors disabled:opacity-50 flex items-center gap-2">
          <Search className="w-4 h-4" /> Check
        </button>
      </div>

      {mutation.isPending && <p className="text-soc-400 text-sm mt-4 animate-pulse">Analyzing URL...</p>}
      {mutation.isError && (
        <div className="bg-alert-red/10 border border-alert-red/30 rounded-lg px-4 py-2 text-sm text-alert-red mt-4">
          {mutation.error.message}
        </div>
      )}
      {mutation.data && (
        <ResultBox title="Result">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              mutation.data.label === "safe" ? "bg-signal/20 text-signal" :
              mutation.data.label === "suspicious" ? "bg-alert-amber/20 text-alert-amber" :
              "bg-alert-red/20 text-alert-red"
            }`}>{mutation.data.label.toUpperCase()}</span>
            <span className="text-xs text-soc-400">Risk: {mutation.data.risk_score}% &middot; Confidence: {mutation.data.confidence}%</span>
          </div>
          <p className="text-xs text-soc-400 break-all mb-2">{mutation.data.url}</p>
          <p className="text-sm text-soc-300 mb-2">{mutation.data.explanation}</p>
          {mutation.data.reasons.length > 0 && (
            <ul className="text-xs text-soc-400 space-y-1">
              {mutation.data.reasons.map((r, i) => <li key={i} className="flex gap-2 before:content-['•'] before:text-signal">{r}</li>)}
            </ul>
          )}
        </ResultBox>
      )}
    </div>
  )
}

function MalwareTab() {
  const [quarantine, setQuarantine] = useState(false)
  const mutation = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append("file", file)
      return apiRequest<MalwareResult>(`/api/v1/ai/malware/scan?quarantine=${quarantine}`, {
        method: "POST",
        body: form,
      })
    },
  })

  return (
    <div>
      <div className="flex items-center gap-3">
        <label className="flex-1 flex items-center gap-3 bg-soc-900 border border-soc-600 rounded-lg px-4 py-3 cursor-pointer hover:border-signal transition-colors">
          <Upload className="w-5 h-5 text-soc-400" />
          <span className="text-sm text-soc-400">{mutation.data?.filename || "Click to select a file..."}</span>
          <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && mutation.mutate(e.target.files[0])} />
        </label>
        <label className="flex items-center gap-2 text-xs text-soc-400 cursor-pointer">
          <input type="checkbox" checked={quarantine} onChange={(e) => setQuarantine(e.target.checked)} className="accent-signal" />
          Auto-quarantine
        </label>
      </div>

      {mutation.isPending && <p className="text-soc-400 text-sm mt-4 animate-pulse">Scanning file...</p>}
      {mutation.isError && (
        <div className="bg-alert-red/10 border border-alert-red/30 rounded-lg px-4 py-2 text-sm text-alert-red mt-4">
          {mutation.error.message}
        </div>
      )}
      {mutation.data && (
        <ResultBox title="Scan Result">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              mutation.data.label === "clean" ? "bg-signal/20 text-signal" :
              mutation.data.label === "suspicious" ? "bg-alert-amber/20 text-alert-amber" :
              "bg-alert-red/20 text-alert-red"
            }`}>{mutation.data.label.toUpperCase()}</span>
            <span className="text-xs text-soc-400">Malware Probability: {mutation.data.malware_probability}%</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-soc-400 mb-3">
            <span>SHA256: <span className="font-mono">{mutation.data.sha256?.slice(0, 16)}...</span></span>
            <span>MD5: <span className="font-mono">{mutation.data.md5}</span></span>
            <span>Size: {(mutation.data.size_bytes / 1024).toFixed(1)} KB</span>
            <span>Entropy: {mutation.data.entropy.toFixed(2)}</span>
          </div>
          {mutation.data.reasons.length > 0 && (
            <ul className="text-xs text-soc-400 space-y-1">
              {mutation.data.reasons.map((r, i) => <li key={i} className="flex gap-2 before:content-['•'] before:text-signal">{r}</li>)}
            </ul>
          )}
          {mutation.data.quarantined && (
            <p className="text-xs text-alert-amber mt-2">File quarantined at: {mutation.data.quarantine_path}</p>
          )}
        </ResultBox>
      )}
    </div>
  )
}

function PasswordTab() {
  const [password, setPassword] = useState("")
  const mutation = useMutation({
    mutationFn: (pwd: string) =>
      apiRequest<PasswordResult>("/api/v1/ai/password/analyze", {
        method: "POST",
        body: JSON.stringify({ password: pwd }),
      }),
  })

  const strengthColor: Record<string, string> = {
    "very weak": "bg-alert-red/20 text-alert-red border-alert-red/30",
    weak: "bg-alert-amber/20 text-alert-amber border-alert-amber/30",
    moderate: "bg-alert-blue/20 text-alert-blue border-alert-blue/30",
    strong: "bg-signal/20 text-signal border-signal/30",
    "very strong": "bg-signal/20 text-signal border-signal/30",
  }

  return (
    <div>
      <div className="flex gap-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter a password to analyze..."
          className="flex-1 bg-soc-900 border border-soc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-signal"
        />
        <button onClick={() => password && mutation.mutate(password)} disabled={mutation.isPending}
          className="bg-signal text-soc-900 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-signal-dim transition-colors disabled:opacity-50 flex items-center gap-2">
          <Key className="w-4 h-4" /> Analyze
        </button>
      </div>

      {mutation.isPending && <p className="text-soc-400 text-sm mt-4 animate-pulse">Analyzing...</p>}
      {mutation.data && (
        <ResultBox title="Analysis">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-sm font-bold px-3 py-1 rounded-full border ${strengthColor[mutation.data.strength] || ""}`}>
              {mutation.data.strength.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-soc-400">Length</span><span className="font-mono">{mutation.data.length}</span></div>
            <div className="flex justify-between"><span className="text-soc-400">Entropy</span><span className="font-mono">{mutation.data.entropy_bits} bits</span></div>
            <div className="flex justify-between"><span className="text-soc-400">Crack Time</span><span className="font-mono">{mutation.data.estimated_crack_time}</span></div>
            <div className="flex justify-between"><span className="text-soc-400">Common Password</span><span className={mutation.data.is_common_password ? "text-alert-red" : "text-signal"}>{mutation.data.is_common_password ? "Yes" : "No"}</span></div>
          </div>

          {mutation.data.recommendations.length > 0 && (
            <>
              <h4 className="text-xs font-semibold text-soc-400 uppercase tracking-wider mb-2">Recommendations</h4>
              <ul className="text-xs text-soc-400 space-y-1">
                {mutation.data.recommendations.map((r, i) => <li key={i} className="flex gap-2 before:content-['→'] before:text-signal">{r}</li>)}
              </ul>
            </>
          )}
        </ResultBox>
      )}
    </div>
  )
}

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: "phishing", label: "Phishing URL", icon: Search },
  { id: "malware", label: "Malware Scan", icon: Upload },
  { id: "password", label: "Password Analyzer", icon: Key },
]

export default function AITools() {
  const [activeTab, setActiveTab] = useState<Tab>("phishing")

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Security Tools</h1>
        <p className="text-soc-400 text-sm mt-1">Phishing detection, malware scanning, and password analysis</p>
      </div>

      <div className="flex gap-1 bg-soc-800 rounded-xl p-1 border border-soc-700">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === id ? "bg-soc-700 text-signal" : "text-soc-400 hover:text-soc-100"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-soc-800 rounded-xl border border-soc-700 p-5">
        {activeTab === "phishing" && <PhishingTab />}
        {activeTab === "malware" && <MalwareTab />}
        {activeTab === "password" && <PasswordTab />}
      </div>
    </div>
  )
}
