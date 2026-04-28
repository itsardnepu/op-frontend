import { useState } from 'react'
import { useSettingsStore, type LocationSettings } from '../store/settingsStore'
import cities from '../data/cities.json'

export default function Location() {
  const { location, setLocation } = useSettingsStore()
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredCities = cities.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  )

  const handleUseMyLocation = () => {
    setLoading(true)
    setError(null)
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: LocationSettings = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          tz: 'Asia/Kolkata',
          label: `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`,
        }
        setLocation(loc)
        setLoading(false)
      },
      (err) => {
        setError(err.message || 'Could not get location')
        setLoading(false)
      }
    )
  }

  const selectCity = (c: (typeof cities)[0]) => {
    const loc: LocationSettings = {
      lat: c.lat,
      lon: c.lon,
      tz: c.tz,
      label: c.label,
    }
    setLocation(loc)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-slate-800">Location</h1>
      <p className="mt-1 text-slate-600">స్థానం / Set your location for accurate Panchang</p>

      <div className="mt-4 space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-medium text-slate-700">Current location</p>
          <p className="mt-1 text-slate-600">
            {location?.label ?? 'Hyderabad'} ({location?.lat?.toFixed(2)}, {location?.lon?.toFixed(2)})
          </p>
        </div>

        <button
          onClick={handleUseMyLocation}
          disabled={loading}
          className="w-full rounded-lg bg-slate-800 px-4 py-3 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? 'Getting location...' : 'Use my location'}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-slate-700">Search city</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type city name..."
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200">
          {filteredCities.slice(0, 20).map((c) => (
            <button
              key={c.label}
              onClick={() => selectCity(c)}
              className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 last:border-b-0"
            >
              <span className="font-medium text-slate-800">{c.label}</span>
              <span className="text-xs text-slate-500">{c.tz}</span>
            </button>
          ))}
          {filteredCities.length === 0 && (
            <p className="px-4 py-3 text-slate-500">No cities found</p>
          )}
        </div>
      </div>
    </div>
  )
}
