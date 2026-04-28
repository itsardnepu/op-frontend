/**
 * Runs before `vite build` (see package.json `prebuild`).
 *
 * If BACKEND_API_ORIGIN=https://api.onepanchang.com (or your API host) is set on the *frontend*
 * Vercel project, writes `.env.production.local` with VITE_API_URL so the built
 * app calls the backend directly (avoids relying on edge rewrites, which can
 * return index.html for /api and break JSON parsing).
 *
 * Also writes `vercel.json` with SPA fallback only.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = path.join(root, 'vercel.json')
const envLocal = path.join(root, '.env.production.local')
const marker = '# onepanchang-vercel-generated\n'

const backend = (process.env.BACKEND_API_ORIGIN || '').trim().replace(/\/+$/, '')

const rewrites = [{ source: '/(.*)', destination: '/index.html' }]
fs.writeFileSync(out, JSON.stringify({ rewrites }, null, 2) + '\n')

if (backend.startsWith('https://')) {
  fs.writeFileSync(envLocal, `${marker}VITE_API_URL=${backend}\n`)
  console.log('[write-vercel-config] VITE_API_URL →', backend, '(via .env.production.local)')
} else {
  try {
    const cur = fs.readFileSync(envLocal, 'utf8')
    // Historical first-line markers only (must match older generated files so we can remove stale env).
    const generatedPrefixes = [
      '# otp-vercel-generated\n',
      '# smartpanchangam-vercel-generated\n',
      '# smartpanchang-vercel-generated\n',
      marker,
    ]
    if (generatedPrefixes.some((p) => cur.startsWith(p))) fs.unlinkSync(envLocal)
  } catch {
    /* no file */
  }
  console.log('[write-vercel-config] SPA vercel.json only (set BACKEND_API_ORIGIN on Vercel for production API URL)')
}
