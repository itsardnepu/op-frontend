export default function TermsAndConditions({ inModal }: { inModal?: boolean } = {}) {
  return (
    <div className={inModal ? 'max-w-none text-slate-600 dark:text-slate-300' : 'p-4'}>
      {!inModal && <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Terms and Conditions</h1>}
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Last updated: March 2026</p>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">1. Acceptance of Terms</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          By accessing or using One Panchang (“the App”) at{' '}
          <a href="https://www.onepanchang.com" className="text-blue-600 underline dark:text-blue-400">
            https://www.onepanchang.com
          </a>
          , you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms,
          please do not use the App.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">2. Description of Service</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          One Panchang is a Progressive Web App that provides daily panchang (Hindu calendar) information—such
          as tithi, nakshatra, timings, and related summaries—for your location, date, timezone, and settings.
          Telugu and English are supported. Results are produced for cultural and informational purposes only.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">3. Use of the App</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          You may use the App only for lawful purposes and in accordance with these terms. You agree not to use
          the App to transmit any harmful code, attempt to gain unauthorized access to any systems, or use the
          App in any way that could impair its availability or functionality.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">4. Location and Data</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          The App may request your location to provide location-specific panchang data. Location data is used
          only to compute astronomical times and is not shared with third parties for marketing. Settings such
          as language, time format, theme, and ayanamsa may be stored locally on your device. See our Privacy
          Policy for more details.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">5. Disclaimer</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          The App and its content are provided “as is” for informational and cultural use only. Panchang
          information is not intended as religious, legal, or life guidance. We do not guarantee the accuracy,
          completeness, or suitability of the information for any particular purpose. You use the App at your
          own risk.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">6. Intellectual Property</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          The One Panchang name, branding, user experience, and proprietary software are © Designed and
          Developed by Upendra Pinnelli (ardnepu). Third-party libraries remain under their own licenses. You may
          not copy, modify, reverse engineer, scrape, or redistribute the App or our proprietary materials
          without prior written permission, except where mandatory law applies.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">7. Changes to Terms</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          We may update these Terms and Conditions from time to time. The “Last updated” date at the top will
          reflect the latest revision. Continued use of the App after changes constitutes acceptance of the
          revised terms.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">8. Contact</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          For questions about these Terms and Conditions, email{' '}
          <a href="mailto:hello@onepanchang.com" className="text-slate-800 underline hover:text-slate-900 dark:text-blue-400 dark:hover:text-blue-300">
            hello@onepanchang.com
          </a>
          .
        </p>
      </section>
    </div>
  )
}
