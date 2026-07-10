import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { apiRequest } from "../lib/api"
import { Shield, CheckCircle, XCircle } from "lucide-react"

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Missing verification token"); return }
    apiRequest<{ message: string }>("/api/v1/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then((res) => { setStatus("success"); setMessage(res.message) })
      .catch((err) => { setStatus("error"); setMessage(err.message) })
  }, [token])

  return (
    <div className="min-h-screen bg-soc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <Shield className="w-12 h-12 text-signal mx-auto mb-6" />

        {status === "loading" && (
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-signal border-t-transparent mx-auto" />
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-10 h-10 text-signal mx-auto mb-4" />
            <p className="text-soc-100 mb-4">{message}</p>
            <Link to="/login" className="text-signal hover:underline text-sm">Sign In</Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-10 h-10 text-alert-red mx-auto mb-4" />
            <p className="text-soc-100 mb-4">{message}</p>
            <Link to="/login" className="text-signal hover:underline text-sm">Back to Sign In</Link>
          </>
        )}
      </div>
    </div>
  )
}
