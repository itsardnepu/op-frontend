export default function Disclaimer({ inModal }: { inModal?: boolean } = {}) {
  return (
    <div className={inModal ? 'max-w-none text-slate-600 dark:text-slate-300' : 'p-4'}>
      {!inModal && <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Disclaimer</h1>}
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Last updated: March 2026</p>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Informational Use Only</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          One Panchang (
          <a href="https://www.onepanchang.com" className="text-blue-600 underline dark:text-blue-400">
            https://www.onepanchang.com
          </a>
          ) provides panchang (Hindu almanac) information—including tithi, nakshatra, related
          divisions, sunrise/sunset and other timings where shown, summarized calendar context, and optional
          highlighted dates—for cultural, educational, and general reference only. Results depend on
          astronomical data, your chosen settings, and the app’s interpretation of traditional conventions.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Not Professional Advice</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          The App does not provide religious, astrological, legal, medical, or any other professional advice.
          You should not rely on the App’s content for decisions regarding rituals, ceremonies, travel, health,
          or legal matters. For such purposes, please consult qualified practitioners or authorities.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Accuracy and Suitability</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          While we aim for accuracy, we do not guarantee that the information is error-free, complete, or
          suitable for every tradition or region. Panchang practices vary by region and school; displayed
          labels and highlighted dates may not match every local almanac or sect-specific interpretation. Use
          your own judgment and, when in doubt, refer to authoritative sources or local experts.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">No Liability</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          To the fullest extent permitted by law, the developer and any affiliates shall not be liable for any
          direct, indirect, incidental, or consequential loss or damage arising from your use of or reliance
          on the App or its content. You use the App at your own risk.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Contact</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          For questions about this Disclaimer, email{' '}
          <a href="mailto:hello@onepanchang.com" className="text-slate-800 underline hover:text-slate-900 dark:text-blue-400 dark:hover:text-blue-300">
            hello@onepanchang.com
          </a>
          .
        </p>
      </section>
    </div>
  )
}
