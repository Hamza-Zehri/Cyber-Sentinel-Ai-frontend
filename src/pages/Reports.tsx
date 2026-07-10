import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiRequest, getAccessToken, type Report } from "../lib/api"
import { FileText, Download, Loader2, RefreshCw } from "lucide-react"

export default function Reports() {
  const [page, setPage] = useState(1)
  const [reportType, setReportType] = useState("alert")
  const [period, setPeriod] = useState("daily")
  const [fileFormat, setFileFormat] = useState("csv")
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["reports", page],
    queryFn: () => apiRequest<{ total: number; page: number; page_size: number; items: Report[] }>(
      `/api/v1/reports?page=${page}&page_size=20`
    ),
  })

  const generate = useMutation({
    mutationFn: () =>
      apiRequest<Report & { filename: string }>("/api/v1/reports/generate", {
        method: "POST",
        body: JSON.stringify({ report_type: reportType, period, file_format: fileFormat }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      setReportType("alert")
      setPeriod("daily")
      setFileFormat("csv")
    },
  })

  const downloadReport = async (reportId: string) => {
    const token = getAccessToken()
    const res = await fetch(`/api/v1/reports/download/${reportId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) { const err = await res.json().catch(() => ({ detail: "Download failed" })); throw new Error(err.detail) }
    const blob = await res.blob()
    const disposition = res.headers.get("content-disposition")
    const match = disposition?.match(/filename="?(.+?)"?$/)
    const filename = match?.[1] || `report_${reportId}.csv`
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const reportTypeLabels: Record<string, string> = {
    alert: "Alerts", network: "Network", threat: "Threats", ai_scan: "AI Scans", incident: "Incidents",
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-soc-400 text-sm mt-1">Generate and download system reports</p>
      </div>

      <div className="bg-soc-800 rounded-xl border border-soc-700 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-soc-400 mb-4">Generate Report</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs text-soc-400 block mb-1">Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="bg-soc-700 border border-soc-600 rounded-lg px-3 py-2 text-sm text-soc-100 outline-none min-w-[120px]"
            >
              {Object.entries(reportTypeLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-soc-400 block mb-1">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-soc-700 border border-soc-600 rounded-lg px-3 py-2 text-sm text-soc-100 outline-none min-w-[120px]"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-soc-400 block mb-1">Format</label>
            <select
              value={fileFormat}
              onChange={(e) => setFileFormat(e.target.value)}
              className="bg-soc-700 border border-soc-600 rounded-lg px-3 py-2 text-sm text-soc-100 outline-none min-w-[120px]"
            >
              <option value="csv">CSV</option>
              <option value="xlsx">XLSX (soon)</option>
              <option value="pdf">PDF (soon)</option>
            </select>
          </div>
          <button
            onClick={() => generate.mutate()}
            disabled={generate.isPending || fileFormat !== "csv"}
            className="flex items-center gap-2 px-4 py-2 bg-signal text-soc-900 font-semibold rounded-lg hover:bg-signal-dim transition-colors disabled:opacity-50"
          >
            {generate.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {generate.isPending ? "Generating..." : "Generate"}
          </button>
          {fileFormat !== "csv" && (
            <p className="text-xs text-alert-amber">Only CSV generation is supported currently</p>
          )}
        </div>
        {generate.data && (
          <div className="mt-4 p-3 bg-signal/10 border border-signal/20 rounded-lg text-sm">
            Report generated: <strong>{generate.data.filename}</strong>
          </div>
        )}
        {generate.isError && (
          <div className="mt-4 p-3 bg-alert-red/10 border border-alert-red/20 rounded-lg text-sm text-alert-red">
            {generate.error?.message || "Failed to generate report"}
          </div>
        )}
      </div>

      <div className="bg-soc-800 rounded-xl border border-soc-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-soc-700">
          <span className="text-xs text-soc-400 uppercase tracking-wider font-medium">Generated Reports</span>
        </div>
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-soc-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !data?.items?.length ? (
          <p className="text-sm text-soc-500 text-center py-8">No reports generated yet</p>
        ) : (
          <div className="divide-y divide-soc-700/50">
            {data.items.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3 hover:bg-soc-700/20 transition-colors">
                <FileText className="w-4 h-4 text-soc-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize">{r.report_type} — {r.period}</p>
                  <p className="text-xs text-soc-500 mt-0.5">
                    {r.file_format.toUpperCase()} &middot; {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => downloadReport(r.id).catch((e) => alert(e.message))}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-soc-400 hover:text-signal border border-soc-600 hover:border-signal/50 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
        {data && data.total > data.page_size && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-soc-700">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="text-sm text-soc-400 hover:text-soc-100 disabled:opacity-30 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-soc-500">Page {page} of {Math.ceil(data.total / data.page_size)}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(data.total / data.page_size)}
              className="text-sm text-soc-400 hover:text-soc-100 disabled:opacity-30 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
