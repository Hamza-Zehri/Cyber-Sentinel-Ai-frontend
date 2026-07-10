import { useAuth } from "../lib/auth-context"
import { Shield, Mail, User, Calendar, CheckCircle } from "lucide-react"

export default function Profile() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-soc-400 text-sm mt-1">Your account details</p>
      </div>

      <div className="bg-soc-800 rounded-xl border border-soc-700 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-soc-700">
          <div className="w-16 h-16 rounded-full bg-soc-700 flex items-center justify-center">
            <span className="text-2xl font-bold text-signal">{user.full_name?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user.full_name}</h2>
            <p className="text-sm text-soc-400">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-soc-400" />
            <span className="text-soc-400 w-24">Full Name</span>
            <span>{user.full_name}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-soc-400" />
            <span className="text-soc-400 w-24">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="w-4 h-4 text-soc-400" />
            <span className="text-soc-400 w-24">Role</span>
            <span className="text-signal font-medium">{user.role}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle className="w-4 h-4 text-soc-400" />
            <span className="text-soc-400 w-24">Verified</span>
            <span className={user.is_verified ? "text-signal" : "text-alert-red"}>
              {user.is_verified ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle className="w-4 h-4 text-soc-400" />
            <span className="text-soc-400 w-24">Active</span>
            <span className={user.is_active ? "text-signal" : "text-alert-red"}>
              {user.is_active ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-soc-400" />
            <span className="text-soc-400 w-24">Created</span>
            <span>{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
