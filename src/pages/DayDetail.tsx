import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { setLastViewedDate } from '../components/OfflineBanner'
import { useSettingsStore } from '../store/settingsStore'
import { fetchApiJson } from '../lib/api'
import type { PanchangResponse } from '../types/panchang'
import { formatDate, formatTime } from '../lib/panchangFormat'
import { queryKeys } from '../lib/queryKeys'

export default function DayDetail() {
  const { date } = useParams<{ date: string }>()
  const { language, timeFormat, location } = useSettingsStore()

  const { data, isLoading, error } = useQuery<PanchangResponse>({
    queryKey: date
      ? queryKeys.panchangDate(date, location?.lat ?? 0, location?.lon ?? 0, location?.tz ?? 'UTC', language)
      : ['panchang', 'date', 'disabled'],
    queryFn: () =>
      fetchApiJson<PanchangResponse>('/api/v1/panchang/date', {
        date: date!,
        lat: String(location!.lat),
        lon: String(location!.lon),
        tz: location!.tz,
        ayanamsa: 'lahiri',
        lang: language,
      }),
    enabled: Boolean(date && location && /^\d{4}-\d{2}-\d{2}$/.test(date)),
  })

  useEffect(() => {
    if (data?.day?.date) setLastViewedDate(data.day.date)
  }, [data?.day?.date])

  if (!date) return <div className="p-4 text-red-600">Invalid date</div>

  if (!location) {
    return (
      <div className="p-4 text-slate-700 dark:text-slate-200">
        <p className="text-slate-600 dark:text-slate-400">Set a location on the home page to view panchang for this day.</p>
        <Link to="/" className="mt-3 inline-block text-blue-600 underline dark:text-blue-400">
          Go to Today
        </Link>
      </div>
    )
  }

  const loc = location

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-slate-800">{date}</h1>
        <div className="mt-4 animate-pulse space-y-3">
          <div className="h-4 rounded bg-slate-200" />
          <div className="h-4 rounded bg-slate-200" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-slate-800">{date}</h1>
        <div className="mt-2 space-y-1 text-red-600">
          <p>Failed to load Panchang.</p>
          {error instanceof Error && error.message && <p className="text-sm opacity-90">{error.message}</p>}
        </div>
      </div>
    )
  }

  const { day, panchang, kaalams, abhijit, brahmaMuhurtam, amrutaGhadiyalu, varjam, durmuhurtham } = data

  const handleShare = async () => {
    const lines = [
      `One Panchang · ${formatDate(day.date)}`,
      `వారం: ${day.vara}`,
      day.pakshamName && `పక్షం: ${day.pakshamName}`,
      day.moonsignName && `చంద్ర రాశి: ${day.moonsignName}`,
      day.sunsignName && `సూర్య రాశి: ${day.sunsignName}`,
      `సూర్యోదయం: ${formatTime(day.sunrise, timeFormat, loc.tz)} | సూర్యాస్తమయం: ${formatTime(day.sunset, timeFormat, loc.tz)}`,
      ...panchang.map((p) => {
        const range =
          p.startTime && p.endTime
            ? ` (${formatTime(p.startTime, timeFormat, loc.tz)} – ${formatTime(p.endTime, timeFormat, loc.tz)})`
            : p.endTime
              ? ` (until ${formatTime(p.endTime, timeFormat, loc.tz)})`
              : ''
        return `${p.type}: ${p.name}${range}`
      }),
      abhijit && `అభిజిత్: ${formatTime(abhijit.start, timeFormat, loc.tz)} – ${formatTime(abhijit.end, timeFormat, loc.tz)}`,
      brahmaMuhurtam && `బ్రహ్మ ముహూర్తం: ${formatTime(brahmaMuhurtam.start, timeFormat, loc.tz)} – ${formatTime(brahmaMuhurtam.end, timeFormat, loc.tz)}`,
      amrutaGhadiyalu?.length && `అమృత ఘడియలు: ${amrutaGhadiyalu.map((a) => `${formatTime(a.start, timeFormat, loc.tz)}–${formatTime(a.end, timeFormat, loc.tz)}`).join(', ')}`,
      varjam && `వర్జం: ${formatTime(varjam.start, timeFormat, loc.tz)} – ${formatTime(varjam.end, timeFormat, loc.tz)}`,
      durmuhurtham?.length &&
        `దుర్ముహూర్తం: ${durmuhurtham.map((d) => `${formatTime(d.start, timeFormat, loc.tz)}–${formatTime(d.end, timeFormat, loc.tz)}`).join(', ')}`,
      `Kaalams: ${kaalams.map((k) => `${k.name} ${formatTime(k.start, timeFormat, loc.tz)}-${formatTime(k.end, timeFormat, loc.tz)}`).join(' | ')}`,
    ]
    const text = lines.filter(Boolean).join('\n')
    if (navigator.share) {
      try {
        await navigator.share({ title: 'One Panchang', text })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') navigator.clipboard.writeText(text)
      }
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatDate(day.date)}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{loc.label ?? `${loc.lat}, ${loc.lon}`}</p>
        </div>
        <button
          onClick={handleShare}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Share
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div className="glass-card">
          <div className="space-y-2 text-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium text-slate-700 dark:text-slate-200">Vara</span>
              <span className="text-right text-slate-800 dark:text-slate-100">{day.vara}</span>
            </div>
            {day.pakshamName != null && (
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-slate-700 dark:text-slate-200">Paksham</span>
                <span className="text-right text-slate-800 dark:text-slate-100">{day.pakshamName}</span>
              </div>
            )}
            {day.moonsignName != null && (
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-slate-700 dark:text-slate-200">Moonsign</span>
                <span className="text-right text-slate-800 dark:text-slate-100">{day.moonsignName}</span>
              </div>
            )}
            {day.sunsignName != null && (
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-slate-700 dark:text-slate-200">Sunsign</span>
                <span className="text-right text-slate-800 dark:text-slate-100">{day.sunsignName}</span>
              </div>
            )}
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium text-slate-700 dark:text-slate-200">Sunrise</span>
              <span className="text-right text-slate-800 dark:text-slate-100">{formatTime(day.sunrise, timeFormat, loc.tz)}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium text-slate-700 dark:text-slate-200">Sunset</span>
              <span className="text-right text-slate-800 dark:text-slate-100">{formatTime(day.sunset, timeFormat, loc.tz)}</span>
            </div>
          </div>
        </div>

        <details className="glass-surface p-0" open>
          <summary className="cursor-pointer select-none list-none rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-900/40">
            Panchang
            <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">(tithi, nakshatra, yoga, karana)</span>
          </summary>
          <div className="px-4 pb-4">
            <div className="glass-card">
              <div className="space-y-2">
                {panchang.map((item, i) => (
                  <div key={`${item.type}-${i}-${item.name}`} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500 capitalize dark:text-slate-400">{item.type}</p>
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                    </div>
                    {item.startTime && item.endTime ? (
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Span</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {formatTime(item.startTime, timeFormat, loc.tz)} –{' '}
                          {formatTime(item.endTime, timeFormat, loc.tz)}
                        </p>
                      </div>
                    ) : item.endTime ? (
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Ends</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {formatTime(item.endTime, timeFormat, loc.tz)}
                        </p>
                      </div>
                    ) : item.startTime ? (
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400">From</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {formatTime(item.startTime, timeFormat, loc.tz)}
                        </p>
                      </div>
                    ) : (
                      <p className="shrink-0 text-xs text-slate-400 dark:text-slate-500">—</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </details>

        <details className="glass-surface p-0">
          <summary className="cursor-pointer select-none list-none rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-900/40">
            Muhurtas & special periods
          </summary>
          <div className="px-4 pb-4">
            <div className="glass-card">
              <div className="space-y-2 text-sm">
                {abhijit && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Abhijit</span>
                    <span className="text-slate-800 dark:text-slate-100">
                      {formatTime(abhijit.start, timeFormat, loc.tz)} – {formatTime(abhijit.end, timeFormat, loc.tz)}
                    </span>
                  </div>
                )}
                {brahmaMuhurtam && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Brahma Muhurtam</span>
                    <span className="text-slate-800 dark:text-slate-100">
                      {formatTime(brahmaMuhurtam.start, timeFormat, loc.tz)} – {formatTime(brahmaMuhurtam.end, timeFormat, loc.tz)}
                    </span>
                  </div>
                )}
                {amrutaGhadiyalu && amrutaGhadiyalu.length > 0 && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Amruta Ghadiyalu</span>
                    <span className="text-right text-slate-800 dark:text-slate-100">
                      {amrutaGhadiyalu.map((a) => `${formatTime(a.start, timeFormat, loc.tz)}–${formatTime(a.end, timeFormat, loc.tz)}`).join(', ')}
                    </span>
                  </div>
                )}
                {varjam && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Varjam</span>
                    <span className="text-slate-800 dark:text-slate-100">
                      {formatTime(varjam.start, timeFormat, loc.tz)} – {formatTime(varjam.end, timeFormat, loc.tz)}
                    </span>
                  </div>
                )}
                {durmuhurtham && durmuhurtham.length > 0 && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Durmuhurtham</span>
                    <span className="text-right text-slate-800 dark:text-slate-100">
                      {durmuhurtham.map((d) => `${formatTime(d.start, timeFormat, loc.tz)} – ${formatTime(d.end, timeFormat, loc.tz)}`).join(', ')}
                    </span>
                  </div>
                )}
                {!abhijit && !brahmaMuhurtam && (!amrutaGhadiyalu || amrutaGhadiyalu.length === 0) && !varjam && (!durmuhurtham || durmuhurtham.length === 0) && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No timings for this day.</p>
                )}
              </div>
            </div>
          </div>
        </details>

        <details className="glass-surface p-0">
          <summary className="cursor-pointer select-none list-none rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-900/40">
            Kaalams
          </summary>
          <div className="space-y-3 px-4 pb-4">
            <div className="glass-card">
              <div className="space-y-2">
                {kaalams.map((k) => (
                  <div key={k.name} className="flex justify-between text-sm">
                    <span className="font-medium capitalize text-slate-700 dark:text-slate-200">{k.name}</span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {formatTime(k.start, timeFormat, loc.tz)} – {formatTime(k.end, timeFormat, loc.tz)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}
