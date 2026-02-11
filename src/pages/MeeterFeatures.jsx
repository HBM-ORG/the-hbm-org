
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, t } from '../i18n/context'
import { ArrowRight, Shield, Globe, Lock, BarChart3 } from 'lucide-react'





const WP = 'https://www.thehbm.org/wp-content/uploads'
const steps = [
  { title:{en:'A branded platform that feels like yours',he:'פלטפורמה ממותגת שמרגישה שלכם'}, text:{en:'White-label space tailored to your identity. Your colors, your vibe, your community.',he:'מרחב white-label מותאם לזהות שלכם.'}, image:`${WP}/2025/06/11.png` },
  { title:{en:'Tools that make managing easy',he:'כלים שמקלים על הניהול'}, text:{en:'Member lists, engagement tracking, content updates — all from one dashboard.',he:'רשימות חברים, מעקב מעורבות — הכל מלוח בקרה אחד.'}, image:`${WP}/2025/06/22.png` },
  { title:{en:'Hands-on support from our team',he:'תמיכה צמודה מהצוות שלנו'}, text:{en:'From setup to strategy, we are with you every step.',he:'מהקמה ועד אסטרטגיה, אנחנו איתכם בכל שלב.'}, image:`${WP}/2025/06/33.png` },
  { title:{en:'A foundation for future collaboration',he:'בסיס לשיתוף פעולה עתידי'}, text:{en:"In-person events, custom workshops — let's co-create.",he:'אירועים פיזיים, סדנאות מותאמות — בואו ניצור יחד.'}, image:`${WP}/2025/06/44.png` },
]
const security = [
  { icon:Shield, title:{en:'GDPR Compliant',he:'תואם GDPR'}, text:{en:'Full privacy compliance.',he:'עמידה מלאה בתקנות פרטיות.'} },
  { icon:Globe, title:{en:'No App Download',he:'בלי הורדת אפליקציה'}, text:{en:'Browser-based. Zero friction.',he:'מבוסס דפדפן. אפס חיכוך.'} },
  { icon:Lock, title:{en:'Secure Cloud',he:'ענן מאובטח'}, text:{en:'Enterprise-grade infrastructure.',he:'תשתית ברמת Enterprise.'} },
]

export default function MeeterFeatures() {
  const { lang } = useI18n()
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p+1)%steps.length), 4000)
    return () => clearInterval(t)
  }, [])



  return (
    <div className="min-h-screen">
      {/* New Enhanced Sections */}





      {/* Original MeeterFeatures Content */}
      <section className="bg-gradient-hero section-padding text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-hbm-purple font-semibold text-sm uppercase tracking-widest mb-3">Meeter — Features</p>
          <h1 className="text-4xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] bg-clip-text text-transparent" style={{letterSpacing:'-2px'}}>{t({en:'How Will This Help You?',he:'איך זה יעזור לכם?'},lang)}</h1>
          <p className="text-xl text-hbm-gray">{t({en:'See what awaits you.',he:'ראו מה מחכה לכם.'},lang)}</p>
        </div>
      </section>

      {/* Scrollytelling */}
      <section className="section-padding bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 space-y-2">
            {steps.map((s,i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`w-full text-left p-6 rounded-xl transition-all duration-300 ${active===i?'bg-white shadow-lg border-l-4 border-hbm-orange scale-[1.02]':'bg-transparent border-l-4 border-transparent hover:bg-gray-50'}`}>
                <h3 className={`text-lg mb-1 transition-colors ${active===i?'font-bold text-hbm-orange':'font-semibold text-hbm-gray'}`}>{i+1}. {t(s.title,lang)}</h3>
                {active===i && <p className="text-hbm-gray text-sm mt-2" style={{animation:'fadeIn 0.3s ease-out'}}>{t(s.text,lang)}</p>}
              </button>
            ))}
          </div>
          <div className="md:w-1/2 flex justify-center md:sticky md:top-32 self-start">
            <div className="relative w-[280px]">
              <div className="bg-hbm-purple rounded-[40px] p-3 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-hbm-purple rounded-b-2xl z-10"/>
                <div className="bg-white rounded-[32px] overflow-hidden aspect-[9/19]">
                  <img key={active} src={steps[active].image} alt="" className="w-full h-full object-cover" style={{animation:'fadeIn 0.5s ease-in-out'}}/>
                </div>
              </div>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/60 rounded-full"/>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-10">
          {steps.map((_,i) => <button key={i} onClick={() => setActive(i)} className={`w-3 h-3 rounded-full transition-all ${active===i?'bg-hbm-orange w-8':'bg-gray-300'}`}/>)}
        </div>
      </section>

      {/* Measure the Magic */}
      <section className="section-padding bg-hbm-cream">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold text-hbm-purple mb-4">{t({en:'Measure the Magic.',he:'מדדו את הקסם.'},lang)}</h2>
            <p className="text-lg text-hbm-dark leading-relaxed mb-6">{t({en:"Don't guess. Know exactly what happened at your event. Track connections made, top interests, satisfaction scores — all in real time.",he:'אל תנחשו. דעו בדיוק מה קרה באירוע שלכם. עקבו אחרי חיבורים, תחומי עניין, ציוני שביעות רצון — הכל בזמן אמת.'},lang)}</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 text-center"><BarChart3 size={24} className="text-hbm-purple mx-auto mb-2"/><p className="text-2xl font-bold text-hbm-dark">127</p><p className="text-xs text-hbm-gray">{t({en:'Connections',he:'חיבורים'},lang)}</p></div>
              <div className="bg-white rounded-xl p-4 text-center"><p className="text-2xl font-bold text-hbm-dark">4.8</p><p className="text-xs text-hbm-gray">{t({en:'Avg Rating',he:'דירוג ממוצע'},lang)}</p></div>
              <div className="bg-white rounded-xl p-4 text-center"><p className="text-2xl font-bold text-hbm-dark">89%</p><p className="text-xs text-hbm-gray">{t({en:'Follow-ups',he:'המשכים'},lang)}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg"><div className="aspect-video bg-gradient-to-br from-hbm-purple/10 to-hbm-orange/10 rounded-xl flex items-center justify-center"><p className="text-hbm-gray font-semibold">📊 Dashboard Preview</p></div></div>
        </div>
      </section>

      {/* Security */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-hbm-dark mb-10">{t({en:'Enterprise Grade Security.',he:'אבטחה ברמת Enterprise.'},lang)}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {security.map((s,i) => (
              <div key={i} className="bg-hbm-cream rounded-2xl p-6 card-hover">
                <div className="w-14 h-14 rounded-full bg-hbm-purple/10 flex items-center justify-center mx-auto mb-4"><s.icon size={28} className="text-hbm-purple"/></div>
                <h3 className="font-bold text-hbm-dark mb-2">{t(s.title,lang)}</h3>
                <p className="text-hbm-gray text-sm">{t(s.text,lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-purple text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">{t({en:'Ready to see pricing?',he:'מוכנים לראות תמחור?'},lang)}</h2>
          <Link to="/meeter/pricing" className="btn-orange text-lg px-10 py-4 rounded-full inline-flex items-center gap-2 hover:scale-105 transition-transform">
            {t({en:'View Pricing Plans',he:'צפו בתוכניות מחיר'},lang)} <ArrowRight size={20}/>
          </Link>
        </div>
      </section>
    </div>
  )
}
