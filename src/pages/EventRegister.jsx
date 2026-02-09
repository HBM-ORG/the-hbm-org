import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, t } from '../i18n/context'
import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react'

export default function EventRegister() {
  const { lang } = useI18n()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true) }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <section className="section-padding">
        <div className="max-w-2xl mx-auto">
          <Link to="/events" className="inline-flex items-center gap-2 text-hbm-purple font-semibold mb-8 hover:text-hbm-orange transition-colors">
            <ArrowLeft size={18}/> {t({en:'Back to Events',he:'חזרה לאירועים'},lang)}
          </Link>

          {!submitted ? (
            <>
              {/* Event Info Card */}
              <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                <span className="inline-block text-xs font-bold text-hbm-green bg-hbm-green/10 px-3 py-1 rounded-full mb-4">
                  {t({en:'Next Event',he:'אירוע קרוב'},lang)}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-hbm-dark mb-4" style={{letterSpacing:'-1px'}}>
                  {t({en:'End of Month Gathering',he:'מפגש סוף חודש'},lang)}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-hbm-gray mb-4">
                  <span className="flex items-center gap-1"><Calendar size={16} className="text-hbm-purple"/> {t({en:'Coming Soon — 2026',he:'בקרוב — 2026'},lang)}</span>
                  <span className="flex items-center gap-1"><MapPin size={16} className="text-hbm-orange"/> TBD</span>
                  <span className="flex items-center gap-1"><Clock size={16} className="text-hbm-green"/> {t({en:'18:00 — 21:00',he:'18:00 — 21:00'},lang)}</span>
                </div>
                <p className="text-hbm-gray leading-relaxed">
                  {t({en:'Join our next community event for meaningful conversations, new connections, and personal growth. Register below to save your spot.',he:'הצטרפו לאירוע הקהילתי הבא שלנו לשיחות משמעותיות, חיבורים חדשים וצמיחה אישית. הירשמו למטה כדי לשמור את המקום.'},lang)}
                </p>
              </div>

              {/* Registration Form */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-hbm-purple mb-6">{t({en:'Register Now',he:'הירשמו עכשיו'},lang)}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-hbm-dark mb-1">{t({en:'Full Name',he:'שם מלא'},lang)}</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-hbm-purple focus:ring-2 focus:ring-hbm-purple/20" placeholder={t({en:'Your name',he:'השם שלך'},lang)}/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-hbm-dark mb-1">{t({en:'Phone',he:'טלפון'},lang)}</label>
                    <input type="tel" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-hbm-purple focus:ring-2 focus:ring-hbm-purple/20" placeholder={t({en:'05X-XXXXXXX',he:'05X-XXXXXXX'},lang)}/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-hbm-dark mb-1">{t({en:'Email',he:'אימייל'},lang)}</label>
                    <input type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-hbm-purple focus:ring-2 focus:ring-hbm-purple/20" placeholder="you@email.com"/>
                  </div>
                  <button type="submit" className="btn-orange w-full text-lg py-4 rounded-full mt-4">
                    {t({en:'Save My Spot',he:'שמרו לי מקום'},lang)}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 shadow-lg text-center" style={{animation:'fadeIn 0.5s ease-out'}}>
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold text-hbm-purple mb-4">{t({en:"You're In!",he:'נרשמתם!'},lang)}</h2>
              <p className="text-lg text-hbm-gray mb-8">{t({en:"We'll send you all the details soon. See you there!",he:'נשלח לכם את כל הפרטים בקרוב. נתראה שם!'},lang)}</p>
              <Link to="/events" className="btn-primary px-8 py-3 rounded-full">{t({en:'Back to Events',he:'חזרה לאירועים'},lang)}</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
