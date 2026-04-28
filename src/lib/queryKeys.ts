/** Centralized TanStack Query keys for consistent caching and invalidation. */

export const queryKeys = {
  panchangDate: (date: string, lat: number, lon: number, tz: string, lang: string) =>
    ['panchang', 'date', date, lat, lon, tz, lang] as const,
}
