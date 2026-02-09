import { useState } from 'react'
import { useI18n, t } from '../i18n/context'
import { getWhatsappUrl } from '../components/Layout'
import { Check, X, ChevronDown, ArrowRight } from 'lucide-react'

const pricing = [
  { tier:{en:'DIY / Custom',he:'עשה זאת בעצמך'}, price:'650', prefix:{en:'Starting at',he:'החל מ-'}, period:{en:'one-time',he:'חד פעמי'},
    details:[{en:'No commitment',he:'ללא התחייבות'},{en:'System usage',he:'שימוש במערכת'},{en:'Basic setup & QR generation',he:'הקמה בסיסית + QR'},{en:'No staff included',he:'ללא צוות'}], featured:false },
  { tier:{en:'Full Package',he:'חבילה מלאה'}, price:'3,000', prefix:{en:'',he:''}, period:{en:'one-time',he:'חד פעמי'},
    details:[{en:'No commitment',he:'ללא התחייבות'},{en:'2 staff members on-site',he:'2 אנשי צוות באירוע'},{en:'Strategy & planning',he:'אסטרטגיה ותכנון'},{en:'Custom branding + data report',he:'מיתוג מותאם + דוח נתונים'}], featured:false },
  { tier:{en:'Annual Subscription',he:'מנוי שנתי'}, price:'1,900', prefix:{en:'',he:''}, period:{en:'/month',he:'/חודש'},
    badge:{en:'POPULAR',he:'פופולרי'},
    details:[{en:'Unlimited events',he:'אירועים ללא הגבלה'},{en:'Full data access',he:'גישה מלאה לנתונים'},{en:'Dedicated support',he:'תמיכה ייעודית'},{en:'No staff included',he:'ללא צוות'}], featured:true },
  { tier:{en:'6-Month',he:'6 חודשים'}, price:'2,200', prefix:{en:'',he:''}, period:{en:'/month',he:'/חודש'},
    details:[{en:'Unlimited events',he:'אירועים ללא הגבלה'},{en:'Full data access',he:'גישה מלאה'},{en:'No staff included',he:'ללא צוות'}], featured:false },
  { tier:{en:'10 Events Card',he:'כרטיסיית 10'}, price:'10,800', prefix:{en:'',he:''}, period:{en:'total',he:'סה"כ'},
    details:[{en:'10 events package',he:'חבילת 10 אירועים'},{en:'Flexible scheduling',he:'תזמון גמיש'},{en:'No staff included',he:'ללא צוות'}], featured:false },
]

const compareRows = [
  { feature:{en:'Staff On-Site',he:'צוות באירוע'}, diy:false, full:true },
  { feature:{en:'Custom Branding',he:'מיתוג מותאם'}, diy:false, full:true },
  { feature:{en:'Data Report',he:'דוח נתונים'}, diy:false, full:true },
  { feature:{en:'Strategy Support',he:'תמיכה אסטרטגית'}, diy:false, full:true },
  { feature:{en:'System Access',he:'גישה למערכת'}, diy:true, full:true },
  { feature:{en:'QR Generation',he:'יצירת QR'}, diy:true, full:true },
]

const faqItems = [
  { q:{en:'Can I upgrade later?',he:'אפשר לשדרג אח"כ?'}, a:{en:'Yes! You can upgrade from any plan to a higher tier at any time. We\'ll credit your existing payments.',he:'כן! אפשר לשדרג מכל תוכנית בכל זמן. נזכה את התשלומים הקיימים.'} },
  { q:{en:'Is the price per event or per month?',he:'המחיר לאירוע או לחודש?'}, a:{en:'DIY and Full Package are per event. Annual and 6-Month are monthly subscriptions for unlimited events.',he:'DIY וחבילה מלאה הם לאירוע. שנתי ו-6 חודשים הם מנויים חודשיים לאירועים ללא הגבלה.'} },
  { q:{en:'Do you provide hardware?',he:'אתם מספקים חומרה?'}, a:{en:'No hardware needed! Everything runs in the browser. Participants just scan a QR code with their phone.',he:'לא צריך חומרה! הכל רץ בדפדפן. משתתפים פשוט סורקים QR עם הטלפון.'} },
  { q:{en:'What if I need more than 10 events?',he:'מה אם צריך יותר מ-10 אירועים?'}, a:{en:'Consider our Annual subscription for unlimited events at a better rate.',he:'שקלו את המנוי השנתי שלנו לאירועים ללא הגבלה במחיר טוב יותר.'} },
]

export default function MeeterPricing() {
  const { lang } = useI18n()
  const whatsappUrl = getWhatsappUrl(lang)
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-hero section-padding text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-hbm-purple font-semibold text-sm uppercase tracking-widest mb-3">Meeter — Pricing</p>
          <h1 className="text-4xl md:text-7xl font-bold text-hbm-dark mb-4" style={{letterSpacing:'-2px'}}>{t({en:'Simple, Transparent Pricing.',he:'תמחור פשוט ושקוף.'},lang)}</h1>
          <p className="text-xl text-hbm-gray">{t({en:'Choose the plan that fits your event.',he:'בחרו את התוכנית שמתאימה לאירוע.'},lang)}</p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {pricing.map((plan,i) => (
              <div key={i} className={`rounded-2xl p-6 border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${plan.featured?'border-hbm-purple bg-hbm-light shadow-lg relative':'border-gray-200 bg-white hover:border-hbm-purple'}`}>
                {plan.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-hbm-orange text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">{t(plan.badge,lang)}</span>}
                <h3 className="font-bold text-hbm-dark text-lg mb-4">{t(plan.tier,lang)}</h3>
                <div className="mb-4">
                  {plan.prefix[lang||'en'] && <span className="text-hbm-gray text-xs">{t(plan.prefix,lang)} </span>}
                  <span className="text-4xl font-bold text-hbm-dark">₪{plan.price}</span>
                  <span className="text-hbm-gray text-sm ml-1">{t(plan.period,lang)}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.details.map((d,j) => <li key={j} className="flex items-start gap-2 text-sm text-hbm-gray"><Check size={16} className="text-hbm-green flex-shrink-0 mt-0.5"/>{t(d,lang)}</li>)}
                </ul>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className={`block text-center font-semibold py-3 px-4 rounded-full transition-all ${plan.featured?'bg-hbm-purple text-white hover:bg-hbm-purple/90':'bg-gray-100 text-hbm-dark hover:bg-hbm-orange hover:text-white'}`}>
                  {t({en:"Let's Talk",he:'בואו נדבר'},lang)}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="section-padding bg-hbm-cream">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-hbm-dark text-center mb-8">{t({en:"What's included?",he:'מה כולל?'},lang)}</h2>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 bg-hbm-purple/5 p-4 font-bold text-sm">
              <span className="text-hbm-dark">{t({en:'Feature',he:'יכולת'},lang)}</span>
              <span className="text-center text-hbm-dark">DIY (₪650)</span>
              <span className="text-center text-hbm-dark">Full (₪3,000)</span>
            </div>
            {compareRows.map((row,i) => (
              <div key={i} className="grid grid-cols-3 p-4 border-t border-gray-100 text-sm items-center">
                <span className="text-hbm-dark">{t(row.feature,lang)}</span>
                <span className="text-center">{row.diy ? <Check size={18} className="text-hbm-green mx-auto"/> : <X size={18} className="text-red-300 mx-auto"/>}</span>
                <span className="text-center"><Check size={18} className="text-hbm-green mx-auto"/></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="section-padding bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-hbm-dark text-center mb-10">{t({en:'Common Questions.',he:'שאלות נפוצות.'},lang)}</h2>
          <div className="space-y-3">
            {faqItems.map((item,i) => (
              <div key={i} className="bg-hbm-cream rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq===i?null:i)} className="w-full flex items-center justify-between px-6 py-5 text-left">
                  <span className="font-semibold text-hbm-dark">{t(item.q,lang)}</span>
                  <ChevronDown size={20} className={`text-hbm-gray transition-transform ${openFaq===i?'rotate-180':''}`}/>
                </button>
                {openFaq===i && <div className="px-6 pb-5 text-hbm-gray" style={{animation:'fadeIn 0.3s ease-out'}}>{t(item.a,lang)}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Final CTA */}
      <section className="py-20 bg-gradient-dark text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t({en:"You don't need more tools.",he:'אתם לא צריכים עוד כלים.'},lang)}</h2>
          <p className="text-2xl font-bold text-hbm-orange mb-8">{t({en:'You need the right one!',he:'אתם צריכים את הנכון!'},lang)}</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-orange text-lg px-10 py-4 rounded-full inline-flex items-center gap-2">
            {t({en:"Let's Talk",he:'בואו נדבר'},lang)} <ArrowRight size={20}/>
          </a>
        </div>
      </section>
    </div>
  )
}
