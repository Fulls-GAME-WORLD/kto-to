import { API_CONFIG } from "../configs/api/config/apiConfig.ts"
import { saveAuthToken } from "./session.ts"

export interface AuthRegisterResult {
  token: string
  uuid: string
  name: string
}

export async function registerMyNewAccount(name: string, email: string, password: string): Promise<AuthRegisterResult> {
  const res = await fetch(API_CONFIG.BASE_URL + API_CONFIG.AUTH_ENDPOINTS.REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "auth failed")
  }
  const out = data as AuthRegisterResult
  saveAuthToken(out.token)
  return out
}
