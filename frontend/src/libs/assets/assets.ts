import { API_CONFIG } from "../configs/api/config/apiConfig.ts"
import { authHeaders } from "../auth/auth.ts"

export interface PosterAsset {
  id: number
  filename: string
  url: string
  mime: string
  size: number
}

export async function listAssets(): Promise<PosterAsset[]> {
  const res = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ASSET_ENDPOINTS.LIST, {
    headers: { ...authHeaders() },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "assets request failed")
  }
  return data as PosterAsset[]
}

export async function uploadAsset(file: File): Promise<PosterAsset> {
  const form = new FormData()
  form.append("asset", file)
  const token = localStorage.getItem("poster_token")
  const res = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ASSET_ENDPOINTS.UPLOAD, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "upload failed")
  }
  return data as PosterAsset
}

export async function deleteAsset(id: number): Promise<void> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ASSET_ENDPOINTS.DELETE}/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error ?? "delete failed")
  }
}
