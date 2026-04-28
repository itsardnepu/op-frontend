export default function About({ inModal }: { inModal?: boolean } = {}) {
  return (
    <div className={inModal ? '' : 'p-4'}>
      {!inModal && <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">About</h1>}
      <p className={inModal ? 'text-slate-600 dark:text-slate-300' : 'mt-2 text-slate-600 dark:text-slate-300'}>
        One Panchang helps you view daily panchang information for your location. Calculations use established
        astronomical libraries. Official site:{' '}
        <a href="https://www.onepanchang.com" className="text-blue-500 underline dark:text-blue-400">
          www.onepanchang.com
        </a>
        .
      </p>

      <div className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Third-party components</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Some calculations rely on Swiss Ephemeris, developed by Astrodienst AG, Switzerland. Swiss Ephemeris and
          other included libraries are used under their respective license terms.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          For attribution, license texts, or other legal notices related to bundled components, email{' '}
          <a href="mailto:hello@onepanchang.com" className="text-blue-500 underline dark:text-blue-400">
            hello@onepanchang.com
          </a>
          .
        </p>
      </div>
    </div>
  )
}
