/** Shared API shapes for `/api/v1/panchang/date`. */

export interface TimeRange {
  start: string
  end: string
}

export interface PanchangDay {
  date: string
  sunrise: string
  sunset: string
  moonrise?: string | null
  moonset?: string | null
  vara: string
  /** 0 = Sunday … 6 = Saturday (local weekday at sunrise). */
  varaIndex?: number
  paksham?: number
  pakshamName?: string
  moonsign?: number
  moonsignName?: string
  sunsign?: number
  sunsignName?: string
  /** Amanta month 0 = Chaitra … 11 = Phalguna */
  lunarMonthIndex?: number
  /** Six seasons (ṛtu) 0–5 from sidereal sunsign */
  ruthuvuIndex?: number
  ruthuvuName?: string
}

export interface PanchangItem {
  type: string
  index: number
  name: string
  /** ISO instant when this segment began (local meaning via timezone-aware formatters). */
  startTime?: string | null
  endTime: string | null
}

export interface Kaalam {
  name: string
  start: string
  end: string
}

export interface FestivalItem {
  id: string
  name: string
  category: 'important' | 'auspicious'
  /** ISO instant (minute-rounded) when the ruling tithi began */
  tithiStart?: string | null
  /** ISO instant when the ruling tithi ends */
  tithiEnd?: string | null
  /** Tithi began on the civil day before the viewed date (in location timezone) */
  tithiStartedPriorCivilDay?: boolean
  /** Carried from the prior panchang day because that sunrise’s tithi extended past today’s sunrise */
  carriedFromPriorVedicDay?: boolean
  /** Ruling tithi begins later on the same civil day (after sunrise) */
  tithiStartsLaterSameCivilDay?: boolean
}

export interface PanchangResponse {
  day: PanchangDay
  panchang: PanchangItem[]
  kaalams: Kaalam[]
  abhijit?: TimeRange
  brahmaMuhurtam?: TimeRange
  amrutaGhadiyalu?: TimeRange[]
  varjam?: TimeRange | null
  durmuhurtham?: TimeRange[]
  festivals?: FestivalItem[]
}
