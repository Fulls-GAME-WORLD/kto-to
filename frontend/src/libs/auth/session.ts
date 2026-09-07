const AUTH_TOKEN_COOKIE = "auth_token"
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 60

export function getAuthToken(): string | null {
  if (typeof document === "undefined") {
    return null
  }
  const found = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${AUTH_TOKEN_COOKIE}=`))
  return found ? decodeURIComponent(found.split("=")[1]) : null
}

export function saveAuthToken(token: string): void {
  if (typeof document === "undefined") {
    return
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${AUTH_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

export function clearAuthSession(): void {
  if (typeof document === "undefined") {
    return
  }
  document.cookie = `${AUTH_TOKEN_COOKIE}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Path=/`
}

export function hasAuthToken(): boolean {
  return getAuthToken() !== null
}

export function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
