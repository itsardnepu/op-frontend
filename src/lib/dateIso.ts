/** Shift a calendar date string (YYYY-MM-DD) by whole days in local semantics. */
export function shiftIsoDateByDays(isoDate: string, deltaDays: number): string {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + deltaDays)
  return d.toISOString().slice(0, 10)
}
