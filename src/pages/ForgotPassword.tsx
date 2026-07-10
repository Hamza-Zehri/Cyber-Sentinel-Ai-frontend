import { useState } from "react"
import { Link } from "react-router-dom"
import { apiRequest } from "../lib/api"
import { Shield } from "lucide-react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await apiRequest("/api/v1/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch (err: any) {
      setError(err.message || "Request failed")
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
          {sent ? (
            <div className="text-center">
              <p className="text-soc-300 text-sm mb-4">
                If that email is registered, a reset link has been sent.
              </p>
              <Link to="/login" className="text-signal hover:underline text-sm">Back to Sign In</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold">Reset Password</h2>
              <p className="text-sm text-soc-400">Enter your email to receive a reset link.</p>

              {error && (
                <div className="bg-alert-red/10 border border-alert-red/30 rounded-lg px-4 py-2 text-sm text-alert-red">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm text-soc-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-soc-900 border border-soc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-signal transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-signal text-soc-900 font-semibold rounded-lg px-4 py-2.5 text-sm hover:bg-signal-dim transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="text-center text-xs text-soc-400">
                <Link to="/login" className="text-signal hover:underline">Back to Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
