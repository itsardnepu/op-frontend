import { useSettingsStore } from '../store/settingsStore'

export default function Settings({ inModal }: { inModal?: boolean } = {}) {
  const { language, setLanguage, timeFormat, setTimeFormat, theme, setTheme, fontScale, setFontScale } = useSettingsStore()

  return (
    <div className={inModal ? '' : 'p-4'}>
      {!inModal && <h1 className="text-2xl font-bold text-slate-800">Settings</h1>}
      <div className={inModal ? 'space-y-4' : 'mt-4 space-y-4'}>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'contrast')}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="contrast">High contrast</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Font size</label>
          <select
            value={fontScale}
            onChange={(e) => setFontScale(parseFloat(e.target.value) as 1 | 1.1 | 1.2)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value={1}>Normal</option>
            <option value={1.1}>Large</option>
            <option value={1.2}>Extra large</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'te' | 'en')}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="te">తెలుగు (Telugu)</option>
            <option value="en">English</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Time format</label>
          <select
            value={timeFormat}
            onChange={(e) => setTimeFormat(e.target.value as '12' | '24')}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="12">12 hour</option>
            <option value="24">24 hour</option>
          </select>
        </div>
      </div>
    </div>
  )
}
