import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const LAST_VIEWED_KEY = 'onepanchang-last-viewed'

export function setLastViewedDate(date: string) {
  try {
    localStorage.setItem(LAST_VIEWED_KEY, date)
  } catch {}
}

export function getLastViewedDate(): string | null {
  try {
    return localStorage.getItem(LAST_VIEWED_KEY)
  } catch {
    return null
  }
}

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  const lastDate = getLastViewedDate()

  return (
    <div className="border-b border-amber-200 bg-amber-100 px-4 py-2 text-center text-sm text-amber-900 contrast:border-slate-900 contrast:bg-white contrast:text-slate-900">
      <span className="font-medium">No internet connection.</span>
      {lastDate && (
        <span className="ml-2">
          View last cached:{' '}
          <Link to={`/day/${lastDate}`} className="underline font-medium">
            {lastDate}
          </Link>
        </span>
      )}
    </div>
  )
}
