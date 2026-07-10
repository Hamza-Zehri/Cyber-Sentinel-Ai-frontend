import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiRequest, type SystemSetting } from "../lib/api"
import { Save, Loader2, Plus, X } from "lucide-react"

export default function Settings() {
  const [category, setCategory] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")
  const [newCategory, setNewCategory] = useState("general")
  const queryClient = useQueryClient()

  const { data: settings } = useQuery({
    queryKey: ["settings", category],
    queryFn: () => {
      let url = "/api/v1/settings"
      if (category) url += `?category=${category}`
      return apiRequest<SystemSetting[]>(url)
    },
  })

  const updateSetting = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) =>
      apiRequest<SystemSetting>(`/api/v1/settings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ value }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] })
      setEditingId(null)
      setEditValue("")
    },
  })

  const createSetting = useMutation({
    mutationFn: () =>
      apiRequest<SystemSetting>("/api/v1/settings", {
        method: "POST",
        body: JSON.stringify({ key: newKey, value: newValue, category: newCategory }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] })
      setShowCreate(false)
      setNewKey("")
      setNewValue("")
      setNewCategory("general")
    },
  })

  const categories = [...new Set(settings?.map((s) => s.category) || [])]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-soc-400 text-sm mt-1">System-wide configuration</p>
      </div>

      <div className="bg-soc-800 rounded-xl border border-soc-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-soc-400 uppercase tracking-wider font-medium">Filter by category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-soc-700 border border-soc-600 rounded-lg px-3 py-1.5 text-sm text-soc-100 outline-none"
            >
              <option value="">All</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-signal text-soc-900 font-semibold rounded-lg hover:bg-signal-dim transition-colors"
          >
            {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreate ? "Cancel" : "Add Setting"}
          </button>
        </div>

        {showCreate && (
          <div className="mb-4 p-4 bg-soc-700/30 rounded-xl border border-soc-600">
            <h3 className="text-sm font-semibold mb-3">New Setting</h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs text-soc-400 block mb-1">Key</label>
                <input
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="setting_key"
                  className="bg-soc-700 border border-soc-600 rounded-lg px-3 py-2 text-sm text-soc-100 outline-none w-48"
                />
              </div>
              <div>
                <label className="text-xs text-soc-400 block mb-1">Value</label>
                <input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="value"
                  className="bg-soc-700 border border-soc-600 rounded-lg px-3 py-2 text-sm text-soc-100 outline-none w-48"
                />
              </div>
              <div>
                <label className="text-xs text-soc-400 block mb-1">Category</label>
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="general"
                  className="bg-soc-700 border border-soc-600 rounded-lg px-3 py-2 text-sm text-soc-100 outline-none w-36"
                />
              </div>
              <button
                onClick={() => createSetting.mutate()}
                disabled={createSetting.isPending || !newKey}
                className="flex items-center gap-1.5 px-3 py-2 bg-signal text-soc-900 font-semibold rounded-lg hover:bg-signal-dim transition-colors disabled:opacity-50 text-sm"
              >
                {createSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
            {createSetting.isError && (
              <p className="mt-2 text-xs text-alert-red">{createSetting.error?.message}</p>
            )}
          </div>
        )}

        {!settings?.length ? (
          <p className="text-sm text-soc-500 text-center py-6">No settings found</p>
        ) : (
          <div className="divide-y divide-soc-700/50">
            {settings.map((s) => (
              <div key={s.id} className="flex items-center gap-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{s.key}</span>
                    <span className="text-[10px] text-soc-500 bg-soc-700 px-1.5 py-0.5 rounded">{s.category}</span>
                  </div>
                  {editingId === s.id ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="bg-soc-700 border border-soc-600 rounded px-2 py-1 text-sm text-soc-100 outline-none flex-1 max-w-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => updateSetting.mutate({ id: s.id, value: editValue })}
                        disabled={updateSetting.isPending}
                        className="text-xs text-signal hover:text-signal-dim transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditValue("") }}
                        className="text-xs text-soc-400 hover:text-soc-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-soc-400 mt-0.5 font-mono">{s.value || "(empty)"}</p>
                  )}
                </div>
                {editingId !== s.id && (
                  <button
                    onClick={() => { setEditingId(s.id); setEditValue(s.value || "") }}
                    className="text-xs text-soc-400 hover:text-signal transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
