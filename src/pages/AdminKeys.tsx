import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { apiUrl } from '../lib/api'

type AdminKey = {
  id: string
  name: string
  prefix: string
  isActive: boolean
  rateLimitPerMin: number
  createdAt: string
  lastUsedAt: string | null
}

export default function AdminKeys() {
  const [token, setToken] = useState(() => sessionStorage.getItem('adminToken') || '')
  const [loaded, setLoaded] = useState(false)
  const [keys, setKeys] = useState<AdminKey[]>([])
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRate, setNewRate] = useState('60')
  const [newPlainKey, setNewPlainKey] = useState<string | null>(null)

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      'x-admin-token': token,
    }),
    [token]
  )

  const loadKeys = async () => {
    setError(null)
    try {
      const res = await fetch(apiUrl('/api/v1/admin/keys'), { headers })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || `Failed (${res.status})`)
      }
      const data = await res.json()
      setKeys(data.keys || [])
      setLoaded(true)
      sessionStorage.setItem('adminToken', token)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)
    setNewPlainKey(null)
    try {
      const res = await fetch(apiUrl('/api/v1/admin/keys'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: newName, rateLimitPerMin: Number(newRate) || 60 }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || `Failed (${res.status})`)
      }
      const data = await res.json()
      setNewPlainKey(data.key)
      setNewName('')
      await loadKeys()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const toggleActive = async (k: AdminKey) => {
    setError(null)
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/keys/${k.id}`), {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isActive: !k.isActive }),
      })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      await loadKeys()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const removeKey = async (k: AdminKey) => {
    if (!confirm(`Delete key "${k.name}"?`)) return
    setError(null)
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/keys/${k.id}`), {
        method: 'DELETE',
        headers,
      })
      if (!res.ok && res.status !== 204) throw new Error(`Failed (${res.status})`)
      await loadKeys()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const updateRate = async (k: AdminKey, nextRate: number) => {
    setError(null)
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/keys/${k.id}`), {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ rateLimitPerMin: nextRate }),
      })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      await loadKeys()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Admin API Keys</h1>

      <div className="glass-surface p-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Admin token</label>
        <div className="mt-2 flex gap-2">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <button type="button" onClick={loadKeys} className="btn-blue">
            Connect
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loaded && (
        <>
          <form onSubmit={handleCreate} className="glass-surface p-4">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Create key</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="name"
                required
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <input
                type="number"
                min={1}
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <button type="submit" className="btn-blue" disabled={creating}>
                {creating ? 'Creating...' : 'Generate'}
              </button>
            </div>
            {newPlainKey && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                New key (shown once): <code>{newPlainKey}</code>
              </p>
            )}
          </form>

          <div className="glass-surface p-0">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/40">
                  <tr className="text-left">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Prefix</th>
                    <th className="px-3 py-2">Rate/min</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Last used</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="px-3 py-2">{k.name}</td>
                      <td className="px-3 py-2">{k.prefix}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={1}
                          defaultValue={k.rateLimitPerMin}
                          className="w-24 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-950"
                          onBlur={(e) => {
                            const v = Number(e.currentTarget.value)
                            if (Number.isFinite(v) && v > 0 && v !== k.rateLimitPerMin) updateRate(k, v)
                          }}
                        />
                      </td>
                      <td className="px-3 py-2">{k.isActive ? 'active' : 'inactive'}</td>
                      <td className="px-3 py-2">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : '—'}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button type="button" className="btn-outline" onClick={() => toggleActive(k)}>
                            {k.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button type="button" className="btn-outline" onClick={() => removeKey(k)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
