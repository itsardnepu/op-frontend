import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { useSettingsStore } from '../store/settingsStore'
import { fetchApiJson } from '../lib/api'
import { setLastViewedDate } from '../components/OfflineBanner'
import { LogoMark } from '../components/LogoMark'
import type { PanchangResponse } from '../types/panchang'
import { shiftIsoDateByDays } from '../lib/dateIso'
import {
  calendarDateKeyInTimeZone,
  formatDate,
  formatFestivalTithiBracket,
  formatTime,
  MINUTES_PER_DAY,
  minutesSinceMidnightInTimeZone,
} from '../lib/panchangFormat'
import {
  KARANA_NAMES_EN,
  KARANA_NAMES_TE,
  LUNAR_MONTHS_EN,
  LUNAR_MONTHS_TE,
  NAKSHATRA_NAMES_EN,
  NAKSHATRA_NAMES_TE,
  TITHI_NAMES_EN,
  TITHI_NAMES_TE,
  YOGA_NAMES_EN,
  YOGA_NAMES_TE,
  VARA_COLLOQUIAL_TE,
  VARA_COLLOQUIAL_TE_LATIN,
} from '../lib/panchangNames'
import { queryKeys } from '../lib/queryKeys'
import { isSiderealUttarayana } from '../lib/siderealAyanam'
import { captureTimelineShareJpeg } from '../lib/timelineShareImage'

/** One automatic geolocation prompt per full page load (avoids duplicate under React Strict Mode). */
let todayPageInitialGeolocationStarted = false

export default function Today() {
  const { language, timeFormat, theme, location, setLocation } = useSettingsStore()
  const { setTheme, setLanguage, setTimeFormat, fontScale, setFontScale } = useSettingsStore()
  const today = new Date().toISOString().slice(0, 10)
  const [selectedDate, setSelectedDate] = useState(today)
  const [showMobileFloatingToggles, setShowMobileFloatingToggles] = useState(false)
  const [showLocationControls, setShowLocationControls] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [manualLat, setManualLat] = useState('')
  const [manualLon, setManualLon] = useState('')
  const [placeQuery, setPlaceQuery] = useState('')
  const [placeSearching, setPlaceSearching] = useState(false)
  const [placeResults, setPlaceResults] = useState<{ lat: number; lon: number; displayName: string }[]>([])
  const [locationError, setLocationError] = useState<string | null>(null)
  const [nowTick, setNowTick] = useState(() => Date.now())
  const [shareTimelineExporting, setShareTimelineExporting] = useState(false)
  const placeInputRef = useRef<HTMLInputElement | null>(null)
  const placeSearchAnchorRef = useRef<HTMLDivElement | null>(null)
  const dateInputRef = useRef<HTMLInputElement | null>(null)
  const [placeMenuBox, setPlaceMenuBox] = useState<{ top: number; left: number; width: number } | null>(null)
  const isTelugu = language === 'te'
  const pickerText = isTelugu
    ? {
        location: 'ప్రదేశం',
        panchangForLocation: 'ప్రస్తుత ప్రదేశానికి పంచాంగ గణన',
        setLocation: 'ప్రదేశం ఇవ్వండి',
        locationNotSet: 'ప్రదేశం ఇంకా లేదు',
        locationPromptHint:
          'మీ బ్రౌజర్ స్థాన అనుమతి అడిగినప్పుడు అనుమతించండి. నిరాకరిస్తే క్రింద నగరం లేదా అక్షాంశ/రేఖాంశాలు నమోదు చేయండి.',
        needLocationForPanchang: 'పంచాంగం చూడటానికి ముందుగా ప్రదేశం ఎంచుకోండి.',
        close: 'మూసివేయి',
        change: 'మార్చు',
        detecting: 'గుర్తిస్తోంది…',
        detect: '📍 గుర్తించు',
        cityOrPlace: 'నగరం లేదా ప్రదేశం పేరు',
        search: 'వెతుకు',
        orEnterCoordinates: 'లేదా కోఆర్డినేట్లు ఇవ్వండి',
        lat: 'అక్షాంశం',
        lon: 'రేఖాంశం',
        apply: 'వర్తింపజేయి',
        previousDay: 'నిన్న',
        today: 'ఈ రోజు',
        nextDay: 'రేపు',
        pickDateFromCalendar: 'క్యాలెండర్ నుండి తేదీ ఎంచుకోండి',
        openCalendar: 'క్యాలెండర్',
        geolocationNotSupported: 'Geolocation సపోర్ట్ లేదు',
        couldNotGetLocation: 'ప్రదేశం పొందలేకపోయాము',
        enterAtLeastTwoChars: 'కనీసం 2 అక్షరాలు ఇవ్వండి',
        noResultsFound: 'ఫలితాలు లభించలేదు',
        searchFailed: 'వెతకడం విఫలమైంది',
        latitudeRange: 'అక్షాంశం -90 నుండి 90 మధ్యలో ఉండాలి',
        longitudeRange: 'రేఖాంశం -180 నుండి 180 మధ్యలో ఉండాలి',
      }
    : {
        location: 'Location',
        panchangForLocation: 'Panchang data calculated for current location',
        setLocation: 'Set location',
        locationNotSet: 'No location set yet',
        locationPromptHint:
          'Allow location when your browser asks. If you block it, search for a place or enter latitude and longitude below.',
        needLocationForPanchang: 'Choose a location to view panchang for that place.',
        close: 'Close',
        change: 'Change',
        detecting: 'Detecting…',
        detect: '📍 Detect',
        cityOrPlace: 'City or place name',
        search: 'Search',
        orEnterCoordinates: 'or enter coordinates',
        lat: 'Lat',
        lon: 'Lon',
        apply: 'Apply',
        previousDay: 'Yesterday',
        today: 'Today',
        nextDay: 'Tomorrow',
        pickDateFromCalendar: 'Choose a date from the calendar',
        openCalendar: 'Calendar',
        geolocationNotSupported: 'Geolocation is not supported',
        couldNotGetLocation: 'Could not get location',
        enterAtLeastTwoChars: 'Enter at least 2 characters',
        noResultsFound: 'No results found',
        searchFailed: 'Search failed',
        latitudeRange: 'Latitude must be between -90 and 90',
        longitudeRange: 'Longitude must be between -180 and 180',
      }

  const fetchTimezone = useCallback(async (lat: number, lon: number): Promise<string> => {
    const data = await fetchApiJson<{ timezone?: string }>('/api/v1/meta/timezone', {
      lat: String(lat),
      lon: String(lon),
    })
    return data.timezone || 'UTC'
  }, [])

  const handleDetectLocation = useCallback(() => {
    setLocationError(null)
    setDetecting(true)
    if (!navigator.geolocation) {
      setLocationError(pickerText.geolocationNotSupported)
      setDetecting(false)
      setShowLocationControls(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        try {
          const tz = await fetchTimezone(lat, lon)
          setLocation({ lat, lon, tz, label: `${lat.toFixed(2)}, ${lon.toFixed(2)}` })
          setManualLat(lat.toFixed(4))
          setManualLon(lon.toFixed(4))
        } catch {
          setLocation({ lat, lon, tz: 'UTC', label: `${lat.toFixed(2)}, ${lon.toFixed(2)}` })
          setManualLat(lat.toFixed(4))
          setManualLon(lon.toFixed(4))
        }
        setDetecting(false)
      },
      (err) => {
        setLocationError(err.message || pickerText.couldNotGetLocation)
        setDetecting(false)
        setShowLocationControls(true)
      }
    )
  }, [fetchTimezone, pickerText, setLocation])

  const handleDetectLocationRef = useRef(handleDetectLocation)
  handleDetectLocationRef.current = handleDetectLocation

  useEffect(() => {
    const tryAutoGeolocation = () => {
      if (useSettingsStore.getState().location != null) return
      if (todayPageInitialGeolocationStarted) return
      todayPageInitialGeolocationStarted = true
      handleDetectLocationRef.current()
    }
    const unsub = useSettingsStore.persist.onFinishHydration(tryAutoGeolocation)
    if (useSettingsStore.persist.hasHydrated()) tryAutoGeolocation()
    return unsub
  }, [])

  const handlePlaceSearch = async () => {
    const q = placeQuery.trim()
    if (q.length < 2) {
      setLocationError(pickerText.enterAtLeastTwoChars)
      return
    }
    setLocationError(null)
    setPlaceSearching(true)
    setPlaceResults([])
    try {
      const data = await fetchApiJson<{ results?: { lat: number; lon: number; displayName: string }[] }>(
        '/api/v1/meta/geocode',
        { q, lang: language === 'te' ? 'te' : 'en' }
      )
      if (!data.results?.length) {
        setLocationError(pickerText.noResultsFound)
        return
      }
      setPlaceResults(data.results)
    } catch {
      setLocationError(pickerText.searchFailed)
    } finally {
      setPlaceSearching(false)
    }
  }

  const handlePlaceSelect = async (item: { lat: number; lon: number; displayName: string }) => {
    setLocationError(null)
    setPlaceResults([])
    setPlaceQuery('')
    try {
      const tz = await fetchTimezone(item.lat, item.lon)
      const label = item.displayName.split(',')[0]?.trim() || `${item.lat.toFixed(2)}, ${item.lon.toFixed(2)}`
      setLocation({ lat: item.lat, lon: item.lon, tz, label })
      setManualLat(item.lat.toFixed(4))
      setManualLon(item.lon.toFixed(4))
    } catch {
      setLocation({ lat: item.lat, lon: item.lon, tz: 'UTC', label: item.displayName.split(',')[0] || '' })
    }
  }

  const handleManualApply = async () => {
    const lat = parseFloat(manualLat)
    const lon = parseFloat(manualLon)
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setLocationError(pickerText.latitudeRange)
      return
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setLocationError(pickerText.longitudeRange)
      return
    }
    setLocationError(null)
    try {
      const tz = await fetchTimezone(lat, lon)
      setLocation({ lat, lon, tz, label: `${lat.toFixed(2)}, ${lon.toFixed(2)}` })
    } catch {
      setLocation({ lat, lon, tz: 'UTC', label: `${lat.toFixed(2)}, ${lon.toFixed(2)}` })
    }
  }

  useEffect(() => {
    if (location) {
      setManualLat(location.lat.toFixed(4))
      setManualLon(location.lon.toFixed(4))
    } else {
      setManualLat('')
      setManualLon('')
    }
  }, [location])

  useEffect(() => {
    if (!showLocationControls || !placeInputRef.current) return
    // Only refocus while the user is actively typing (non-empty query). Otherwise we steal focus
    // from the date picker and other controls when location panel is open.
    if (placeQuery.length === 0) return
    if (document.activeElement !== placeInputRef.current) {
      placeInputRef.current.focus()
      const len = placeInputRef.current.value.length
      try {
        placeInputRef.current.setSelectionRange(len, len)
      } catch {
        // ignore if not supported
      }
    }
  }, [placeQuery, showLocationControls])

  const { data, isLoading, error } = useQuery<PanchangResponse>({
    queryKey: queryKeys.panchangDate(
      selectedDate,
      location?.lat ?? 0,
      location?.lon ?? 0,
      location?.tz ?? 'UTC',
      language
    ),
    queryFn: () =>
      fetchApiJson<PanchangResponse>('/api/v1/panchang/date', {
        date: selectedDate,
        lat: String(location!.lat),
        lon: String(location!.lon),
        tz: location!.tz,
        ayanamsa: 'lahiri',
        lang: language,
      }),
    enabled: Boolean(location),
  })

  const timelineShareRootRef = useRef<HTMLDivElement>(null)
  const timelineScrollRef = useRef<HTMLDivElement>(null)
  const timelineSliderTrackRef = useRef<HTMLDivElement>(null)
  const [timelineScrollPct, setTimelineScrollPct] = useState(0)
  const [timelineNeedsSlider, setTimelineNeedsSlider] = useState(false)

  const updateTimelineScrollSlider = useCallback(() => {
    const el = timelineScrollRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setTimelineNeedsSlider(maxScroll > 2)
    setTimelineScrollPct(maxScroll <= 0 ? 0 : (el.scrollLeft / maxScroll) * 100)
  }, [])

  const setTimelineScrollFromSliderClientX = useCallback(
    (clientX: number) => {
      const track = timelineSliderTrackRef.current
      const scrollEl = timelineScrollRef.current
      if (!track || !scrollEl) return
      const rect = track.getBoundingClientRect()
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
      const p = rect.width > 0 ? (x / rect.width) * 100 : 0
      const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth
      if (maxScroll <= 0) return
      scrollEl.scrollLeft = (p / 100) * maxScroll
      updateTimelineScrollSlider()
    },
    [updateTimelineScrollSlider]
  )

  useLayoutEffect(() => {
    const el = timelineScrollRef.current
    if (!el) return
    const ro = new ResizeObserver(() => updateTimelineScrollSlider())
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateTimelineScrollSlider, data?.day?.date])

  useLayoutEffect(() => {
    const el = timelineScrollRef.current
    if (!el || !data?.day?.date || !location?.tz) return
    const calendarToday = calendarDateKeyInTimeZone(new Date().toISOString(), location.tz)
    const viewingToday = calendarToday != null && selectedDate === calendarToday
    requestAnimationFrame(() => {
      const maxScroll = el.scrollWidth - el.clientWidth
      if (maxScroll <= 0) {
        updateTimelineScrollSlider()
        return
      }
      if (!viewingToday) {
        el.scrollLeft = 0
        updateTimelineScrollSlider()
        return
      }
      const inner = el.firstElementChild as HTMLElement | null
      const trackW = inner?.scrollWidth ?? el.scrollWidth
      const nowMin = minutesSinceMidnight(new Date().toISOString(), location.tz) ?? 0
      const pct = (Math.max(0, Math.min(MINUTES_PER_DAY, nowMin)) / MINUTES_PER_DAY) * 100
      const pos = (pct / 100) * trackW - el.clientWidth / 2
      el.scrollLeft = Math.max(0, Math.min(pos, maxScroll))
      updateTimelineScrollSlider()
    })
  }, [data?.day?.date, selectedDate, location?.tz, updateTimelineScrollSlider])

  useEffect(() => {
    if (data?.day?.date) setLastViewedDate(data.day.date)
  }, [data?.day?.date])

  useEffect(() => {
    if (!location?.tz) return
    const calendarToday = calendarDateKeyInTimeZone(new Date().toISOString(), location.tz)
    if (calendarToday == null || selectedDate !== calendarToday) return

    const now = new Date()
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
    let intervalId: number | null = null
    const timeoutId = window.setTimeout(() => {
      setNowTick(Date.now())
      intervalId = window.setInterval(() => setNowTick(Date.now()), 60_000)
    }, msToNextMinute)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId != null) window.clearInterval(intervalId)
    }
  }, [selectedDate, location?.tz])

  // On mobile: show floating toggles only when the top header is not visible.
  useEffect(() => {
    const headerEl = document.querySelector('header')
    if (!headerEl) {
      setShowMobileFloatingToggles(true)
      return
    }

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        const visibleEnough = !!entry?.isIntersecting && (entry.intersectionRatio ?? 0) > 0.2
        setShowMobileFloatingToggles(!visibleEnough)
      },
      { root: null, threshold: [0, 0.2, 0.6, 1] }
    )
    obs.observe(headerEl)
    return () => obs.disconnect()
  }, [])

  const updatePlaceMenuPosition = useCallback(() => {
    const el = placeSearchAnchorRef.current
    if (!el || placeResults.length === 0) {
      setPlaceMenuBox(null)
      return
    }
    const r = el.getBoundingClientRect()
    const gap = 4
    const maxMenuH = 192 // max-h-48
    const spaceBelow = window.innerHeight - r.bottom - gap
    // Open upward when there is not enough room below (avoids covering the date card on narrow layouts)
    const openUp = spaceBelow < maxMenuH + gap && r.top > maxMenuH + gap
    const top = openUp ? Math.max(gap, r.top - maxMenuH - gap) : r.bottom + gap
    setPlaceMenuBox({ top, left: r.left, width: r.width })
  }, [placeResults.length])

  useLayoutEffect(() => {
    updatePlaceMenuPosition()
  }, [updatePlaceMenuPosition, placeResults.length])

  useEffect(() => {
    if (placeResults.length === 0) return
    window.addEventListener('resize', updatePlaceMenuPosition)
    window.addEventListener('scroll', updatePlaceMenuPosition, true)
    return () => {
      window.removeEventListener('resize', updatePlaceMenuPosition)
      window.removeEventListener('scroll', updatePlaceMenuPosition, true)
    }
  }, [placeResults.length, updatePlaceMenuPosition])

  const PickerRow = () => (
    <>
    <div className="relative z-20 grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="relative z-20 glass-surface p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{pickerText.location}</p>
            {location ? (
              <>
                <p
                  className="mt-1 truncate text-xs text-slate-600 dark:text-slate-300 sm:text-sm"
                  title={`${location.label ?? `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`} (TZ: ${location.tz})`}
                >
                  {location.label ?? `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`} (TZ: {location.tz})
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{pickerText.panchangForLocation}</p>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{pickerText.locationNotSet}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{pickerText.locationPromptHint}</p>
                {detecting && (
                  <p className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">{pickerText.detecting}</p>
                )}
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowLocationControls((v) => !v)}
            className="btn-blue"
          >
            {showLocationControls
              ? pickerText.close
              : location
                ? pickerText.change
                : pickerText.setLocation}
          </button>
        </div>

        {showLocationControls && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detecting}
                className="btn-outline disabled:opacity-50"
              >
                {detecting ? pickerText.detecting : pickerText.detect}
              </button>
              <div ref={placeSearchAnchorRef} className="relative flex flex-1 flex-wrap items-center gap-2">
                <input
                  ref={placeInputRef}
                  type="text"
                  placeholder={pickerText.cityOrPlace}
                  value={placeQuery}
                  onChange={(e) => setPlaceQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePlaceSearch()}
                  className="min-w-[140px] flex-1 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handlePlaceSearch}
                  disabled={placeSearching}
                  className="btn-blue disabled:opacity-50"
                >
                  {placeSearching ? '…' : pickerText.search}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">{pickerText.orEnterCoordinates}</span>
              <input
                type="number"
                placeholder={pickerText.lat}
                min={-90}
                max={90}
                step="any"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <input
                type="number"
                placeholder={pickerText.lon}
                min={-180}
                max={180}
                step="any"
                value={manualLon}
                onChange={(e) => setManualLon(e.target.value)}
                className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleManualApply}
                className="btn-blue"
              >
                {pickerText.apply}
              </button>
            </div>

            {locationError && <p className="text-sm text-red-600">{locationError}</p>}
          </div>
        )}
      </div>

      <div className="relative z-[60] isolate glass-surface p-3 text-center sm:p-4">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 sm:text-lg">{formatDate(selectedDate)}</p>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setSelectedDate(shiftIsoDateByDays(selectedDate, -1))}
            className="btn-blue w-full"
          >
            {pickerText.previousDay}
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(today)}
            className={`${selectedDate === today ? 'btn-yellow' : 'btn-outline'} w-full`}
          >
            {pickerText.today}
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(shiftIsoDateByDays(selectedDate, 1))}
            className="btn-blue w-full"
          >
            {pickerText.nextDay}
          </button>
          <button
            type="button"
            className="btn-blue w-full sm:hidden"
            onClick={() => {
              const el = dateInputRef.current
              if (!el) return
              try {
                if (typeof el.showPicker === 'function') {
                  void el.showPicker()
                  return
                }
              } catch {
                /* Safari / older browsers */
              }
              el.focus()
              try {
                el.click()
              } catch {
                /* ignore */
              }
            }}
            title={pickerText.pickDateFromCalendar}
            aria-label={pickerText.pickDateFromCalendar}
          >
            {pickerText.openCalendar}
          </button>
        </div>

        {/* Hidden input is a full-width strip just under the button so the native picker anchors centered on the button row, slightly below it (not sr-only 1px at document start). */}
        <div className="relative mt-3 hidden w-full sm:block">
          <button
            type="button"
            className="btn-blue relative z-10 w-full"
            onClick={() => {
              const el = dateInputRef.current
              if (!el) return
              try {
                if (typeof el.showPicker === 'function') {
                  void el.showPicker()
                  return
                }
              } catch {
                /* Safari / older browsers */
              }
              el.focus()
              try {
                el.click()
              } catch {
                /* ignore */
              }
            }}
            title={pickerText.pickDateFromCalendar}
            aria-label={pickerText.pickDateFromCalendar}
          >
            {pickerText.openCalendar}
          </button>
          <input
            key={selectedDate}
            ref={dateInputRef}
            type="date"
            defaultValue={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-full z-0 mt-1.5 h-px w-full cursor-default border-0 p-0 opacity-[0.01]"
          />
        </div>
      </div>
    </div>
    {placeResults.length > 0 &&
      placeMenuBox &&
      typeof document !== 'undefined' &&
      createPortal(
        <div
          className="fixed z-[15000] max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900"
          style={{ top: placeMenuBox.top, left: placeMenuBox.left, width: placeMenuBox.width }}
          role="listbox"
        >
          {placeResults.map((item, i) => (
            <button
              key={i}
              type="button"
              role="option"
              onClick={() => handlePlaceSelect(item)}
              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {item.displayName}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )

  if (!location) {
    return (
      <div className="p-4 dark:text-slate-200">
        <PickerRow />
        <p className="mx-auto mt-6 max-w-md text-center text-sm text-slate-600 dark:text-slate-400">
          {pickerText.needLocationForPanchang}
        </p>
      </div>
    )
  }

  const loc = location

  if (isLoading) {
    return (
      <div className="p-4">
        <PickerRow />
        <div className="mt-3">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {selectedDate === today ? 'Today' : selectedDate}
          </h1>
          <div className="mt-4 animate-pulse space-y-3">
            <div className="h-4 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-4">
        <PickerRow />
        <div className="mt-4 space-y-1 text-red-600">
          <p>Failed to load Panchang. Is the API running?</p>
          {error instanceof Error && error.message && <p className="text-sm opacity-90">{error.message}</p>}
        </div>
      </div>
    )
  }

  const { day, panchang, kaalams, abhijit, brahmaMuhurtam, amrutaGhadiyalu, varjam, durmuhurtham } = data

  const colloquialVara = day.varaIndex != null
    ? (isTelugu ? VARA_COLLOQUIAL_TE[day.varaIndex] : VARA_COLLOQUIAL_TE_LATIN[day.varaIndex])
    : undefined
  const timelineVaraChipValue =
    colloquialVara != null ? `${day.vara} (${colloquialVara})` : day.vara

  const getNextIndexedName = (kind: 'tithi' | 'nakshatra' | 'yoga' | 'karana', currentIndex: number): string | null => {
    const lang = language === 'te' ? 'te' : 'en'
    if (kind === 'tithi') {
      const next = (currentIndex + 1) % 30
      return lang === 'te' ? TITHI_NAMES_TE[next] : TITHI_NAMES_EN[next]
    }
    if (kind === 'nakshatra') {
      const next = (currentIndex + 1) % 27
      return lang === 'te' ? NAKSHATRA_NAMES_TE[next] : NAKSHATRA_NAMES_EN[next]
    }
    if (kind === 'yoga') {
      const next = (currentIndex + 1) % 27
      return lang === 'te' ? YOGA_NAMES_TE[next] : YOGA_NAMES_EN[next]
    }
    if (kind === 'karana') {
      const next = (currentIndex + 1) % 11
      return lang === 'te' ? KARANA_NAMES_TE[next] : KARANA_NAMES_EN[next]
    }
    return null
  }

  const getPrevIndexedName = (kind: 'tithi' | 'nakshatra' | 'yoga' | 'karana', currentIndex: number): string | null => {
    const lang = language === 'te' ? 'te' : 'en'
    if (kind === 'tithi') {
      const prev = (currentIndex + 29) % 30
      return lang === 'te' ? TITHI_NAMES_TE[prev] : TITHI_NAMES_EN[prev]
    }
    if (kind === 'nakshatra') {
      const prev = (currentIndex + 26) % 27
      return lang === 'te' ? NAKSHATRA_NAMES_TE[prev] : NAKSHATRA_NAMES_EN[prev]
    }
    if (kind === 'yoga') {
      const prev = (currentIndex + 26) % 27
      return lang === 'te' ? YOGA_NAMES_TE[prev] : YOGA_NAMES_EN[prev]
    }
    if (kind === 'karana') {
      const prev = (currentIndex + 10) % 11
      return lang === 'te' ? KARANA_NAMES_TE[prev] : KARANA_NAMES_EN[prev]
    }
    return null
  }

  const minutesSinceMidnight = (iso?: string | null, timeZone?: string) => {
    if (!iso || !timeZone) return null
    return minutesSinceMidnightInTimeZone(iso, timeZone)
  }

  const formatMinuteLabel = (minutes: number) => {
    const clamped = Math.max(0, Math.min(MINUTES_PER_DAY, Math.round(minutes)))
    const hh = Math.floor(clamped / 60)
    const mm = clamped % 60
    if (timeFormat === '12') {
      const suffix = hh >= 12 ? 'PM' : 'AM'
      const hh12 = hh % 12 === 0 ? 12 : hh % 12
      return `${hh12}:${mm.toString().padStart(2, '0')} ${suffix}`
    }
    return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`
  }
  const calendarTodayKey = calendarDateKeyInTimeZone(new Date(nowTick).toISOString(), loc.tz)
  const isViewingTodayPanchang = calendarTodayKey != null && selectedDate === calendarTodayKey
  const currentMinute = isViewingTodayPanchang
    ? minutesSinceMidnight(new Date(nowTick).toISOString(), loc.tz) ?? 0
    : 0
  const currentPct = isViewingTodayPanchang
    ? (Math.max(0, Math.min(MINUTES_PER_DAY, currentMinute)) / MINUTES_PER_DAY) * 100
    : 0

  const buildPanchangSegments = (type: 'tithi' | 'nakshatra' | 'yoga' | 'karana') => {
    const segments: { start: number; end: number; text: string }[] = []
    const items = panchang.filter((p) => p.type.toLowerCase() === type.toLowerCase())
    if (!items.length) return segments
    const dayKey =
      /^\d{4}-\d{2}-\d{2}/.test(day.date)
        ? day.date.slice(0, 10)
        : new Date(day.date).toLocaleDateString('en-CA', { timeZone: loc.tz })
    let currentStart = 0
    for (const item of items) {
      if (item.startTime) {
        const sk = calendarDateKeyInTimeZone(item.startTime, loc.tz)
        if (sk != null) {
          const startMinOnDay = sk === dayKey ? (minutesSinceMidnight(item.startTime, loc.tz) ?? 0) : 0
          const clampedStart = Math.max(currentStart, Math.min(startMinOnDay, MINUTES_PER_DAY))
          if (clampedStart > currentStart) {
            const prevName = getPrevIndexedName(type, item.index)
            if (prevName) {
              segments.push({ start: currentStart, end: clampedStart, text: prevName })
            }
            currentStart = clampedStart
          }
        }
      }

      let endMinutes = minutesSinceMidnight(item.endTime, loc.tz) ?? MINUTES_PER_DAY
      const endDateKey = item.endTime ? calendarDateKeyInTimeZone(item.endTime, loc.tz) : null
      // `minutesSinceMidnight` is relative to the *end instant's* local date. If the transition
      // ends on a later civil day than this timeline row (e.g. Ekadashi until Apr 14 01:08 while
      // viewing Apr 13), map the bar to the full viewed day instead of ~01:08 on the wrong day.
      if (endDateKey != null && endDateKey > dayKey) {
        endMinutes = MINUTES_PER_DAY
      }
      // If the computed end is "before" the current start, this means the true
      // end lies after midnight (next civil day). In the timeline we still want
      // to fill the remaining bar up to the end of the day.
      const rawEnd = endMinutes < currentStart && type === 'karana' ? MINUTES_PER_DAY : endMinutes
      const clampedEnd = Math.min(Math.max(rawEnd, currentStart + 5), MINUTES_PER_DAY)
      segments.push({
        start: currentStart,
        end: clampedEnd,
        text: item.name,
      })
      currentStart = clampedEnd
      if (currentStart >= MINUTES_PER_DAY) break
    }

    // For tithi / nakshatra / yoga, fill the remaining day with the actual next name.
    // For karana, we rely purely on the backend-provided sequence so the timeline
    // always matches the cards exactly.
    if (type !== 'karana') {
      const last = items[items.length - 1]
      const nextName = getNextIndexedName(type, last.index)
      if (nextName && currentStart < MINUTES_PER_DAY) {
        segments.push({
          start: currentStart,
          end: MINUTES_PER_DAY,
          text: nextName,
        })
      }
    }
    return segments
  }

  const buildRangeSegments = (
    _label: string,
    ranges: { start: string; end: string }[] | undefined | null
  ) => {
    if (!ranges || ranges.length === 0) return [] as { start: number; end: number; text: string }[]
    return ranges
      .map((r) => {
        const start = minutesSinceMidnight(r.start, loc.tz)
        const end = minutesSinceMidnight(r.end, loc.tz)
        if (start == null || end == null) return null
        const clampedStart = Math.max(0, Math.min(start, MINUTES_PER_DAY))
        const clampedEnd = Math.min(MINUTES_PER_DAY, Math.max(clampedStart + 5, Math.min(end, MINUTES_PER_DAY)))
        return {
          start: clampedStart,
          end: clampedEnd,
          // Show the exact start–end time inside the block and on hover
          text: `${formatTime(r.start, timeFormat, loc.tz)} – ${formatTime(r.end, timeFormat, loc.tz)}`,
        }
      })
      .filter((s): s is { start: number; end: number; text: string } => !!s)
  }

  const buildSingleRangeSegment = (
    label: string,
    start?: string | null,
    end?: string | null
  ): {
    start: number
    end: number
    text: string
    leftBoundaryText?: string
    rightBoundaryText?: string
  }[] => {
    if (!start || !end) return []
    // Panchang `day.date` is already the civil calendar date for this place (YYYY-MM-DD).
    // Do not use `new Date(day.date)` — date-only strings parse as UTC midnight, so in many
    // timezones `toLocaleDateString` becomes the *previous* local day and breaks sun/moon spans.
    const dayKey =
      /^\d{4}-\d{2}-\d{2}/.test(day.date) ? day.date.slice(0, 10) : new Date(day.date).toLocaleDateString('en-CA', { timeZone: loc.tz })
    const startKey = calendarDateKeyInTimeZone(start, loc.tz)
    const endKey = calendarDateKeyInTimeZone(end, loc.tz)
    if (startKey == null || endKey == null) return []
    const startMin = minutesSinceMidnight(start, loc.tz)
    const endMin = minutesSinceMidnight(end, loc.tz)
    if (startMin == null || endMin == null) return []

    // Sun for this chart day: rise and set are almost always on `day.date` in `loc.tz`.
    // Handle that path first so we never mis-clip due to offset math (seen with America/* on some browsers).
    if (startKey === dayKey && endKey === dayKey && endMin > startMin) {
      return [
        {
          start: startMin,
          end: endMin,
          text: label,
          leftBoundaryText: formatMinuteLabel(startMin),
          rightBoundaryText: formatMinuteLabel(endMin),
        },
      ]
    }

    const startDayOffset = startKey < dayKey ? -1 : startKey > dayKey ? 1 : 0
    let endDayOffset = endKey < dayKey ? -1 : endKey > dayKey ? 1 : 0

    // Same-day moonrise + moonset where set is earlier means two spans in today's timeline:
    // 00:00 -> set (from yesterday's rise), and rise -> 24:00 (sets tomorrow).
    if (startDayOffset === 0 && endDayOffset === 0 && endMin < startMin) {
      return [
        {
          start: 0,
          end: endMin,
          text: label,
          leftBoundaryText: '',
          rightBoundaryText: formatMinuteLabel(endMin),
        },
        {
          start: startMin,
          end: MINUTES_PER_DAY,
          text: label,
          leftBoundaryText: formatMinuteLabel(startMin),
          rightBoundaryText: '',
        },
      ].filter((seg) => seg.end > seg.start)
    }

    const absoluteStart = startMin + startDayOffset * MINUTES_PER_DAY
    const absoluteEnd = endMin + endDayOffset * MINUTES_PER_DAY
    const clampedStart = Math.max(0, absoluteStart)
    const clampedEnd = Math.min(MINUTES_PER_DAY, absoluteEnd)
    const startedBeforeToday = absoluteStart < 0
    const endsAfterToday = absoluteEnd > MINUTES_PER_DAY

    if (clampedEnd <= clampedStart) return []
    return [
      {
        start: clampedStart,
        end: clampedEnd,
        text: label,
        // For cross-day ranges, keep clipped edge blank (no fake 00:00/24:00 label).
        leftBoundaryText: startedBeforeToday ? '' : formatMinuteLabel(startMin),
        rightBoundaryText: endsAfterToday ? '' : formatMinuteLabel(endMin),
      },
    ]
  }

  const buildMoonSegments = (
    label: string,
    rise?: string | null,
    set?: string | null
  ): {
    start: number
    end: number
    text: string
    leftBoundaryText?: string
    rightBoundaryText?: string
  }[] => {
    const riseMin = minutesSinceMidnight(rise, loc.tz)
    const setMin = minutesSinceMidnight(set, loc.tz)
    const result: {
      start: number
      end: number
      text: string
      leftBoundaryText?: string
      rightBoundaryText?: string
    }[] = []

    if (riseMin != null && setMin != null) {
      if (setMin < riseMin) {
        // Moon is up across midnight: yesterday -> today's set, and today's rise -> tomorrow.
        result.push({
          start: 0,
          end: setMin,
          text: label,
          leftBoundaryText: '',
          rightBoundaryText: formatMinuteLabel(setMin),
        })
        result.push({
          start: riseMin,
          end: MINUTES_PER_DAY,
          text: label,
          leftBoundaryText: formatMinuteLabel(riseMin),
          rightBoundaryText: '',
        })
      } else {
        result.push({
          start: riseMin,
          end: setMin,
          text: label,
          leftBoundaryText: formatMinuteLabel(riseMin),
          rightBoundaryText: formatMinuteLabel(setMin),
        })
      }
      return result.filter((seg) => seg.end > seg.start)
    }

    if (setMin != null) {
      result.push({
        start: 0,
        end: setMin,
        text: label,
        leftBoundaryText: '',
        rightBoundaryText: formatMinuteLabel(setMin),
      })
    }
    if (riseMin != null) {
      result.push({
        start: riseMin,
        end: MINUTES_PER_DAY,
        text: label,
        leftBoundaryText: formatMinuteLabel(riseMin),
        rightBoundaryText: '',
      })
    }
    return result.filter((seg) => seg.end > seg.start)
  }

  /** Bar only (labels rendered in sticky column). */
  const renderTimelineTrack = (
    segments: { start: number; end: number; text: string }[],
    colorClasses: string | string[],
    options?: {
      showBoundaryTimes?: boolean
      leftBoundaryLabel?: string
      rightBoundaryLabel?: string
      contrastTone?: 'dark' | 'light'
    }
  ) => {
    if (!segments.length) return null
    const palette = (() => {
      if (theme !== 'contrast') return Array.isArray(colorClasses) ? colorClasses : [colorClasses]
      if (options?.contrastTone === 'dark') return ['bg-slate-700', 'bg-slate-600'] as string[]
      return ['bg-slate-200', 'bg-slate-300', 'bg-slate-100', 'bg-slate-400'] as string[]
    })()
    const showBoundaryTimes = !!options?.showBoundaryTimes
    const textColorForPalette = (bgClass: string) => {
      if (bgClass.includes('blue')) return 'text-blue-700 dark:text-blue-300'
      if (bgClass.includes('emerald')) return 'text-emerald-700 dark:text-emerald-300'
      if (bgClass.includes('violet')) return 'text-violet-700 dark:text-violet-300'
      if (bgClass.includes('amber')) return 'text-amber-700 dark:text-amber-300'
      if (bgClass.includes('red')) return 'text-red-700 dark:text-red-300'
      if (bgClass.includes('rose')) return 'text-rose-700 dark:text-rose-300'
      if (bgClass.includes('sky')) return 'text-sky-700 dark:text-sky-300'
      if (bgClass.includes('lime')) return 'text-lime-700 dark:text-lime-300'
      if (bgClass.includes('teal')) return 'text-teal-700 dark:text-teal-300'
      if (bgClass.includes('cyan')) return 'text-cyan-700 dark:text-cyan-300'
      if (bgClass.includes('fuchsia')) return 'text-fuchsia-700 dark:text-fuchsia-300'
      if (bgClass.includes('orange')) return 'text-orange-700 dark:text-orange-300'
      if (bgClass.includes('indigo')) return 'text-indigo-700 dark:text-indigo-300'
      return 'text-slate-700 dark:text-slate-300'
    }
    const externalLabelPlacements = (() => {
      if (showBoundaryTimes) return [] as { idx: number; left: number; width: number; text: string }[]
      const labelWidthPct = 22
      const gapPct = -2.8
      const occupied: Array<{ start: number; end: number }> = []
      const placements: { idx: number; left: number; width: number; text: string }[] = []

      for (let idx = 0; idx < segments.length; idx++) {
        const seg = segments[idx]
        const leftPct = (Math.max(0, seg.start) / MINUTES_PER_DAY) * 100
        const rightPct = (Math.min(MINUTES_PER_DAY, seg.end) / MINUTES_PER_DAY) * 100
        const widthPct = Math.max(rightPct - leftPct, 2)
        const showInside = widthPct >= 14
        if (showInside) continue

        const rightStart = rightPct + gapPct
        const leftStart = leftPct - gapPct - labelWidthPct
        const rightCandidate = Math.max(0, Math.min(100 - labelWidthPct, rightStart))
        const leftCandidate = Math.max(0, Math.min(100 - labelWidthPct, leftStart))
        const rightRange = { start: rightCandidate, end: rightCandidate + labelWidthPct }
        const leftRange = { start: leftCandidate, end: leftCandidate + labelWidthPct }
        const overlaps = (a: { start: number; end: number }, b: { start: number; end: number }) =>
          a.start < b.end && b.start < a.end
        const rightBlocked = occupied.some((r) => overlaps(r, rightRange))
        const leftBlocked = occupied.some((r) => overlaps(r, leftRange))

        let chosen = rightRange
        if (rightBlocked && !leftBlocked) {
          chosen = leftRange
        } else if (rightBlocked && leftBlocked) {
          // Both sides overlap: shift right candidate just past latest overlap.
          const maxEnd = occupied.reduce((max, r) => (overlaps(r, rightRange) ? Math.max(max, r.end) : max), rightRange.start)
          const shiftedStart = Math.max(0, Math.min(100 - labelWidthPct, maxEnd + 0.4))
          chosen = { start: shiftedStart, end: shiftedStart + labelWidthPct }
        }

        occupied.push(chosen)
        placements.push({ idx, left: chosen.start, width: labelWidthPct, text: seg.text })
      }
      return placements
    })()
    return (
      <div
        data-timeline-share-track-bar
        className={`timeline-export-row relative h-8 min-h-8 w-full rounded bg-white shadow-inner dark:bg-slate-900/40 ${
          theme === 'contrast' ? 'ring-1 ring-slate-400 shadow-none' : ''
        }`}
      >
        {segments.map((seg, idx) => {
            const leftPct = (Math.max(0, seg.start) / MINUTES_PER_DAY) * 100
            const rightPct = (Math.min(MINUTES_PER_DAY, seg.end) / MINUTES_PER_DAY) * 100
            const widthPct = Math.max(rightPct - leftPct, 2)
            const showInside = widthPct >= 14
            return (
              <div
                key={`${idx}-${seg.text}-${seg.start}`}
                data-timeline-share-inner-bar
                className={`absolute flex h-full items-center justify-center rounded px-1 text-[10px] ${
                  theme === 'contrast'
                    ? options?.contrastTone === 'dark'
                      ? 'text-white ring-1 ring-white/20'
                      : 'text-slate-900 ring-1 ring-slate-400'
                    : 'text-white'
                } ${palette[idx % palette.length]}`}
                style={{ ...tl(10), left: `${leftPct}%`, width: `${widthPct}%` }}
                title={seg.text}
              >
                {showBoundaryTimes ? (
                  <>
                    {(() => {
                      const boundarySeg = seg as {
                        leftBoundaryText?: string
                        rightBoundaryText?: string
                      }
                      // Omit 00:00 / end-of-day when the bar is clipped: span continues from prior civil day or into next.
                      const leftTime =
                        boundarySeg.leftBoundaryText !== undefined
                          ? boundarySeg.leftBoundaryText
                          : seg.start <= 0
                            ? ''
                            : formatMinuteLabel(seg.start)
                      const rightTime =
                        boundarySeg.rightBoundaryText !== undefined
                          ? boundarySeg.rightBoundaryText
                          : seg.end >= MINUTES_PER_DAY
                            ? ''
                            : formatMinuteLabel(seg.end)
                      const leftLabel = leftTime
                        ? `${options?.leftBoundaryLabel ? `${options.leftBoundaryLabel} ` : ''}${leftTime}`
                        : ''
                      const rightLabel = rightTime
                        ? `${options?.rightBoundaryLabel ? `${options.rightBoundaryLabel} ` : ''}${rightTime}`
                        : ''
                      const tight = widthPct < 10

                      if (tight) {
                        // Ensure narrow cross-day segments still display at least one boundary time.
                        return (
                          <div style={tl(9)} className="flex w-full items-center justify-center text-[9px] leading-snug">
                            <span className="truncate">{rightLabel || leftLabel}</span>
                          </div>
                        )
                      }

                      return (
                        <div style={tl(9)} className="flex w-full items-center justify-between text-[9px] leading-snug">
                          <span>{leftLabel}</span>
                          <span>{rightLabel}</span>
                        </div>
                      )
                    })()}
                    {widthPct >= 14 && (
                      <span style={tl(10)} className="pointer-events-none absolute left-1/2 max-w-[60%] -translate-x-1/2 truncate text-[15px] font-medium">
                        {seg.text}
                      </span>
                    )}
                  </>
                ) : (
                  showInside && <span className="truncate">{seg.text}</span>
                )}
              </div>
            )
          })}
          {externalLabelPlacements.map((placement) => (
            <div
              key={`ext-${placement.idx}-${placement.text}`}
              data-timeline-share-inner-bar
              data-timeline-share-external-label
              className={`pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center justify-center px-1 text-[15px] font-semibold leading-snug ${textColorForPalette(palette[placement.idx % palette.length])}`}
              style={{ ...tl(10), left: `${placement.left}%`, width: `${placement.width}%` }}
            >
              <span className="truncate">{placement.text}</span>
            </div>
          ))}
      </div>
    )
  }

  const timelineText = isTelugu
    ? {
        title: 'One Panchang',
        masam: 'మాసం',
        vara: 'వారం',
        paksham: 'పక్షం',
        ayanam: 'అయనం',
        uttarayanam: 'ఉత్తరాయణం',
        dakshinayanam: 'దక్షిణాయణం',
        ruthuvu: 'ఋతువు',
        time: 'సమయం',
        sun: 'సూర్యుడు',
        moon: 'చంద్రుడు',
        tithi: 'తిథి',
        nakshatra: 'నక్షత్రం',
        yoga: 'యోగ',
        karana: 'కరణం',
        rahu: 'రాహుకాలం',
        yamagandam: 'యమగండం',
        gulika: 'గులిక',
        abhijit: 'అభిజిత్',
        brahmaMuhurtam: 'బ్రహ్మ ముహూర్తం',
        amrutaGhadiyalu: 'అమృత ఘడియలు',
        varjam: 'వర్జం',
        durmuhurtham: 'దుర్ముహూర్తం',
        rise: 'ఉదయం',
        set: 'అస్తమయం',
        festivalsTitle: 'ఈరోజు ముఖ్యమైన తిథులు / పండుగలు',
        noFestivals: 'ఈరోజు ప్రత్యేక పండుగలు కనబడలేదు.',
        ekadashi: 'ఏకాదశి',
        pournami: 'పౌర్ణమి',
        amavasya: 'అమావాస్య',
        sankashti: 'సంకష్టి చతుర్థి',
        sashti: 'షష్ఠి',
        chaturdashi: 'చతుర్దశి',
        timelineScrollHint: 'రోజు అంతటా చూడటానికి ఎడమ–కుడికి జరపండి లేదా క్రింది స్లైడర్ వాడండి.',
        timelineScrollAria: 'కాలరేఖ భూమికి అడ్డంగా జరపండి',
        shareTimelineImage: 'షేర్ చేయండి',
        shareTimelineImageError: 'కాలరేఖ చిత్రాన్ని రూపొందించలేకపోయాము. మళ్లీ ప్రయత్నించండి.',
        festivalTithiPriorCivilDay: 'ఈ తిథి మునుపటి సాధారణ క్యాలెండర్ రోజున ప్రారంభమైంది.',
        festivalCarriedFromPriorPanchangDay: 'మునుపటి సూర్యోదయ–సూర్యోదయ పంచాంగ దినం నుండి కొనసాగింపు.',
        festivalTithiStartsLaterToday: 'ఈ రోజు సూర్యోదయం తర్వాత ఈ తిథి ప్రారంభమైంది; సమయాలు క్రింద చూపించబడ్డాయి.',
      }
    : {
        title: 'One Panchang',
        masam: 'Masam',
        vara: 'Vara',
        paksham: 'Paksham',
        ayanam: 'Ayanam',
        uttarayanam: 'Uttarayanam',
        dakshinayanam: 'Dakshinayanam',
        ruthuvu: 'Ritu',
        time: 'Time',
        sun: 'Sun',
        moon: 'Moon',
        tithi: 'Tithi',
        nakshatra: 'Nakshatra',
        yoga: 'Yoga',
        karana: 'Karana',
        rahu: 'Rahu',
        yamagandam: 'Yamagandam',
        gulika: 'Gulika',
        abhijit: 'Abhijit',
        brahmaMuhurtam: 'Brahma Muhurtam',
        amrutaGhadiyalu: 'Amruta Ghadiyalu',
        varjam: 'Varjam',
        durmuhurtham: 'Durmuhurtham',
        rise: 'Rise',
        set: 'Set',
        festivalsTitle: 'Important Dates / Festivals Today',
        noFestivals: 'No major festival markers found for today.',
        ekadashi: 'Ekadashi',
        pournami: 'Pournami',
        amavasya: 'Amavasya',
        sankashti: 'Sankashti Chaturthi',
        sashti: 'Shashthi',
        chaturdashi: 'Chaturdashi',
        timelineScrollHint: 'Swipe sideways or use the slider below to view the full day.',
        timelineScrollAria: 'Scroll the timeline horizontally',
        shareTimelineImage: 'Share',
        shareTimelineImageError: 'Could not create the timeline image. Please try again.',
        festivalTithiPriorCivilDay: 'This tithi began on the previous civil calendar day.',
        festivalCarriedFromPriorPanchangDay: 'Continues from the prior sunrise-to-sunrise panchang day.',
        festivalTithiStartsLaterToday: 'This tithi begins after today’s sunrise; times are shown below.',
      }

  type TimelineRowModel = {
    key: string
    label: string
    segments: {
      start: number
      end: number
      text: string
      leftBoundaryText?: string
      rightBoundaryText?: string
    }[]
    colorClasses: string | string[]
    options?: {
      showBoundaryTimes?: boolean
      leftBoundaryLabel?: string
      rightBoundaryLabel?: string
      contrastTone?: 'dark' | 'light'
    }
  }

  const timelineRows: TimelineRowModel[] = []
  const pushTimelineRow = (row: TimelineRowModel) => {
    if (row.segments.length) timelineRows.push(row)
  }

  pushTimelineRow({
    key: 'sun',
    label: timelineText.sun,
    segments: buildSingleRangeSegment(timelineText.sun, day.sunrise, day.sunset),
    colorClasses: 'bg-orange-500/90',
    options: { showBoundaryTimes: true, leftBoundaryLabel: timelineText.rise, rightBoundaryLabel: timelineText.set, contrastTone: 'dark' },
  })
  pushTimelineRow({
    key: 'moon',
    label: timelineText.moon,
    segments: buildMoonSegments(timelineText.moon, day.moonrise, day.moonset),
    colorClasses: 'bg-slate-500/90',
    options: { showBoundaryTimes: true, leftBoundaryLabel: timelineText.rise, rightBoundaryLabel: timelineText.set, contrastTone: 'dark' },
  })
  pushTimelineRow({
    key: 'tithi',
    label: timelineText.tithi,
    segments: buildPanchangSegments('tithi'),
    colorClasses: ['bg-blue-400/80', 'bg-blue-600/80'],
    options: { showBoundaryTimes: true, contrastTone: 'dark' },
  })
  pushTimelineRow({
    key: 'nakshatra',
    label: timelineText.nakshatra,
    segments: buildPanchangSegments('nakshatra'),
    colorClasses: ['bg-emerald-400/80', 'bg-emerald-600/80'],
    options: { showBoundaryTimes: true, contrastTone: 'dark' },
  })
  pushTimelineRow({
    key: 'yoga',
    label: timelineText.yoga,
    segments: buildPanchangSegments('yoga'),
    colorClasses: ['bg-violet-400/80', 'bg-violet-600/80'],
    options: { showBoundaryTimes: true, contrastTone: 'dark' },
  })
  pushTimelineRow({
    key: 'karana',
    label: timelineText.karana,
    segments: buildPanchangSegments('karana'),
    colorClasses: ['bg-amber-400/80', 'bg-amber-600/80'],
    options: { showBoundaryTimes: true, contrastTone: 'dark' },
  })
  pushTimelineRow({
    key: 'varjam',
    label: timelineText.varjam,
    segments: varjam ? buildRangeSegments(timelineText.varjam, [varjam]) : [],
    colorClasses: ['bg-fuchsia-400/80', 'bg-fuchsia-600/80'],
    options: { contrastTone: 'dark' },
  })
  pushTimelineRow({
    key: 'durmuhurtham',
    label: timelineText.durmuhurtham,
    segments: durmuhurtham?.length ? buildRangeSegments(timelineText.durmuhurtham, durmuhurtham) : [],
    colorClasses: ['bg-orange-400/80', 'bg-orange-600/80'],
    options: { contrastTone: 'dark' },
  })
  pushTimelineRow({
    key: 'rahu',
    label: timelineText.rahu,
    segments: buildRangeSegments(
      timelineText.rahu,
      kaalams.filter((k) => k.name.toLowerCase().includes('rahu')).map((k) => ({ start: k.start, end: k.end }))
    ),
    colorClasses: ['bg-red-400/80', 'bg-red-600/80'],
    options: { contrastTone: 'dark' },
  })
  pushTimelineRow({
    key: 'yamagandam',
    label: timelineText.yamagandam,
    segments: buildRangeSegments(
      timelineText.yamagandam,
      kaalams.filter((k) => k.name.toLowerCase().includes('yama')).map((k) => ({ start: k.start, end: k.end }))
    ),
    colorClasses: ['bg-rose-400/80', 'bg-rose-600/80'],
    options: { contrastTone: 'dark' },
  })
  pushTimelineRow({
    key: 'gulika',
    label: timelineText.gulika,
    segments: buildRangeSegments(
      timelineText.gulika,
      kaalams
        .filter((k) => k.name.toLowerCase().includes('guli') || k.name.toLowerCase().includes('gulika'))
        .map((k) => ({ start: k.start, end: k.end }))
    ),
    colorClasses: ['bg-sky-400/80', 'bg-sky-600/80'],
    options: { contrastTone: 'dark' },
  })
  pushTimelineRow({
    key: 'brahma',
    label: timelineText.brahmaMuhurtam,
    segments: brahmaMuhurtam
      ? buildRangeSegments(timelineText.brahmaMuhurtam, [{ start: brahmaMuhurtam.start, end: brahmaMuhurtam.end }])
      : [],
    colorClasses: ['bg-teal-400/80', 'bg-teal-600/80'],
    options: { contrastTone: 'dark' },
  })
  pushTimelineRow({
    key: 'amruta',
    label: timelineText.amrutaGhadiyalu,
    segments: amrutaGhadiyalu ? buildRangeSegments(timelineText.amrutaGhadiyalu, amrutaGhadiyalu) : [],
    colorClasses: ['bg-cyan-400/80', 'bg-cyan-600/80'],
    options: { contrastTone: 'dark' },
  })
  pushTimelineRow({
    key: 'abhijit',
    label: timelineText.abhijit,
    segments: abhijit ? buildRangeSegments(timelineText.abhijit, [{ start: abhijit.start, end: abhijit.end }]) : [],
    colorClasses: ['bg-lime-400/80', 'bg-lime-600/80'],
    options: { contrastTone: 'dark' },
  })

  const importantFestivals = (data.festivals || []).filter((f) => f.category === 'important')
  const auspiciousFestivals = (data.festivals || []).filter((f) => f.category === 'auspicious')
  // Amanta masam from API (Purnima sun-sign in current lunation); legacy fallback for old backends.
  const sunSignToLunarMonthIdx = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0]
  const lunarMonthIdx =
    day.lunarMonthIndex != null
      ? day.lunarMonthIndex
      : (() => {
          const base = day.sunsign != null ? sunSignToLunarMonthIdx[day.sunsign] ?? 0 : 0
          return day.paksham === 1 ? (base + 11) % 12 : base
        })()
  const masamName = isTelugu ? LUNAR_MONTHS_TE[lunarMonthIdx] : LUNAR_MONTHS_EN[lunarMonthIdx]
  const pakshamChipValue = (() => {
    if (!day.pakshamName) return ''
    return isTelugu
      ? day.pakshamName.replace(/\s*పక్షం\s*$/u, '')
      : day.pakshamName.replace(/\s*Paksha\s*$/i, '')
  })()

  const siderealAyanamHalf = isSiderealUttarayana(day.sunsign)
  const contrastChipClass =
    'flex w-full items-center justify-center gap-1 rounded-xl bg-slate-100 px-2 py-1.5 text-center text-[11px] text-slate-800 ring-1 ring-slate-400 md:min-w-0 md:flex-1 md:flex-col md:gap-0.5 md:px-3 md:py-2 md:text-xs'
  const tl = (px: number) => ({
    fontSize: `${Math.round(px * fontScale * 10) / 10}px`,
  })

  const handleShareTimelineJpeg = async () => {
    const root = timelineShareRootRef.current
    if (!root || shareTimelineExporting) return
    setShareTimelineExporting(true)
    try {
      const blob = await captureTimelineShareJpeg(root)
      const filename = `one-panchang-timeline-${selectedDate}.jpg`
      const file = new File([blob], filename, { type: 'image/jpeg' })
      const narrowOrTouch =
        (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 768px)').matches) ||
        'ontouchstart' in window ||
        (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)

      const canShareFiles =
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        navigator.canShare?.({ files: [file] }) === true

      if (narrowOrTouch && canShareFiles) {
        await navigator.share({
          files: [file],
          title: 'One Panchang',
          text: `${timelineText.title} · ${formatDate(day.date)}`,
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.rel = 'noopener'
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      console.error(e)
      window.alert(timelineText.shareTimelineImageError)
    } finally {
      setShareTimelineExporting(false)
    }
  }

  return (
    <div className="p-4">
      <PickerRow />

      {/* Mobile floating toggles (so header can scroll away) */}
      <div
        className={`fixed bottom-4 right-4 z-[12000] flex flex-col gap-2 sm:hidden ${
          showMobileFloatingToggles ? '' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!showMobileFloatingToggles}
      >
        <button
          type="button"
          onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'contrast' : 'light')}
          className={`glass-surface btn-ghost shadow-lg ${showMobileFloatingToggles ? '' : 'pointer-events-none'}`}
          aria-label={`Theme: ${theme === 'contrast' ? 'High contrast' : theme}. Activate to change.`}
        >
          <span className="inline-flex h-6 w-6 items-center justify-center">
            {theme === 'contrast' ? (
              <span className="inline-flex h-6 w-6 items-center justify-center text-[11px] font-extrabold tracking-tight text-slate-700 dark:text-slate-100 contrast:text-slate-800">
                HC
              </span>
            ) : theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-6 w-6">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-6 w-6">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            )}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage(language === 'te' ? 'en' : 'te')}
          className={`glass-surface btn-ghost shadow-lg ${showMobileFloatingToggles ? '' : 'pointer-events-none'}`}
          aria-label="Toggle language"
        >
          <span className={`inline-flex h-6 w-6 items-center justify-center font-extrabold leading-none text-slate-700 dark:text-slate-200 contrast:text-slate-800 ${language === 'te' ? 'text-[12px]' : 'text-[13px]'}`}>
            {language === 'te' ? 'EN' : 'తె'}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTimeFormat(timeFormat === '12' ? '24' : '12')}
          className={`glass-surface btn-ghost shadow-lg ${showMobileFloatingToggles ? '' : 'pointer-events-none'}`}
          aria-label="Toggle time format"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-6 w-6 text-slate-700 dark:text-slate-200 contrast:text-slate-800">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setFontScale(fontScale === 1 ? 1.1 : fontScale === 1.1 ? 1.2 : 1)}
          className={`glass-surface btn-ghost shadow-lg ${showMobileFloatingToggles ? '' : 'pointer-events-none'}`}
          aria-label={`Font size: ${fontScale === 1 ? 'Normal' : fontScale === 1.1 ? 'Large' : 'Extra large'}. Activate to change.`}
        >
          <span className="inline-flex h-6 w-6 items-center justify-center text-[13px] font-extrabold leading-none text-slate-700 dark:text-slate-200 contrast:text-slate-800">
            Aa
          </span>
        </button>
      </div>

      <div
        ref={timelineShareRootRef}
        data-timeline-share-root
        data-timeline-share-export-bg={theme === 'light' ? 'light' : 'dark'}
        className="relative z-0 mt-3 overflow-visible rounded-2xl glass-surface p-4 sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <LogoMark className="h-11 w-11 shrink-0 self-center sm:h-[3.25rem] sm:w-[3.25rem]" />
            <div className="min-w-0 flex-1 pb-0.5 text-left">
              <h2 style={tl(18)} className="font-semibold leading-snug text-slate-800 dark:text-slate-100">
                {timelineText.title}
              </h2>
              <p style={tl(12)} className="mt-1 leading-snug text-slate-500 dark:text-slate-400">
                {formatDate(day.date)}
              </p>
            </div>
          </div>
          <button
            type="button"
            data-html2canvas-ignore
            onClick={() => void handleShareTimelineJpeg()}
            disabled={shareTimelineExporting || timelineRows.length === 0}
            className="btn-outline inline-flex shrink-0 items-center justify-center gap-1.5 self-center px-2.5 py-2 text-xs font-medium disabled:opacity-50 sm:px-3 sm:text-sm"
            aria-label={timelineText.shareTimelineImage}
            title={timelineText.shareTimelineImage}
          >
            {shareTimelineExporting ? (
              <span className="h-5 w-5 animate-pulse rounded-full bg-slate-400" aria-hidden />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" x2="12" y1="2" y2="15" />
              </svg>
            )}
            <span className="hidden sm:inline">{timelineText.shareTimelineImage}</span>
          </button>
        </div>
        <div className="mt-3">
          <div data-timeline-share-chips-wrap className="glass-surface p-3">
            <div className="flex flex-wrap justify-center gap-2 text-center md:flex-nowrap">
              <span
                style={tl(11)}
                className={
                  theme === 'contrast'
                    ? contrastChipClass
                    : 'flex w-full items-center justify-center gap-1 rounded-xl bg-violet-100 px-2 py-1.5 text-center text-[11px] text-violet-800 ring-1 ring-violet-300 dark:bg-violet-900/40 dark:text-violet-200 dark:ring-violet-700/70 md:min-w-0 md:flex-1 md:flex-col md:gap-0.5 md:px-3 md:py-2 md:text-xs'
                }
              >
                <span className="font-semibold leading-none md:leading-tight">{timelineText.masam}</span>
                <span className="text-slate-500/80 dark:text-slate-300/70 contrast:text-slate-900/70 md:hidden">·</span>
                <span className="leading-none md:leading-tight">{masamName}</span>
              </span>
              {day.pakshamName != null && (
                <span
                  style={tl(11)}
                  className={
                    theme === 'contrast'
                      ? contrastChipClass
                      : 'flex w-full items-center justify-center gap-1 rounded-xl bg-emerald-100 px-2 py-1.5 text-center text-[11px] text-emerald-800 ring-1 ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-700/70 md:min-w-0 md:flex-1 md:flex-col md:gap-0.5 md:px-3 md:py-2 md:text-xs'
                  }
                >
                  <span className="font-semibold leading-none md:leading-tight">{timelineText.paksham}</span>
                  <span className="text-slate-500/80 dark:text-slate-300/70 contrast:text-slate-900/70 md:hidden">·</span>
                  <span className="leading-none md:leading-tight">{pakshamChipValue}</span>
                </span>
              )}
              <span
                style={tl(11)}
                className={
                  theme === 'contrast'
                    ? contrastChipClass
                    : 'flex w-full items-center justify-center gap-1 rounded-xl bg-indigo-100 px-2 py-1.5 text-center text-[11px] text-indigo-800 ring-1 ring-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-200 dark:ring-indigo-700/70 md:min-w-0 md:flex-1 md:flex-col md:gap-0.5 md:px-3 md:py-2 md:text-xs'
                }
              >
                <span className="font-semibold leading-none md:leading-tight">{timelineText.vara}</span>
                <span className="text-slate-500/80 dark:text-slate-300/70 contrast:text-slate-900/70 md:hidden">·</span>
                <span className="leading-none md:leading-tight">{timelineVaraChipValue}</span>
              </span>
              {siderealAyanamHalf != null && (
                <span
                  style={tl(11)}
                  className={
                    theme === 'contrast'
                      ? contrastChipClass
                      : 'flex w-full items-center justify-center gap-1 rounded-xl bg-sky-100 px-2 py-1.5 text-center text-[11px] text-sky-900 ring-1 ring-sky-300 dark:bg-sky-950/50 dark:text-sky-200 dark:ring-sky-700/70 md:min-w-0 md:flex-1 md:flex-col md:gap-0.5 md:px-3 md:py-2 md:text-xs'
                  }
                >
                  <span className="font-semibold leading-none md:leading-tight">{timelineText.ayanam}</span>
                  <span className="text-slate-500/80 dark:text-slate-300/70 contrast:text-slate-900/70 md:hidden">·</span>
                  <span className="leading-none md:leading-tight">{siderealAyanamHalf ? timelineText.uttarayanam : timelineText.dakshinayanam}</span>
                </span>
              )}
              {day.ruthuvuName != null && day.ruthuvuName !== '' && (
                <span
                  style={tl(11)}
                  className={
                    theme === 'contrast'
                      ? contrastChipClass
                      : 'flex w-full items-center justify-center gap-1 rounded-xl bg-amber-100 px-2 py-1.5 text-center text-[11px] text-amber-950 ring-1 ring-amber-300 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-700/60 md:min-w-0 md:flex-1 md:flex-col md:gap-0.5 md:px-3 md:py-2 md:text-xs'
                  }
                >
                  <span className="font-semibold leading-none md:leading-tight">{timelineText.ruthuvu}</span>
                  <span className="text-slate-500/80 dark:text-slate-300/70 contrast:text-slate-900/70 md:hidden">·</span>
                  <span className="leading-none md:leading-tight">{day.ruthuvuName}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="relative mt-3">
          <p
            data-html2canvas-ignore
            style={tl(11)}
            className="mb-2 leading-snug text-slate-500 dark:text-slate-400 lg:hidden"
          >
            {timelineText.timelineScrollHint}
          </p>
          <div
            data-timeline-share-timeline-frame
            className="overflow-visible rounded-xl bg-slate-50/90 p-3 ring-1 ring-slate-200/90 dark:bg-slate-950/50 dark:ring-slate-700/70 sm:p-4"
          >
          <div className="flex items-start gap-2">
            <div
              data-timeline-share-label-col
              className="sticky left-0 z-20 w-[116px] shrink-0 space-y-3 bg-transparent py-0.5 pl-0.5 pr-1.5 sm:w-[132px]"
            >
              <div
                style={tl(12)}
                className={`timeline-export-row flex h-8 min-h-8 shrink-0 items-center text-[12px] font-bold leading-normal ${
                  theme === 'contrast' ? 'text-slate-800' : 'text-fuchsia-700 dark:text-fuchsia-300'
                }`}
              >
                {timelineText.time}
              </div>
              {timelineRows.map((row) => (
                <div
                  key={`lbl-${row.key}`}
                  style={tl(12)}
                  className="timeline-export-row flex h-8 min-h-8 shrink-0 items-center text-[12px] font-bold leading-normal text-slate-800 dark:text-slate-100"
                  title={row.label}
                >
                  <span className="min-w-0 truncate">{row.label}</span>
                </div>
              ))}
            </div>
            <div
              ref={timelineScrollRef}
              data-timeline-share-scroll
              onScroll={updateTimelineScrollSlider}
              className="scrollbar-none min-w-0 flex-1 touch-pan-x overflow-x-auto overflow-y-visible overscroll-x-contain scroll-smooth [-webkit-overflow-scrolling:touch] lg:overflow-x-visible"
            >
              <div
                data-timeline-share-track-col
                className="relative w-[920px] space-y-3 py-0.5 lg:min-w-0 lg:w-full"
              >
                {isViewingTodayPanchang ? (
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-full" aria-hidden>
                    <div
                      className="absolute bottom-0 top-0 w-[2px] -translate-x-1/2 bg-red-600 shadow-sm dark:bg-red-500"
                      style={{ left: `${currentPct}%` }}
                    />
                  </div>
                ) : null}
                <div
                  data-timeline-share-hour-ruler
                  className={`timeline-export-row relative h-8 min-h-8 w-full rounded shadow-inner ring-1 ${
                    theme === 'contrast'
                      ? 'bg-slate-50 ring-slate-400 shadow-none'
                      : 'bg-fuchsia-100 ring-fuchsia-300/80 dark:bg-fuchsia-950/45 dark:ring-fuchsia-700/60'
                  }`}
                >
                  {Array.from({ length: 25 }, (_, h) => h).map((h) => (
                    <div
                      key={h}
                      className={`absolute top-0 flex h-full -translate-x-1/2 flex-col items-center text-[9px] font-medium leading-snug ${
                        theme === 'contrast' ? 'text-slate-800' : 'text-fuchsia-800 dark:text-fuchsia-200'
                      }`}
                      style={{ left: `${(h / 24) * 100}%` }}
                    >
                      <span
                        className={`h-full border-l ${
                          theme === 'contrast' ? 'border-slate-400' : 'border-fuchsia-400/70 dark:border-fuchsia-500/60'
                        }`}
                      />
                      <span className="mt-0.5">{h.toString().padStart(2, '0')}</span>
                    </div>
                  ))}
                </div>
                {timelineRows.map((row) => (
                  <div key={`trk-${row.key}`}>{renderTimelineTrack(row.segments, row.colorClasses, row.options)}</div>
                ))}
              </div>
            </div>
          </div>
          </div>
          {timelineNeedsSlider ? (
            <div className="mt-3 lg:hidden" data-html2canvas-ignore>
              <div
                ref={timelineSliderTrackRef}
                role="slider"
                tabIndex={0}
                aria-label={timelineText.timelineScrollAria}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(timelineScrollPct * 10) / 10}
                className={`relative mx-0.5 h-9 cursor-pointer touch-none rounded-md py-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${
                  theme === 'contrast' ? 'focus-visible:ring-slate-500' : 'focus-visible:ring-fuchsia-500'
                }`}
                onPointerDown={(e) => {
                  if (e.button !== 0) return
                  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
                  setTimelineScrollFromSliderClientX(e.clientX)
                }}
                onPointerMove={(e) => {
                  if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return
                  setTimelineScrollFromSliderClientX(e.clientX)
                }}
                onPointerUp={(e) => {
                  try {
                    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
                  } catch {
                    /* already released */
                  }
                }}
                onPointerCancel={(e) => {
                  try {
                    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
                  } catch {
                    /* ignore */
                  }
                }}
                onKeyDown={(e) => {
                  const scrollEl = timelineScrollRef.current
                  if (!scrollEl) return
                  const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth
                  if (maxScroll <= 0) return
                  const step = Math.max(maxScroll * 0.06, 40)
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                    e.preventDefault()
                    scrollEl.scrollLeft -= step
                    updateTimelineScrollSlider()
                  } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                    e.preventDefault()
                    scrollEl.scrollLeft += step
                    updateTimelineScrollSlider()
                  } else if (e.key === 'Home') {
                    e.preventDefault()
                    scrollEl.scrollLeft = 0
                    updateTimelineScrollSlider()
                  } else if (e.key === 'End') {
                    e.preventDefault()
                    scrollEl.scrollLeft = maxScroll
                    updateTimelineScrollSlider()
                  }
                }}
              >
                <div
                  className={`pointer-events-none absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full ${
                    theme === 'contrast' ? 'bg-slate-200' : 'bg-fuchsia-200/95 dark:bg-fuchsia-950/80'
                  }`}
                />
                <div
                  className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-md ring-1 ${
                    theme === 'contrast'
                      ? 'border-white bg-slate-700 ring-slate-400'
                      : 'border-white bg-fuchsia-600 ring-fuchsia-400/50 dark:border-slate-900 dark:bg-fuchsia-500 dark:ring-fuchsia-600/40'
                  }`}
                  style={{ left: `${timelineScrollPct}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 glass-surface p-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{timelineText.festivalsTitle}</h3>
        {importantFestivals.length > 0 || auspiciousFestivals.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {importantFestivals.map((festival) => {
              const tz = location?.tz ?? 'UTC'
              const tithiBracket =
                festival.tithiStart != null && festival.tithiStart !== ''
                  ? formatFestivalTithiBracket(festival, selectedDate, tz, timeFormat)
                  : ''
              return (
                <span
                  key={festival.id}
                  className="inline-flex max-w-full flex-col gap-0.5 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-800 ring-1 ring-rose-300 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-700/60"
                >
                  <span className="min-w-0 leading-snug">
                    <span className="font-semibold">{festival.name}</span>
                    {tithiBracket ? (
                      <span className="font-normal text-rose-900/90 dark:text-rose-100/90">{tithiBracket}</span>
                    ) : null}
                  </span>
                  {festival.carriedFromPriorVedicDay ? (
                    <span className="text-[10px] font-normal leading-tight text-rose-900/75 dark:text-rose-100/75">
                      {timelineText.festivalCarriedFromPriorPanchangDay}
                    </span>
                  ) : festival.tithiStartsLaterSameCivilDay ? (
                    <span className="text-[10px] font-normal leading-tight text-rose-900/75 dark:text-rose-100/75">
                      {timelineText.festivalTithiStartsLaterToday}
                    </span>
                  ) : festival.tithiStartedPriorCivilDay ? (
                    <span className="text-[10px] font-normal leading-tight text-rose-900/75 dark:text-rose-100/75">
                      {timelineText.festivalTithiPriorCivilDay}
                    </span>
                  ) : null}
                </span>
              )
            })}
            {auspiciousFestivals.map((festival) => {
              const tz = location?.tz ?? 'UTC'
              const tithiBracket =
                festival.tithiStart != null && festival.tithiStart !== ''
                  ? formatFestivalTithiBracket(festival, selectedDate, tz, timeFormat)
                  : ''
              return (
                <span
                  key={festival.id}
                  className="inline-flex max-w-full flex-col gap-0.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-700/60"
                >
                  <span className="min-w-0 leading-snug">
                    <span className="font-semibold">{festival.name}</span>
                    {tithiBracket ? (
                      <span className="font-normal text-emerald-900/90 dark:text-emerald-100/90">{tithiBracket}</span>
                    ) : null}
                  </span>
                  {festival.carriedFromPriorVedicDay ? (
                    <span className="text-[10px] font-normal leading-tight text-emerald-900/75 dark:text-emerald-100/75">
                      {timelineText.festivalCarriedFromPriorPanchangDay}
                    </span>
                  ) : festival.tithiStartsLaterSameCivilDay ? (
                    <span className="text-[10px] font-normal leading-tight text-emerald-900/75 dark:text-emerald-100/75">
                      {timelineText.festivalTithiStartsLaterToday}
                    </span>
                  ) : festival.tithiStartedPriorCivilDay ? (
                    <span className="text-[10px] font-normal leading-tight text-emerald-900/75 dark:text-emerald-100/75">
                      {timelineText.festivalTithiPriorCivilDay}
                    </span>
                  ) : null}
                </span>
              )
            })}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{timelineText.noFestivals}</p>
        )}
      </div>

    </div>
  )
}
