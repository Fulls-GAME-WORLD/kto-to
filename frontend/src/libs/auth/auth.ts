import { API_CONFIG } from "../configs/api/config/apiConfig.ts"

const AUTH_TOKEN_COOKIE = "auth_token"
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 60

export function getToken(): string | null {
  if (typeof document === "undefined") {
    return null
  }
  const found = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${AUTH_TOKEN_COOKIE}=`))
  return found ? decodeURIComponent(found.split("=")[1]) : null
}

export function setToken(token: string): void {
  if (typeof document === "undefined") {
    return
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${AUTH_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

export function clearToken(): void {
  if (typeof document === "undefined") {
    return
  }
  document.cookie = `${AUTH_TOKEN_COOKIE}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Path=/`
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export interface AuthResult {
  token: string
  uuid: string
  name: string
}

async function parseOrThrow(res: Response): Promise<AuthResult> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "auth failed")
  }
  return data as AuthResult
}

export async function register(name: string, email: string, password: string): Promise<AuthResult> {
  const res = await fetch(API_CONFIG.BASE_URL + API_CONFIG.AUTH_ENDPOINTS.REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  })
  const out = await parseOrThrow(res)
  setToken(out.token)
  return out
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const res = await fetch(API_CONFIG.BASE_URL + API_CONFIG.AUTH_ENDPOINTS.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  const out = await parseOrThrow(res)
  setToken(out.token)
  return out
}

export async function myProfile(): Promise<{ uuid: string; name: string; email: string }> {
  const res = await fetch(API_CONFIG.BASE_URL + API_CONFIG.AUTH_ENDPOINTS.MY_PROFILE, {
    headers: { ...authHeaders() },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "not authorized")
  }
  return data as { uuid: string; name: string; email: string }
}

export function logout(): void {
  clearToken()
}
