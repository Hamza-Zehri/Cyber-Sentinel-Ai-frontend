import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth-context"
import { Shield } from "lucide-react"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.message || "Login failed")
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
          <p className="text-soc-400 mt-1">Enterprise Cybersecurity Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-soc-800 rounded-xl border border-soc-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Sign In</h2>

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
              placeholder="admin@cybersentinel.ai"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-soc-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-soc-900 border border-soc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-signal transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-soc-400 hover:text-signal transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-signal text-soc-900 font-semibold rounded-lg px-4 py-2.5 text-sm hover:bg-signal-dim transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-xs text-soc-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-signal hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
