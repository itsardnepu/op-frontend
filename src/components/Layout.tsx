import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import OfflineBanner from './OfflineBanner'
import About from '../pages/About'
import TermsAndConditions from '../pages/TermsAndConditions'
import PrivacyPolicy from '../pages/PrivacyPolicy'
import CookiePolicy from '../pages/CookiePolicy'
import Disclaimer from '../pages/Disclaimer'
import { useSettingsStore } from '../store/settingsStore'

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative max-h-[90vh] w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 ${wide ? 'max-w-2xl' : 'max-w-lg'}`} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200" aria-label="Close">
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

function ThemeIcon({ mode }: { mode: 'light' | 'dark' | 'contrast' }) {
  // Show the icon for the CURRENT theme.
  if (mode === 'light') {
    // Light (sun)
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="block h-6 w-6">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    )
  }
  if (mode === 'dark') {
    // Dark (moon)
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="block h-6 w-6">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    )
  }
  // High Contrast (HC badge)
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center text-[11px] font-extrabold leading-none tracking-tight">
      HC
    </span>
  )
}

export default function Layout() {
  const [aboutOpen, setAboutOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [cookieOpen, setCookieOpen] = useState(false)
  const [disclaimerOpen, setDisclaimerOpen] = useState(false)
  const { theme, setTheme, language, setLanguage, timeFormat, setTimeFormat, fontScale, setFontScale } = useSettingsStore()

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    root.classList.remove('contrast')
    if (theme === 'dark') root.classList.add('dark')
    if (theme === 'contrast') root.classList.add('contrast')
  }, [theme])

  const cycleFontScale = () => {
    setFontScale(fontScale === 1 ? 1.1 : fontScale === 1.1 ? 1.2 : 1)
  }

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <OfflineBanner />
      <header className="top-4 z-[10000] isolate w-full pt-2 sm:sticky">
        <div className="mx-auto w-full max-w-4xl px-4 pb-3">
          <div className="glass-surface flex w-full flex-col items-center gap-2 rounded-2xl px-3 py-3 text-center shadow-lg sm:flex-row sm:justify-between sm:text-left sm:px-4">
            <Link
              to="/"
              className="flex min-w-0 items-center justify-center gap-2 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 sm:justify-start"
            >
              <img src="/logo.svg" alt="One Panchang" className="h-[2.75rem] w-[2.75rem] shrink-0 sm:h-[3.75rem] sm:w-[3.75rem]" />
              <div className="min-w-0 leading-tight">
                <h1 className="whitespace-nowrap text-[17px] font-semibold text-slate-800 dark:text-slate-100 sm:text-xl">One Panchang</h1>
                <p className="whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400 sm:text-xs">Accurate . Simple . Modern</p>
              </div>
            </Link>
            <div className="flex shrink-0 items-center justify-center gap-1 sm:justify-end">
              <button
                type="button"
                onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'contrast' : 'light')}
                className="btn-ghost inline-flex items-center justify-center leading-none"
                aria-label={`Theme: ${theme === 'contrast' ? 'High contrast' : theme}. Activate to change.`}
              >
                <ThemeIcon mode={theme} />
              </button>
              <button
                type="button"
                onClick={() => setLanguage(language === 'te' ? 'en' : 'te')}
                className="btn-ghost inline-flex items-center justify-center leading-none"
                aria-label="Toggle language"
              >
                <span className={`font-extrabold leading-none text-slate-700 dark:text-slate-200 contrast:text-slate-800 ${language === 'te' ? 'text-[15px]' : 'text-[15px]'}`}>
                  {language === 'te' ? 'EN' : 'తె'}
                </span>
              </button>
              <button
                type="button"
                onClick={cycleFontScale}
                className="btn-ghost inline-flex items-center justify-center leading-none"
                aria-label={`Font size: ${fontScale === 1 ? 'Normal' : fontScale === 1.1 ? 'Large' : 'Extra large'}. Activate to change.`}
              >
                <span className="text-[15px] font-extrabold leading-none text-slate-700 dark:text-slate-200 contrast:text-slate-800">
                  Aa
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTimeFormat(timeFormat === '12' ? '24' : '12')}
                className="btn-ghost -ml-1 inline-flex items-center justify-center leading-none"
                aria-label="Toggle time format"
              >
                <ClockIcon className="block h-6 w-6 text-slate-700 dark:text-slate-200 contrast:text-slate-800" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1">
        <Outlet />
      </main>
      <footer className="px-4 py-4 text-center text-sm text-slate-600 dark:text-slate-400">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <button type="button" onClick={() => setAboutOpen(true)} className="underline hover:text-slate-800 dark:hover:text-slate-200">
            About
          </button>
          <span className="text-slate-400">·</span>
          <button type="button" onClick={() => setTermsOpen(true)} className="underline hover:text-slate-800 dark:hover:text-slate-200">
            Terms and Conditions
          </button>
          <span className="text-slate-400">·</span>
          <button type="button" onClick={() => setPrivacyOpen(true)} className="underline hover:text-slate-800 dark:hover:text-slate-200">
            Privacy Policy
          </button>
          <span className="text-slate-400">·</span>
          <button type="button" onClick={() => setCookieOpen(true)} className="underline hover:text-slate-800 dark:hover:text-slate-200">
            Cookie Policy
          </button>
          <span className="text-slate-400">·</span>
          <button type="button" onClick={() => setDisclaimerOpen(true)} className="underline hover:text-slate-800 dark:hover:text-slate-200">
            Disclaimer
          </button>
        </div>
        <p className="mt-2">
          © {new Date().getFullYear()} One Panchang. All rights reserved.
        </p>
      </footer>

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About">
        <About inModal />
      </Modal>
      <Modal open={termsOpen} onClose={() => setTermsOpen(false)} title="Terms and Conditions" wide>
        <TermsAndConditions inModal />
      </Modal>
      <Modal open={privacyOpen} onClose={() => setPrivacyOpen(false)} title="Privacy Policy" wide>
        <PrivacyPolicy inModal />
      </Modal>
      <Modal open={cookieOpen} onClose={() => setCookieOpen(false)} title="Cookie Policy" wide>
        <CookiePolicy inModal />
      </Modal>
      <Modal open={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} title="Disclaimer" wide>
        <Disclaimer inModal />
      </Modal>
    </div>
  )
}
