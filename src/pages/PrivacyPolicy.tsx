export default function PrivacyPolicy({ inModal }: { inModal?: boolean } = {}) {
  return (
    <div className={inModal ? 'max-w-none text-slate-600 dark:text-slate-300' : 'p-4'}>
      {!inModal && <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Privacy Policy</h1>}
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Last updated: March 2026</p>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">1. Introduction</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          One Panchang (“we”, “the App”) respects your privacy. This Privacy Policy explains what data we
          collect, how we use it, and your choices. The App is designed to minimize data collection and does
          not require an account. Our public website is{' '}
          <a href="https://www.onepanchang.com" className="text-blue-600 underline dark:text-blue-400">
            https://www.onepanchang.com
          </a>{' '}
          (also{' '}
          <a href="https://onepanchang.com" className="text-blue-600 underline dark:text-blue-400">
            https://onepanchang.com
          </a>
          ).
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">2. Data We Collect</h2>
        <ul className="mt-1 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <li>
            <strong>Location data (optional):</strong> If you allow it, we use your device’s location (latitude,
            longitude) to compute panchang times for your place. Location is sent only to our backend API to
            calculate results and is not stored on our servers for longer than needed to respond.
          </li>
          <li>
            <strong>Local storage:</strong> We store your preferences (e.g. language, time format, theme,
            ayanamsa choice, last selected location) in your browser’s local storage so the App works as you
            expect. This data stays on your device and is not sent to us except as part of API requests (e.g.
            coordinates and ayanamsa for calculations).
          </li>
          <li>
            <strong>Usage analytics:</strong> Our hosting provider may collect aggregate, privacy-oriented usage
            statistics (such as page views) so we can understand how the App is used. This is not used for
            advertising or profiling you. The provider processes such data under its own terms.
          </li>
          <li>
            <strong>API usage:</strong> When you use the App, your browser sends requests to our API (e.g. date,
            coordinates, timezone). Server logs may include IP address and request details for operational and
            security purposes. We do not use this for advertising or profiling.
          </li>
        </ul>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">3. How We Use Data</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          We use the data described above only to: (a) provide panchang calculations for your location and
          date, (b) remember your settings, (c) operate, secure, and improve the service, and (d) understand
          aggregate usage through analytics. We do not sell your data or use it for targeted advertising.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">4. Data Sharing</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          We do not share your personal data with third parties for marketing. We use third-party services for
          hosting and related operations that may process technical or aggregate data when you use the App;
          such providers are bound by their own privacy and data-processing terms. We may disclose data if
          required by law or to protect our rights and safety.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">5. Cookies and Local Storage</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          The App may use local storage (and similar technologies) to save preferences. We do not use tracking
          cookies for advertising. Aggregate analytics are described above and in our Cookie Policy.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">6. Your Rights</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          You can revoke location permission in your device or browser settings. You can clear local storage
          (e.g. via browser settings) to remove stored preferences. If you are in a region with specific privacy
          rights (e.g. GDPR), you may have the right to access, correct, or delete personal data we hold;
          contact us via the details below to request this.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">7. Security</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          We take reasonable steps to protect data in transit and at rest. No method of transmission or
          storage is 100% secure; we cannot guarantee absolute security.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">8. Changes</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          We may update this Privacy Policy from time to time. The “Last updated” date will be revised
          accordingly. Continued use of the App after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">9. Contact</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          For privacy-related questions, email{' '}
          <a href="mailto:hello@onepanchang.com" className="text-slate-800 underline hover:text-slate-900 dark:text-blue-400 dark:hover:text-blue-300">
            hello@onepanchang.com
          </a>
          .
        </p>
      </section>
    </div>
  )
}
