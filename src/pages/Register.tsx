import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../lib/auth-context"
import { Shield } from "lucide-react"

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({ full_name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await register(form.full_name, form.email, form.password)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-soc-900 flex items-center justify-center p-4">
        <div className="bg-soc-800 rounded-xl border border-soc-700 p-8 max-w-sm text-center">
          <Shield className="w-10 h-10 text-signal mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Registration Successful</h2>
          <p className="text-soc-400 text-sm mb-4">
            Check your email for the verification link to activate your account.
          </p>
          <Link to="/login" className="text-signal hover:underline text-sm">Go to Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-soc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-signal mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Cyber Sentinel AI</h1>
          <p className="text-soc-400 mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-soc-800 rounded-xl border border-soc-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Register</h2>

          {error && (
            <div className="bg-alert-red/10 border border-alert-red/30 rounded-lg px-4 py-2 text-sm text-alert-red">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-soc-300 mb-1">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full bg-soc-900 border border-soc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-signal transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-soc-300 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-soc-900 border border-soc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-signal transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-soc-300 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-soc-900 border border-soc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-signal transition-colors"
              placeholder="8+ chars, uppercase, digit, special"
              required
              minLength={8}
            />
            <p className="text-xs text-soc-400 mt-1">Min 8 chars, uppercase, digit, and special character</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-signal text-soc-900 font-semibold rounded-lg px-4 py-2.5 text-sm hover:bg-signal-dim transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-xs text-soc-400">
            Already have an account?{" "}
            <Link to="/login" className="text-signal hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
