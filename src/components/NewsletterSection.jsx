import { useI18n, t } from '../i18n/context'

export default function NewsletterSection() {
  const { lang } = useI18n()

  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 font-sofia text-hbm-dark tracking-tight">
          {t({en:'Join the community', he:'הצטרפו לקהילה'}, lang)}
        </h2>
        <p className="text-hbm-gray text-lg mb-10 font-sofia max-w-2xl mx-auto">
          {t({en:'Get updates on events, connection tips, and HBM news.', he:'קבלו עדכונים על אירועים, וטיפים לחיבור.'}, lang)}
        </p>

        <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
          <div className="flex-1">
            <input 
              type="email" 
              placeholder={t({en:'Your Email', he:'האימייל שלך'}, lang)} 
              className="w-full px-6 py-4 rounded-full bg-gray-50 border border-gray-200 text-hbm-dark placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-hbm-orange/20 focus:border-hbm-orange font-sofia text-base transition-all"
              required
            />
          </div>
          <button type="submit" className="btn-orange text-white px-10 py-4 rounded-full font-bold shadow-lg text-base hover:scale-105 transition-transform whitespace-nowrap">
            {t({en:'Subscribe', he:'הרשמה'}, lang)}
          </button>
        </form>
      </div>
    </section>
  )
}
