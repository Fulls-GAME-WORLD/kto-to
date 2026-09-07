import { API_CONFIG } from "../configs/api/config/apiConfig.ts"
import { authHeaders } from "../auth/session.ts"

export interface ProfileInfo {
  uuid: string
  name: string
  email: string
}

export async function getProfileInfo(): Promise<ProfileInfo> {
  const res = await fetch(API_CONFIG.BASE_URL + API_CONFIG.AUTH_ENDPOINTS.MY_PROFILE, {
    headers: { ...authHeaders() },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "not authorized")
  }
  return data as ProfileInfo
}
