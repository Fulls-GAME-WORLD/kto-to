import { API_CONFIG } from "../configs/api/config/apiConfig.ts"
import { authHeaders } from "../auth/auth.ts"

export interface Poster {
  id: number
  name: string
  format: string
  width: number
  height: number
  scene: string
  previewUrl: string
}

async function parseOrThrow<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "poster request failed")
  }
  return data as T
}

export function listPosters(): Promise<Poster[]> {
  return fetch(API_CONFIG.BASE_URL + API_CONFIG.POSTER_ENDPOINTS.LIST, {
    headers: { ...authHeaders() },
  }).then((res) => parseOrThrow<Poster[]>(res))
}

export function getPoster(id: number): Promise<Poster> {
  return fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.POSTER_ENDPOINTS.GET}/${id}`, {
    headers: { ...authHeaders() },
  }).then((res) => parseOrThrow<Poster>(res))
}

export function createPoster(input: { name: string; format: string; width: number; height: number; scene: string }): Promise<Poster> {
  return fetch(API_CONFIG.BASE_URL + API_CONFIG.POSTER_ENDPOINTS.CREATE, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  }).then((res) => parseOrThrow<Poster>(res))
}

export function updatePoster(id: number, input: Partial<Poster>): Promise<Poster> {
  return fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.POSTER_ENDPOINTS.UPDATE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  }).then((res) => parseOrThrow<Poster>(res))
}

export function deletePoster(id: number): Promise<void> {
  return fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.POSTER_ENDPOINTS.DELETE}/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  }).then(async (res) => {
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as { error?: string }).error ?? "delete failed")
    }
  })
}
