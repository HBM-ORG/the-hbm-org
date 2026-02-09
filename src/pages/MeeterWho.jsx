import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, t } from '../i18n/context'
import { Building2, Hotel, GraduationCap, Users, CalendarDays, ArrowRight, Star } from 'lucide-react'

const tabs = [
  { id:'companies', icon:Building2, label:{en:'Companies',he:'חברות'},
    headline:{en:'The Engine for Company Culture.',he:'המנוע לתרבות ארגונית.'},
    items:[
      {title:{en:'Break Silos',he:'שברו סילוסים'},text:{en:'Connect employees across departments who never interact.',he:'חברו עובדים בין מחלקות שלעולם לא נפגשים.'}},
      {title:{en:'Prevent Burnout',he:'מנעו שחיקה'},text:{en:'Social connection reduces stress and increases resilience.',he:'חיבור חברתי מפחית לחץ ומגביר חוסן.'}},
      {title:{en:'Boost Retention',he:'שפרו שימור'},text:{en:'Employees who feel connected are 3x less likely to leave.',he:'עובדים שמרגישים מחוברים נוטים פי 3 פחות לעזוב.'}},
      {title:{en:'Spark Innovation',he:'הציתו חדשנות'},text:{en:'Cross-pollination of ideas starts with a conversation.',he:'הפרייה הדדית של רעיונות מתחילה בשיחה.'}},
      {title:{en:'Inclusive Culture',he:'תרבות מכילה'},text:{en:'Give every voice a seat at the table.',he:'תנו לכל קול מקום בשולחן.'}},
    ]},
  { id:'hotels', icon:Hotel, label:{en:'Hotels',he:'מלונות'},
    headline:{en:'Turn a Stay into a Story.',he:'הפכו שהייה לסיפור.'},
    items:[
      {title:{en:'Social Hub',he:'מרכז חברתי'},text:{en:'Transform the hotel lobby into a vibrant connection space.',he:'הפכו את הלובי למרחב חיבור תוסס.'}},
      {title:{en:'Guest Connections',he:'חיבורי אורחים'},text:{en:'Tennis partner, business drink, travel buddy — all through one scan.',he:'שותף לטניס, פגישת עסקים, חבר לטיול — הכל בסריקה אחת.'}},
      {title:{en:'Memorable Experiences',he:'חוויות בלתי נשכחות'},text:{en:'Guests remember connections, not thread counts.',he:'אורחים זוכרים חיבורים, לא ספירת חוטים.'}},
    ]},
  { id:'universities', icon:GraduationCap, label:{en:'Universities',he:'אוניברסיטאות'},
    headline:{en:'The Connected Campus.',he:'הקמפוס המחובר.'},
    items:[
      {title:{en:'Solve Loneliness',he:'פתרו בדידות'},text:{en:'Students feel lost in the crowd. Give them a way in.',he:'סטודנטים מרגישים אבודים בקהל. תנו להם דרך פנימה.'}},
      {title:{en:'Study Partners',he:'שותפי לימוד'},text:{en:'Match students with complementary knowledge.',he:'התאימו סטודנטים עם ידע משלים.'}},
      {title:{en:'Mentorship',he:'מנטורינג'},text:{en:'Connect seniors with freshmen for guided support.',he:'חברו בוגרים עם שנה א\' לתמיכה מונחית.'}},
    ]},
  { id:'communities', icon:Users, label:{en:'Communities',he:'קהילות'},
    headline:{en:'From Strangers to Neighbors.',he:'מזרים לשכנים.'},
    items:[
      {title:{en:'Community Invitation',he:'הזמנה קהילתית'},text:{en:'The infrastructure for genuine community connection.',he:'התשתית לחיבור קהילתי אמיתי.'}},
      {title:{en:'Remove Friction',he:'הסירו חיכוך'},text:{en:"People want to connect but don't know how.",he:'אנשים רוצים להתחבר אבל לא יודעים איך.'}},
      {title:{en:'Build Trust',he:'בנו אמון'},text:{en:'Members who talk become members who stay.',he:'חברים שמדברים הופכים לחברים שנשארים.'}},
    ]},
  { id:'events', icon:CalendarDays, label:{en:'Events',he:'אירועים'},
    headline:{en:'Networking That Actually Works.',he:'נטוורקינג שבאמת עובד.'},
    items:[
      {title:{en:'Smart Matching',he:'התאמה חכמה'},text:{en:'Business interest-based matching.',he:'התאמה מבוססת תחומי עניין עסקיים.'}},
      {title:{en:'Guided Format',he:'פורמט מונחה'},text:{en:'Ice-breakers and structure remove the awkwardness.',he:'שוברי קרח ומבנה מסירים את המבוכה.'}},
      {title:{en:'Measurable ROI',he:'ROI מדיד'},text:{en:'Track connections and satisfaction in real time.',he:'עקבו אחרי חיבורים ושביעות רצון בזמן אמת.'}},
    ]},
]

const testimonials = [
  { quote:{en:'"Increased our retention by 20% in 6 months."',he:'"העלינו את השימור ב-20% בשישה חודשים."'}, name:'Sarah L.', role:{en:'HR Director',he:'מנהלת משאבי אנוש'} },
  { quote:{en:'"Our guests finally talk to each other. The lobby is alive."',he:'"האורחים שלנו סוף סוף מדברים אחד עם השני. הלובי חי."'}, name:'David K.', role:{en:'Hotel GM',he:'מנכ"ל מלון'} },
  { quote:{en:'"Students found study partners within the first week."',he:'"סטודנטים מצאו שותפי לימוד בתוך השבוע הראשון."'}, name:'Prof. Amit R.', role:{en:'Dean of Students',he:'דיקן סטודנטים'} },
]

const partners = ['Dale Carnegie','Gav Yam','Reichman University','Redler Technologies','Points of You','Herbert Samuel','Shamir Medical','IAC']

export default function MeeterWho() {
  const { lang } = useI18n()
  const [activeTab, setActiveTab] = useState('companies')
  const currentTab = tabs.find(t => t.id === activeTab)

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-hero section-padding text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-hbm-purple font-semibold text-sm uppercase tracking-widest mb-3">Meeter — Who is it for?</p>
          <h1 className="text-4xl md:text-7xl font-bold text-hbm-dark mb-4" style={{letterSpacing:'-2px'}}>{t({en:'Where Does It Meet Us?',he:'איפה זה פוגש אותנו?'},lang)}</h1>
          <p className="text-xl text-hbm-gray">{t({en:'Tailored solutions for every sector.',he:'פתרונות מותאמים לכל סקטור.'},lang)}</p>
        </div>
      </section>

      {/* Tabs */}
      <section className="section-padding bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center gap-2 md:gap-3 mb-12 flex-wrap">
            {tabs.map(tb => (
              <button key={tb.id} onClick={() => setActiveTab(tb.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all ${activeTab===tb.id?'bg-hbm-orange text-white shadow-lg scale-105':'bg-gray-100 text-hbm-gray hover:bg-gray-200'}`}>
                <tb.icon size={18}/>{t(tb.label,lang)}
              </button>
            ))}
          </div>
          {currentTab && (
            <div key={currentTab.id} style={{animation:'fadeIn 0.4s ease-out'}}>
              <h2 className="text-3xl md:text-4xl font-bold text-hbm-dark text-center mb-10">{t(currentTab.headline,lang)}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentTab.items.map((item,i) => (
                  <div key={i} className="bg-hbm-cream rounded-2xl p-6 card-hover" style={{animation:`fadeIn 0.5s ease-out ${i*0.1}s both`}}>
                    <h3 className="font-bold text-hbm-dark text-lg mb-2">{t(item.title,lang)}</h3>
                    <p className="text-hbm-gray">{t(item.text,lang)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Success Stories */}
      <section className="section-padding bg-hbm-cream">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-hbm-purple mb-10">{t({en:'Real Impact.',he:'השפעה אמיתית.'},lang)}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((tm,i) => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 card-hover">
                <div className="flex gap-1 mb-4 justify-center">{[...Array(5)].map((_,j)=><Star key={j} size={16} className="text-hbm-orange fill-hbm-orange"/>)}</div>
                <p className="text-hbm-dark font-semibold mb-4 italic">{t(tm.quote,lang)}</p>
                <p className="text-sm font-bold text-hbm-dark">{tm.name}</p>
                <p className="text-xs text-hbm-gray">{t(tm.role,lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By — Marquee */}
      <section className="py-10 bg-white overflow-hidden">
        <p className="text-center text-hbm-gray text-xs uppercase tracking-widest mb-6 font-semibold">{t({en:'Trusted By',he:'נותנים בנו אמון'},lang)}</p>
        <div className="marquee-track">
          <div className="marquee-content">
            {[...partners,...partners].map((p,i) => <span key={i} className="mx-8 text-sm font-bold text-hbm-dark/30 whitespace-nowrap">{p}</span>)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-purple text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">{t({en:'See what the platform can do',he:'ראו מה הפלטפורמה יכולה'},lang)}</h2>
          <Link to="/meeter/features" className="btn-orange text-lg px-10 py-4 rounded-full inline-flex items-center gap-2 hover:scale-105 transition-transform">
            {t({en:'Explore Features',he:'גלו יכולות'},lang)} <ArrowRight size={20}/>
          </Link>
        </div>
      </section>
    </div>
  )
}
