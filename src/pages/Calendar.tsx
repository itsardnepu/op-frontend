import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettingsStore } from '../store/settingsStore'

function getDaysInMonth(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const days: Date[] = []
  const startPad = first.getDay()
  const prevMonth = new Date(year, month, 0)
  const prevDays = prevMonth.getDate()

  for (let i = startPad - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, prevDays - i))
  }
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    days.push(new Date(year, month + 1, d))
  }
  return days
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTH_NAMES_TE = ['జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్', 'జూలై', 'ఆగస్ట్', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_TE = ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని']

export default function Calendar() {
  const [viewDate, setViewDate] = useState(() => new Date())
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const days = getDaysInMonth(year, month)
  const today = new Date().toISOString().slice(0, 10)
  const { language } = useSettingsStore()
  const isTelugu = language === 'te'

  const monthName = isTelugu ? MONTH_NAMES_TE[month] : MONTH_NAMES[month]
  const weekdays = isTelugu ? WEEKDAYS_TE : WEEKDAYS

  const prevMonth = () => setViewDate(new Date(year, month - 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1))

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-slate-800">
          {monthName} {year}
        </h1>
        <button
          onClick={nextMonth}
          className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-slate-500">
            {d}
          </div>
        ))}
        {days.map((d) => {
          const dateStr = d.toISOString().slice(0, 10)
          const isCurrentMonth = d.getMonth() === month
          const isToday = dateStr === today
          return (
            <Link
              key={dateStr}
              to={`/day/${dateStr}`}
              className={`flex aspect-square items-center justify-center rounded-lg text-sm transition-colors ${
                !isCurrentMonth ? 'text-slate-300' : 'text-slate-800 hover:bg-slate-100'
              } ${isToday ? 'bg-slate-200 font-bold' : ''}`}
            >
              {d.getDate()}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
