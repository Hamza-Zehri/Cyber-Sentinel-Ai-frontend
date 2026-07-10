const TOKEN_KEY = "cs_access_token"
const REFRESH_KEY = "cs_refresh_token"

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface User {
  id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
  is_verified: boolean
  created_at: string
}

export interface Alert {
  id: string
  timestamp: string
  alert_type: string
  severity: string
  source_ip: string | null
  target_ip: string | null
  description: string
  is_resolved: boolean
  resolved_at: string | null
}

export interface Packet {
  id: string
  timestamp: string
  src_ip: string
  dst_ip: string
  src_port: number | null
  dst_port: number | null
  protocol: string
  size_bytes: number
  ttl: number | null
  flags: string | null
  mac_address: string | null
}

export interface PaginatedResponse<T> {
  total: number
  page: number
  page_size: number
  items: T[]
}

export interface CaptureStatus {
  is_running: boolean
  interface: string | null
  packets_captured: number
  alerts_raised: number
}

export interface PhishingResult {
  url: string
  label: string
  risk_score: number
  confidence: number
  reasons: string[]
  explanation: string
}

export interface MalwareResult {
  filename: string
  sha256: string
  md5: string
  size_bytes: number
  entropy: number
  label: string
  malware_probability: number
  confidence: number
  reasons: string[]
  quarantined: boolean
  quarantine_path: string | null
}

export interface PasswordResult {
  length: number
  entropy_bits: number
  strength: string
  is_common_password: boolean
  has_sequential_pattern: boolean
  has_repeated_characters: boolean
  has_keyboard_pattern: boolean
  estimated_crack_time: string
  recommendations: string[]
}

export interface SystemSetting {
  id: string
  key: string
  value: string | null
  category: string
}

export interface Report {
  id: string
  report_type: string
  period: string
  file_format: string
  file_path: string
  generated_by: string | null
  created_at: string
}

export interface BackupEntry {
  filename: string
  size_bytes: number
  created_at: string
}

export interface NotificationItem {
  id: string
  user_id: string | null
  title: string
  message: string
  notification_type: string
  is_read: boolean
  created_at: string
}

export interface UserAdmin {
  id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
  is_verified: boolean
  created_at: string
}

export interface RoleEntry {
  id: string
  name: string
  description: string | null
  permission_codes: string[]
}

export interface InterfaceInfo {
  name: string
  connected: boolean
  mtu: number
  metric: number
}

export interface AuditLogEntry {
  id: string
  user_id: string | null
  action: string
  module: string
  ip_address: string | null
  result: string
  details: string | null
  timestamp: string
  user_email: string | null
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setTokens(pair: TokenPair): void {
  localStorage.setItem(TOKEN_KEY, pair.access_token)
  localStorage.setItem(REFRESH_KEY, pair.refresh_token)
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem(REFRESH_KEY)
  if (!refresh) return null
  try {
    const res = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    })
    if (!res.ok) { clearTokens(); return null }
    const pair: TokenPair = await res.json()
    setTokens(pair)
    return pair.access_token
  } catch { clearTokens(); return null }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  let res = await fetch(path, { ...options, headers })

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`
      res = await fetch(path, { ...options, headers })
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || "Request failed")
  }

  return res.json()
}
