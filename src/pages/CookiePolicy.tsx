export default function CookiePolicy({ inModal }: { inModal?: boolean } = {}) {
  return (
    <div className={inModal ? 'max-w-none text-slate-600 dark:text-slate-300' : 'p-4'}>
      {!inModal && <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Cookie Policy</h1>}
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Last updated: March 2026</p>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">1. What This Policy Covers</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          This Cookie Policy explains how One Panchang (“the App”), offered at{' '}
          <a href="https://www.onepanchang.com" className="text-blue-600 underline dark:text-blue-400">
            https://www.onepanchang.com
          </a>
          , uses cookies, local storage, and similar technologies. The App is designed to use minimal tracking and
          no advertising cookies.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">2. Technologies We Use</h2>
        <ul className="mt-1 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <li>
            <strong>Local storage:</strong> We use your browser’s local storage to save your preferences (e.g.
            language, time format, theme, ayanamsa, last chosen location). This data stays on your device and
            is not sent to our servers except when needed for API requests (e.g. coordinates and ayanamsa for
            panchang calculations). It is not used for advertising.
          </li>
          <li>
            <strong>Session storage:</strong> We may use session storage for short-lived data on specific pages.
            It is cleared when you close the browser tab or window.
          </li>
          <li>
            <strong>Analytics:</strong> Our hosting provider may offer privacy-oriented, aggregate usage insights
            (e.g. page views). This is not used for advertising. The provider’s documentation describes how such
            data is handled.
          </li>
          <li>
            <strong>Cookies:</strong> The App may use strictly necessary cookies (e.g. for security or load
            balancing) if our hosting or API infrastructure requires them. We do not use cookies for
            advertising or cross-site tracking.
          </li>
        </ul>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">3. Your Choices</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          You can disable or clear local storage and cookies through your browser settings. Doing so may reset
          your preferences (e.g. language, location) and you may need to set them again. Blocking all cookies
          may affect how the App or our API works.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">4. Third Parties</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Our hosting provider may process technical data or set cookies as described in its policies. We do
          not embed third-party advertising or social widgets that set tracking cookies for marketing.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">5. Updates</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          We may update this Cookie Policy from time to time. The “Last updated” date will be revised
          accordingly. Continued use of the App after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">6. Contact</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          For questions about cookies or local storage, email{' '}
          <a href="mailto:hello@onepanchang.com" className="text-slate-800 underline hover:text-slate-900 dark:text-blue-400 dark:hover:text-blue-300">
            hello@onepanchang.com
          </a>
          .
        </p>
      </section>
    </div>
  )
}
