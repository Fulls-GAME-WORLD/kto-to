import { API_CONFIG } from "../configs/api/config/apiConfig.ts"

const TOKEN_KEY = "poster_token"

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
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
