import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, t } from '../i18n/context'
import { 
  Building2, Hotel, GraduationCap, Users, CalendarDays, ArrowRight, Star, 
  MessageCircle, Zap, BarChart3, Heart, TrendingUp, Smile, Globe, Coffee, 
  Briefcase, Layout, Award, Shield, UserPlus, Sparkles 
} from 'lucide-react'

const tabs = [
  { id:'events', icon:CalendarDays, label:{en:'Events',he:'אירועים'},
    headline:{en:'The Engine for Human-Centered Events.',he:'המנוע לאירועים אנושיים.'},
    subtitle:{en:'Turn any gathering into meaningful one-on-one connections that guests actually remember.',he:'הפכו כל התכנסות לחיבורים אישיים שמשתתפים באמת זוכרים.'},
    items:[
      {icon:MessageCircle, title:{en:'Transform Networking',he:'הפכו נטוורקינג לשיחה'},text:{en:'From business-card exchanges to real conversations people talk about.',he:'מהחלפת כרטיסי ביקור לשיחות אמיתיות שאנשים מדברים עליהן.'}},
      {icon:Sparkles, title:{en:'Elevate Your Brand',he:'שדרגו את המותג'},text:{en:'Host events that feel different, thoughtful, and human.',he:'ארחו אירועים שמרגישים אחרת, מחושבים ואנושיים.'}},
      {icon:BarChart3, title:{en:'Measure Real Impact',he:'מדדו השפעה אמיתית'},text:{en:'Track matches, conversations, and relationships created.',he:'עקבו אחרי התאמות, שיחות ומערכות יחסים שנוצרו.'}},
      {icon:Smile, title:{en:'Delight Participants',he:'רגשו את המשתתפים'},text:{en:'No awkward small talk, just guided, safe, 8‑minute flows.',he:'בלי סמול טוק מביך, רק זרימה מונחית ובטוחה של 8 דקות.'}},
      {icon:TrendingUp, title:{en:'Scale Effortlessly',he:'הגדילו ללא מאמץ'},text:{en:'Run 50 or 500 conversations with the same level of care.',he:'הריצו 50 או 500 שיחות באותה רמת תשומת לב.'}},
    ]},
  { id:'companies', icon:Building2, label:{en:'Companies',he:'חברות'},
    headline:{en:'The Engine for Company Culture.',he:'המנוע לתרבות ארגונית.'},
    items:[
      {icon:Layout, title:{en:'Break Silos',he:'שברו סילוסים'},text:{en:'Connect employees across departments who never interact.',he:'חברו עובדים בין מחלקות שלעולם לא נפגשים.'}},
      {icon:Heart, title:{en:'Prevent Burnout',he:'מנעו שחיקה'},text:{en:'Social connection reduces stress and increases resilience.',he:'חיבור חברתי מפחית לחץ ומגביר חוסן.'}},
      {icon:UserPlus, title:{en:'Boost Retention',he:'שפרו שימור'},text:{en:'Employees who feel connected are far less likely to leave.',he:'עובדים שמרגישים מחוברים נוטים הרבה פחות לעזוב.'}},
      {icon:Zap, title:{en:'Spark Innovation',he:'הציתו חדשנות'},text:{en:'Cross-pollination of ideas starts with a conversation.',he:'הפרייה הדדית של רעיונות מתחילה בשיחה.'}},
      {icon:Globe, title:{en:'Inclusive Culture',he:'תרבות מכילה'},text:{en:'Give every voice a seat at the table.',he:'תנו לכל קול מקום בשולחן.'}},
    ]},
  { id:'hotels', icon:Hotel, label:{en:'Hotels',he:'מלונות'},
    headline:{en:'The Engine for Guest Experience.',he:'המנוע לחוויית אורח.'},
    items:[
      {icon:Coffee, title:{en:'Beyond Amenities',he:'מעבר לנוחיות'},text:{en:'Offer meaningful human moments, not just facilities.',he:'הציעו רגעים אנושיים משמעותיים, לא רק מתקנים.'}},
      {icon:Heart, title:{en:'Stronger Loyalty',he:'נאמנות חזקה יותר'},text:{en:'Guests return to places where they feel seen and welcomed.',he:'אורחים חוזרים למקומות שבהם הם מרגישים רצויים.'}},
      {icon:MessageCircle, title:{en:'Community Nights',he:'ערבי קהילה'},text:{en:'Turn quiet evenings into curated connection experiences.',he:'הפכו ערבים שקטים לחוויות חיבור מותאמות.'}},
      {icon:Award, title:{en:'Upsell Experiences',he:'חוויות פרימיום'},text:{en:'Bundle HBM sessions into premium stay packages.',he:'שלבו מפגשי HBM בחבילות אירוח יוקרתיות.'}},
      {icon:Globe, title:{en:'Local Connections',he:'חיבורים מקומיים'},text:{en:'Connect guests with locals, not just with your lobby.',he:'חברו אורחים עם מקומיים, לא רק עם הלובי.'}},
    ]},
  { id:'universities', icon:GraduationCap, label:{en:'Universities',he:'אוניברסיטאות'},
    headline:{en:'The Engine for Campus Belonging.',he:'המנוע לתחושת שייכות בקמפוס.'},
    items:[
      {icon:UserPlus, title:{en:'Support First‑Years',he:'תמיכה בשנה א\''},text:{en:'Ease the transition with guided one-on-one matches.',he:'הקלו על המעבר עם התאמות אישיות מונחות.'}},
      {icon:Briefcase, title:{en:'Cross‑Faculty Bridges',he:'גשרים בין פקולטות'},text:{en:'Help students meet beyond their program or major.',he:'עזרו לסטודנטים להיפגש מעבר לתוכנית הלימודים.'}},
      {icon:Heart, title:{en:'Wellbeing Tool',he:'כלי לרווחה אישית'},text:{en:'Reduce loneliness and isolation with structured connection.',he:'הפחיתו בדידות ובידוד בעזרת חיבור מובנה.'}},
      {icon:GraduationCap, title:{en:'Alumni Engagement',he:'מעורבות בוגרים'},text:{en:'Reconnect graduates with each other and with campus.',he:'חברו מחדש בוגרים אחד לשני ולקמפוס.'}},
      {icon:Globe, title:{en:'Diverse Perspectives',he:'פרספקטיבות מגוונות'},text:{en:'Safe spaces to meet people outside your bubble.',he:'מרחבים בטוחים לפגוש אנשים מחוץ לבועה.'}},
    ]},
  { id:'communities', icon:Users, label:{en:'Communities',he:'קהילות'},
    headline:{en:'The Engine for Human Circles.',he:'המנוע למעגלים אנושיים.'},
    items:[
      {icon:MessageCircle, title:{en:'Deeper Community Nights',he:'ערבי קהילה עמוקים'},text:{en:'Move beyond lectures to real shared stories.',he:'עברו מעבר להרצאות לסיפורים משותפים אמיתיים.'}},
      {icon:Shield, title:{en:'Lower Social Anxiety',he:'הפחתת חרדה חברתית'},text:{en:'8 minutes, clear rules, no pressure to “perform”.',he:'8 דקות, כללים ברורים, בלי לחץ "להופיע".'}},
      {icon:TrendingUp, title:{en:'Keep People Coming Back',he:'החזירו אנשים שוב ושוב'},text:{en:'When connections are real, attendance grows.',he:'כשחיבורים הם אמיתיים, הנוכחות גדלה.'}},
      {icon:Users, title:{en:'Bridge Differences',he:'גשור על פערים'},text:{en:'Create conversations across age, background, and beliefs.',he:'צרו שיחות מעבר לגיל, רקע ואמונות.'}},
      {icon:Layout, title:{en:'Simple to Run',he:'פשוט להפעלה'},text:{en:'Templates, flows, and guidelines built in.',he:'תבניות, זרימות והנחיות מובנות בפנים.'}},
    ]},
]

const testimonials = [
  { quote:{en:'"Increased our retention by 20% in 6 months."',he:'"העלינו את השימור ב-20% בשישה חודשים."'}, name:'Sarah L.', role:{en:'HR Director',he:'מנהלת משאבי אנוש'} },
  { quote:{en:'"Our guests finally talk to each other. The lobby is alive."',he:'"האורחים שלנו סוף סוף מדברים אחד עם השני. הלובי חי."'}, name:'David K.', role:{en:'Hotel GM',he:'מנכ"ל מלון'} },
  { quote:{en:'"Students found study partners within the first week."',he:'"סטודנטים מצאו שותפי לימוד בתוך השבוע הראשון."'}, name:'Prof. Amit R.', role:{en:'Dean of Students',he:'דיקן סטודנטים'} },
]



export default function MeeterWho() {
  const { lang } = useI18n()
  const [activeTab, setActiveTab] = useState('events')
  const currentTab = tabs.find(t => t.id === activeTab)

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-hero section-padding text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-hbm-purple font-semibold text-sm uppercase tracking-widest mb-3">Meeter - Who is it for?</p>
          <h1 className="text-4xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] bg-clip-text text-transparent" style={{letterSpacing:'-2px'}}>{t({en:'Where Does It Meet You?',he:'איפה זה פוגש אותנו?'},lang)}</h1>
          <p className="text-xl text-hbm-gray">{t({en:'Tailored solutions for every sector.',he:'פתרונות מותאמים לכל סקטור.'},lang)}</p>
        </div>
      </section>

      {/* Tabs */}
      <section className="section-padding bg-gradient-to-br from-[#fff7ee] via-white to-[#f7f2ff]">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center gap-2 md:gap-4 mb-16 flex-wrap">
            {tabs.map(tb => (
              <button key={tb.id} onClick={() => setActiveTab(tb.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 shadow-sm
                  ${activeTab===tb.id
                    ? 'bg-gradient-to-r from-[#6160AB] to-[#F07B3C] text-white shadow-lg scale-105'
                    : 'bg-white text-hbm-gray border border-gray-200 hover:border-[#F07B3C]'
                  }`}>
                <tb.icon size={18}/>{t(tb.label,lang)}
              </button>
            ))}
          </div>
          {currentTab && (
            <div key={currentTab.id} style={{animation:'fadeIn 0.4s ease-out'}}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-bold text-hbm-dark mb-4">{t(currentTab.headline,lang)}</h2>
                {currentTab.subtitle && (
                  <p className="text-xl text-hbm-gray max-w-3xl mx-auto">{t(currentTab.subtitle,lang)}</p>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentTab.items.map((item,i) => (
                  <div key={i} 
                    className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[#F07B3C]/20 group"
                    style={{animation:`fadeIn 0.5s ease-out ${i*0.1}s both`, transformOrigin: 'center bottom'}}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#F07B3C]/10 flex items-center justify-center mb-6 text-[#F07B3C] group-hover:scale-110 transition-transform">
                      {item.icon && <item.icon size={24} />}
                    </div>
                    <h3 className="font-bold text-hbm-dark text-xl mb-3">{t(item.title,lang)}</h3>
                    <p className="text-hbm-gray leading-relaxed">{t(item.text,lang)}</p>
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
