import type { LocationSettings } from '../store/settingsStore'

/** Hyderabad — used when no location is set and for UI fallbacks. */
export const DEFAULT_LOCATION: LocationSettings = {
  lat: 17.385,
  lon: 78.4867,
  tz: 'Asia/Kolkata',
  label: 'Hyderabad',
}
