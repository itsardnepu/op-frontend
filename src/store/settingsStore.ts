import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'te' | 'en'
export type TimeFormat = '12' | '24'
export type ThemeMode = 'light' | 'dark' | 'contrast'
export type FontScale = 1 | 1.1 | 1.2

export interface LocationSettings {
  lat: number
  lon: number
  tz: string
  label?: string
}

interface SettingsState {
  language: Language
  ayanamsa: string
  timeFormat: TimeFormat
  theme: ThemeMode
  fontScale: FontScale
  location: LocationSettings | null
  setLanguage: (lang: Language) => void
  setAyanamsa: (a: string) => void
  setTimeFormat: (fmt: TimeFormat) => void
  setTheme: (t: ThemeMode) => void
  setFontScale: (s: FontScale) => void
  setLocation: (loc: LocationSettings | null) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      ayanamsa: 'lahiri',
      timeFormat: '12',
      theme: 'dark',
      fontScale: 1,
      location: null,
      setLanguage: (language) => set({ language }),
      setAyanamsa: (ayanamsa) => set({ ayanamsa }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setTheme: (theme) => set({ theme }),
      setFontScale: (fontScale) => set({ fontScale }),
      setLocation: (location) => set({ location }),
    }),
    { name: 'onepanchang-settings' }
  )
)
