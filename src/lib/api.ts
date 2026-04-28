/** Set on the frontend Vercel project at build time (must start with VITE_). */
const API_KEY =
  (import.meta.env.VITE_API_KEY as string | undefined)?.trim() ||
  (import.meta.env.VITE_PUBLIC_API_KEY as string | undefined)?.trim() ||
  ''

/**
 * Base URL for API calls.
 * - If `VITE_API_URL` is set → use it (direct calls; backend must allow CORS).
 * - Else on localhost → `http://localhost:3000`.
 * - Else in production → same origin (only if you really proxy /api — otherwise set BACKEND_API_ORIGIN on Vercel so prebuild writes VITE_API_URL).
 */
export function getApiBase(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim()
  if (raw && raw.length > 0) return raw.replace(/\/+$/, '')

  if (typeof window !== 'undefined') {
    const { hostname } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:3000'
    return window.location.origin
  }

  return 'http://localhost:3000'
}

export function apiUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(path, getApiBase())
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  return url.toString()
}

export function apiHeaders(): HeadersInit {
  const headers: HeadersInit = {}
  if (API_KEY) {
    headers['x-api-key'] = API_KEY
  }
  return headers
}

async function throwIfNotOk(res: Response): Promise<never> {
  const text = await res.text().catch(() => '')
  let detail = text.slice(0, 240).replace(/\s+/g, ' ').trim()
  try {
    const j = JSON.parse(text) as { message?: string; code?: string }
    if (j?.message) detail = j.message
    else if (j?.code) detail = j.code
  } catch {
    /* ignore */
  }
  throw new Error(detail ? `API ${res.status}: ${detail}` : `API ${res.status}`)
}

export async function fetchApiJson<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = apiUrl(path, params)
  let res: Response
  try {
    res = await fetch(url, { headers: apiHeaders() })
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e)
    throw new Error(
      `${reason} — could not reach ${url}. Live site: set BACKEND_API_ORIGIN (frontend Vercel) to your backend URL, or set VITE_API_URL and redeploy.`
    )
  }
  if (!res.ok) await throwIfNotOk(res)

  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch {
    const t = text.trimStart()
    if (t.startsWith('<!') || t.startsWith('<html') || t.startsWith('<!DOCTYPE')) {
      throw new Error(
        'Got HTML instead of JSON: /api is not reaching your Fastify backend. On the FRONTEND Vercel project add env BACKEND_API_ORIGIN=https://api.onepanchang.com (or your deployed API origin; no slash at end), remove VITE_API_URL, then Redeploy. Or set VITE_API_URL to that backend URL and redeploy.'
      )
    }
    throw new Error(`Invalid JSON from API (${url})`)
  }
}
