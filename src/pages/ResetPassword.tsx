import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { apiRequest } from "../lib/api"
import { Shield } from "lucide-react"

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""
  const [password, setPassword] = useState("")
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await apiRequest("/api/v1/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, new_password: password }),
      })
      setDone(true)
    } catch (err: any) {
      setError(err.message || "Reset failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-soc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-signal mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Cyber Sentinel AI</h1>
        </div>

        <div className="bg-soc-800 rounded-xl border border-soc-700 p-6">
          {done ? (
            <div className="text-center">
              <p className="text-soc-300 text-sm mb-4">Password reset successfully.</p>
              <Link to="/login" className="text-signal hover:underline text-sm">Sign In</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold">Set New Password</h2>

              {error && (
                <div className="bg-alert-red/10 border border-alert-red/30 rounded-lg px-4 py-2 text-sm text-alert-red">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm text-soc-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-soc-900 border border-soc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-signal transition-colors"
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-signal text-soc-900 font-semibold rounded-lg px-4 py-2.5 text-sm hover:bg-signal-dim transition-colors disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
