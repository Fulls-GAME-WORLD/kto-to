import { API_CONFIG } from "../configs/api/config/apiConfig.ts"
import { saveAuthToken } from "./session.ts"

export interface AuthLoginResult {
  token: string
  uuid: string
  name: string
}

export async function loginInMyAccount(email: string, password: string): Promise<AuthLoginResult> {
  const res = await fetch(API_CONFIG.BASE_URL + API_CONFIG.AUTH_ENDPOINTS.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "auth failed")
  }
  const out = data as AuthLoginResult
  saveAuthToken(out.token)
  return out
}
