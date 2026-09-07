import { API_CONFIG } from "../configs/api/config/apiConfig.ts"
import { authHeaders } from "../auth/session.ts"
import type { Poster } from "../posters/posters.ts"

export interface PosterTemplate {
  id: number
  name: string
  format: string
  scene: string
  previewUrl: string
}

export async function listTemplates(): Promise<PosterTemplate[]> {
  const res = await fetch(API_CONFIG.BASE_URL + API_CONFIG.TEMPLATE_ENDPOINTS.LIST)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "templates request failed")
  }
  return data as PosterTemplate[]
}

export async function cloneTemplate(id: number): Promise<Poster> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.TEMPLATE_ENDPOINTS.CLONE}/${id}`, {
    method: "POST",
    headers: { ...authHeaders() },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "clone failed")
  }
  return data as Poster
}
