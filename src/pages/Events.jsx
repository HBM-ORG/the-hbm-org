import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, t } from '../i18n/context'
import { getWhatsappUrl } from '../components/Layout'
import { Calendar, Camera, Plus, Minus, ArrowRight, MapPin } from 'lucide-react'

const timeline2025 = [
  { month:'JAN', date:'January 28, 2025', topic:{en:'Beginning/Start',he:'התחלה'}, desc:{en:'Managing emotions (Fear, Guilt, Hope) without letting them manage us.',he:'ניהול רגשות (פחד, אשמה, תקווה) בלי לתת להם לנהל אותנו.'}, active:true },
  { month:'FEB', date:'February 25, 2025', topic:{en:'Why?',he:'למה?'}, desc:{en:"The Dalai Lama's happiness book. Discussion on core values and philosophy.",he:'ספר האושר של הדלאי לאמה. דיון על ערכים ופילוסופיה.'}, active:true },
  { month:'MAR', date:'March 25, 2025', topic:{en:'Belonging',he:'שייכות'}, desc:{en:'The importance of belonging and community in human life.',he:'חשיבות השייכות והקהילה בחיי האדם.'}, active:true },
  { month:'APR', date:'April 2025', topic:{en:'No Meeting',he:'אין מפגש'}, desc:{en:'No meeting this month.',he:'אין מפגש החודש.'}, active:false },
  { month:'MAY', date:'May 27, 2025', topic:{en:'Gratitude',he:'הכרת תודה'}, desc:{en:'The connection between gratitude and happiness. Changing "I deserve" to "Thank you".',he:'הקשר בין הכרת תודה לאושר. שינוי "מגיע לי" ל"תודה".'}, active:true },
  { month:'JUN', date:'June 24, 2025', topic:{en:'Habits',he:'הרגלים'}, desc:{en:'Habits as a solution to willpower. The loop: Cue → Routine → Reward.',he:'הרגלים כפתרון לכוח רצון. הלולאה: רמז → שגרה → תגמול.'}, active:true },
  { month:'JUL', date:'July 29, 2025', topic:{en:'Self-Actualization',he:'מימוש עצמי'}, desc:{en:'Focusing on being yourself and bringing out your potential.',he:'התמקדות בלהיות עצמך ולהוציא את הפוטנציאל.'}, active:true },
  { month:'AUG', date:'August 26, 2025', topic:{en:'Trust',he:'אמון'}, desc:{en:'Building and maintaining trust in relationships and communities.',he:'בניית ושמירת אמון ביחסים ובקהילות.'}, active:true },
  { month:'SEP', date:'September 30, 2025', topic:{en:'Prayer',he:'תפילה'}, desc:{en:'Prayer as connection. Authenticity vs. Inner Politics.',he:'תפילה כחיבור. אותנטיות מול פוליטיקה פנימית.'}, active:true },
  { month:'OCT', date:'October 28, 2025', topic:{en:'Responsibility',he:'אחריות'}, desc:{en:'Analysis of Response-Ability. Taking ownership of outcomes.',he:'ניתוח Response-Ability. לקיחת אחריות על תוצאות.'}, active:true },
  { month:'NOV', date:'November 25, 2025', topic:{en:'Responsibility (Cont.)',he:'אחריות (המשך)'}, desc:{en:'Collaboration with Dale Carnegie. Active listening, handling people, smiling.',he:'שיתוף פעולה עם דייל קארנגי. הקשבה פעילה, טיפול באנשים, חיוך.'}, active:true },
  { month:'DEC', date:'December 30, 2025', topic:{en:'Confidence',he:'ביטחון'}, desc:{en:'"What\'s in it for me". Personal benefit as a driver for helping others.',he:'"מה יוצא לי מזה". תועלת אישית כמניע לעזרה לאחרים.'}, active:true },
]

export default function Events() {
  const { lang } = useI18n()
  const [year, setYear] = useState('2025')
  const [openCard, setOpenCard] = useState(null)
  const whatsappUrl = getWhatsappUrl(lang)

  return (
    <div className="min-h-screen">

      {/* Hero + Stats */}
      <section className="bg-gradient-hero section-padding text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-hbm-green font-semibold text-sm uppercase tracking-widest mb-3">The Community</p>
          <h1 className="text-4xl md:text-7xl font-bold text-hbm-dark mb-4" style={{letterSpacing:'-2px'}}>
            {t({en:'The Community Hub.',he:'מרכז הקהילה.'},lang)}
          </h1>
          <p className="text-xl text-hbm-gray max-w-2xl mx-auto mb-8">
            {t({en:'Join our monthly "End of Month" events to experience the connection firsthand.',he:'הצטרפו לאירועי "סוף חודש" שלנו כדי לחוות את החיבור בעצמכם.'},lang)}
          </p>
          <Link to="/events/register" className="btn-orange text-lg px-10 py-4 rounded-full inline-flex items-center gap-2" style={{animation:'pulse 2s infinite'}}>
            {t({en:'Register for Next Event',he:'הירשמו לאירוע הקרוב'},lang)} <ArrowRight size={20}/>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          <div><p className="stat-number">12+</p><p className="text-hbm-gray text-sm font-semibold">{t({en:'Events',he:'אירועים'},lang)}</p></div>
          <div><p className="stat-number">200+</p><p className="text-hbm-gray text-sm font-semibold">{t({en:'Participants',he:'משתתפים'},lang)}</p></div>
          <div><p className="stat-number">500+</p><p className="text-hbm-gray text-sm font-semibold">{t({en:'Connections',he:'חיבורים'},lang)}</p></div>
        </div>
      </section>

      {/* Year filter */}
      <section className="py-6 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 flex justify-center gap-3">
          {['2025','2026'].map(y => (
            <button key={y} onClick={() => {setYear(y);setOpenCard(null)}}
              className={`year-pill ${year===y?'year-pill-active':'year-pill-inactive'}`}>{y}</button>
          ))}
        </div>
      </section>

      {/* 2025 Accordion Timeline */}
      {year === '2025' && (
        <section className="section-padding bg-hbm-cream">
          <div className="max-w-3xl mx-auto space-y-3">
            {timeline2025.map((ev, i) => (
              <div key={i}
                className={`rounded-xl overflow-hidden transition-all duration-300 ${
                  !ev.active ? 'opacity-40' : openCard === i ? 'shadow-lg shadow-hbm-purple/20 bg-white' : 'bg-white hover:shadow-md'
                }`}>
                {/* Collapsed header */}
                <button onClick={() => ev.active && setOpenCard(openCard === i ? null : i)}
                  className="w-full flex items-center px-6 py-5 text-left gap-4">
                  <span className="text-sm font-bold text-hbm-purple bg-hbm-purple/10 px-3 py-1 rounded-full w-14 text-center flex-shrink-0">{ev.month}</span>
                  <span className="font-bold text-hbm-dark flex-1">{t(ev.topic, lang)}</span>
                  {ev.active && (
                    openCard === i ? <Minus size={20} className="text-hbm-purple"/> : <Plus size={20} className="text-hbm-gray"/>
                  )}
                </button>
                {/* Expanded */}
                {openCard === i && ev.active && (
                  <div className="px-6 pb-6" style={{animation:'fadeIn 0.3s ease-out'}}>
                    <p className="text-xs text-hbm-orange font-semibold mb-2">{ev.date}</p>
                    <p className="text-hbm-gray leading-relaxed mb-4">{t(ev.desc, lang)}</p>
                    <button className="inline-flex items-center gap-2 text-sm font-semibold text-hbm-purple hover:text-hbm-orange transition-colors">
                      <Camera size={16}/> {t({en:'View Event Photos',he:'צפו בתמונות האירוע'},lang)}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2026 */}
      {year === '2026' && (
        <section className="section-padding bg-hbm-cream">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-hbm-dark mb-6">{t({en:'2026 Events — Coming Soon',he:'אירועי 2026 — בקרוב'},lang)}</h2>
            <p className="text-hbm-gray mb-8">{t({en:'Register now to be the first to know about upcoming events.',he:'הירשמו עכשיו להיות הראשונים לדעת על אירועים קרובים.'},lang)}</p>
            <Link to="/events/register" className="btn-primary text-lg px-10 py-4 rounded-full inline-flex items-center gap-2">
              {t({en:'Register Now',he:'הירשמו עכשיו'},lang)} <ArrowRight size={20}/>
            </Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-gradient-purple text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">{t({en:'Want to host an HBM event?',he:'רוצים לארח אירוע HBM?'},lang)}</h2>
          <p className="text-lg opacity-90 mb-6">{t({en:'Or create your own with our platform.',he:'או ליצור משלכם עם הפלטפורמה שלנו.'},lang)}</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-orange text-lg px-10 py-4 rounded-full inline-flex items-center gap-2">
            {t({en:"Let's Talk",he:'בואו נדבר'},lang)} <ArrowRight size={20}/>
          </a>
        </div>
      </section>
    </div>
  )
}
