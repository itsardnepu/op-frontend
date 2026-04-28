/** YYYY-MM-DD in `timeZone` for an instant; avoids fragile `toLocaleDateString` string ordering. */
export function calendarDateKeyInTimeZone(iso: string, timeZone: string): string | null {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return null
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(d)
    const y = parts.find((p) => p.type === 'year')?.value
    const m = parts.find((p) => p.type === 'month')?.value
    const day = parts.find((p) => p.type === 'day')?.value
    if (y == null || m == null || day == null) return null
    return `${y}-${m}-${day}`
  } catch {
    return null
  }
}

export const MINUTES_PER_DAY = 24 * 60

/** Minutes since local midnight in `timeZone`; uses formatToParts so parsing does not depend on punctuation. */
export function minutesSinceMidnightInTimeZone(iso: string, timeZone: string): number | null {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return null
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      hourCycle: 'h23',
    }).formatToParts(d)
    const hourPart = parts.find((p) => p.type === 'hour')?.value
    const minutePart = parts.find((p) => p.type === 'minute')?.value
    if (hourPart == null || minutePart == null) return null
    const hh = parseInt(hourPart, 10)
    const mm = parseInt(minutePart, 10)
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null
    const total = hh * 60 + mm
    if (total < 0 || total > MINUTES_PER_DAY) return null
    return total
  } catch {
    return null
  }
}

export function formatTime(iso: string, format: '12' | '24', timeZone?: string): string {
  const d = new Date(iso)
  const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: format === '12' }
  if (timeZone) opts.timeZone = timeZone
  if (format === '24') return d.toLocaleTimeString('en-GB', { ...opts, hour12: false })
  return d.toLocaleTimeString('en-US', opts)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

/** Short civil date + time in `timeZone` (for tithi windows that cross midnight). */
function formatCivilDateTimeInZone(iso: string, timeZone: string, timeFormat: '12' | '24'): string {
  const d = new Date(iso)
  const datePart = new Intl.DateTimeFormat(undefined, {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(d)
  return `${datePart} ${formatTime(iso, timeFormat, timeZone)}`
}

/**
 * Bracket suffix for festival rows: ruling tithi start → end in local time,
 * with calendar disambiguation when the instant is not on `referenceCivilDate` (YYYY-MM-DD in `timeZone`).
 */
export function formatFestivalTithiBracket(
  festival: { tithiStart?: string | null; tithiEnd?: string | null },
  referenceCivilDate: string,
  timeZone: string,
  timeFormat: '12' | '24'
): string {
  const { tithiStart, tithiEnd } = festival
  if (tithiStart == null || tithiStart === '') return ''

  const startKey = calendarDateKeyInTimeZone(tithiStart, timeZone)
  const showRichStart = startKey != null && startKey !== referenceCivilDate
  const startLabel = showRichStart
    ? formatCivilDateTimeInZone(tithiStart, timeZone, timeFormat)
    : formatTime(tithiStart, timeFormat, timeZone)

  if (!tithiEnd) return ` (${startLabel} – …)`

  const endKey = calendarDateKeyInTimeZone(tithiEnd, timeZone)
  const showRichEnd =
    endKey != null &&
    (endKey !== referenceCivilDate || (startKey != null && endKey !== startKey))
  const endLabel = showRichEnd
    ? formatCivilDateTimeInZone(tithiEnd, timeZone, timeFormat)
    : formatTime(tithiEnd, timeFormat, timeZone)

  return ` (${startLabel} – ${endLabel})`
}
