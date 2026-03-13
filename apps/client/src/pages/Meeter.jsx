import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, t } from '../i18n/context'
import { siteContent } from '../data/content'
import { getWhatsappUrl } from '../components/Layout'
import BubbleContainer from '../components/BubbleContainer'
import { ArrowRight, Building2, Users, CalendarDays, GraduationCap, Zap, Globe, BarChart3, MessageCircle, ChevronDown } from 'lucide-react'
import Footer from '../components/Footer'

const { meeter } = siteContent

const tabs = [
  {
    id: 'orgs', icon: Building2,
    label: { en: 'Organizations', he: 'ארגונים', es: 'Organizaciones', fr: 'Organisations', de: 'Organisationen', ar: 'المؤسسات' },
    pain: { en: 'Silos & disconnect in remote work. Employees feel isolated, hurting culture and productivity.', he: 'סילוסים וניתוק בעבודה מרחוק. עובדים מרגישים מבודדים, פוגע בתרבות ובפרודוקטיביות.', es: 'Silos y desconexión. Empleados aislados.', fr: 'Silos et déconnexion. Employés isolés.', de: 'Silos und Isolation in Remote-Arbeit.', ar: 'العزلة والانفصال في العمل عن بُعد.' },
    gain: { en: 'Cross-department bonding & team culture. Strengthen teamwork and belonging inside the company.', he: 'חיבור בין מחלקות ותרבות צוותית. חיזוק עבודת צוות ושייכות בתוך החברה.', es: 'Vínculos entre departamentos y cultura de equipo.', fr: 'Liens inter-départements et culture d\'équipe.', de: 'Abteilungsübergreifende Bindung und Teamkultur.', ar: 'روابط بين الأقسام وثقافة الفريق.' },
  },
  {
    id: 'communities', icon: Users,
    label: { en: 'Communities', he: 'קהילות', es: 'Comunidades', fr: 'Communautés', de: 'Gemeinschaften', ar: 'المجتمعات' },
    pain: { en: "Members don't know each other. Engagement drops when people are strangers.", he: 'החברים לא מכירים אחד את השני. המעורבות יורדת כשאנשים זרים.', es: 'Los miembros no se conocen entre sí.', fr: 'Les membres ne se connaissent pas.', de: 'Mitglieder kennen sich nicht.', ar: 'الأعضاء لا يعرفون بعضهم.' },
    gain: { en: '"Invitation to Connect" – removing social friction. Turn a crowd into a community.', he: '"הזמנה להתחבר" – הסרת חיכוך חברתי. הפכו קהל לקהילה.', es: '"Invitación a conectar" – eliminar la fricción social.', fr: '"Invitation à se connecter" – supprimer les frictions.', de: '"Einladung zur Verbindung" – soziale Barrieren abbauen.', ar: '"دعوة للتواصل" - إزالة الحواجز الاجتماعية.' },
  },
  {
    id: 'events', icon: CalendarDays,
    label: { en: 'Events & Conferences', he: 'אירועים וכנסים', es: 'Eventos y Conferencias', fr: 'Événements', de: 'Events & Konferenzen', ar: 'الفعاليات والمؤتمرات' },
    pain: { en: 'Awkward networking. People stand in corners checking phones.', he: 'נטוורקינג מביך. אנשים עומדים בפינות ובודקים טלפונים.', es: 'Networking incómodo.', fr: 'Networking gênant.', de: 'Peinliches Networking.', ar: 'تواصل محرج.' },
    gain: { en: 'Smart matching based on business interests. Curated connections, not random encounters.', he: 'התאמה חכמה מבוססת תחומי עניין עסקיים. חיבורים מאוצרים, לא מפגשים אקראיים.', es: 'Matching inteligente por intereses.', fr: 'Matching intelligent par intérêts.', de: 'Smart Matching nach Interessen.', ar: 'مطابقة ذكية حسب الاهتمامات.' },
  },
  {
    id: 'universities', icon: GraduationCap,
    label: { en: 'Universities', he: 'אוניברסיטאות', es: 'Universidades', fr: 'Universités', de: 'Universitäten', ar: 'الجامعات' },
    pain: { en: 'Students feel lost in the crowd. Hard to find study partners or mentors.', he: 'סטודנטים מרגישים אבודים בקהל. קשה למצוא שותפי לימוד או מנטורים.', es: 'Estudiantes perdidos en la multitud.', fr: 'Étudiants perdus dans la foule.', de: 'Studierende fühlen sich verloren.', ar: 'الطلاب يشعرون بالضياع في الحشود.' },
    gain: { en: 'Mentorship & study partners. Connect students beyond the classroom.', he: 'מנטורינג ושותפי לימוד. חיבור סטודנטים מעבר לכיתה.', es: 'Mentoría y compañeros de estudio.', fr: 'Mentorat et partenaires d\'étude.', de: 'Mentoring & Studienpartner.', ar: 'إرشاد وشركاء دراسة.' },
  },
]

const features = [
  { icon: Zap, title: { en: 'Smart Matching Algorithm', he: 'אלגוריתם התאמה חכם', es: 'Algoritmo Inteligente', fr: 'Algorithme Intelligent', de: 'Smart-Matching', ar: 'خوارزمية ذكية' }, text: { en: 'Interest-based matching finds your perfect conversation partner.', he: 'התאמה מבוססת תחומי עניין מוצאת את בן השיחה המושלם.', es: 'Emparejamiento basado en intereses.', fr: 'Correspondance basée sur les intérêts.', de: 'Interessenbasiertes Matching.', ar: 'مطابقة حسب الاهتمامات.' } },
  { icon: Globe, title: { en: 'No App Download Required', he: 'בלי הורדת אפליקציה', es: 'Sin Descarga', fr: 'Sans Téléchargement', de: 'Kein Download', ar: 'بدون تحميل' }, text: { en: 'Accessible instantly via any browser. Just scan and connect.', he: 'נגיש מיידית דרך כל דפדפן. פשוט סרקו והתחברו.', es: 'Accesible al instante desde cualquier navegador.', fr: 'Accessible instantanément via navigateur.', de: 'Sofort über den Browser zugänglich.', ar: 'متاح فوراً عبر أي متصفح.' } },
  { icon: BarChart3, title: { en: 'Live Event Dashboard', he: 'לוח בקרה בזמן אמת', es: 'Panel en Vivo', fr: 'Tableau de Bord', de: 'Live-Dashboard', ar: 'لوحة بيانات حية' }, text: { en: 'View real-time stats on matches and connections during the event.', he: 'צפו בסטטיסטיקות בזמן אמת על התאמות וחיבורים באירוע.', es: 'Estadísticas en tiempo real de conexiones.', fr: 'Statistiques en temps réel.', de: 'Echtzeit-Statistiken.', ar: 'إحصائيات فورية للفعاليات.' } },
  { icon: MessageCircle, title: { en: 'Curated Ice-Breakers', he: 'שוברי קרח מותאמים', es: 'Rompehielos', fr: 'Brise-Glace', de: 'Ice-Breaker', ar: 'كسر الجليد' }, text: { en: 'Custom questions to kick off the conversation with ease.', he: 'שאלות מותאמות להתחלת שיחה בקלות.', es: 'Preguntas personalizadas para iniciar la conversación.', fr: 'Questions personnalisées pour lancer la conversation.', de: 'Individuelle Fragen für den Gesprächseinstieg.', ar: 'أسئلة مخصصة لبدء المحادثة بسهولة.' } },
]

const pricing = [
  { tier: { en: '10 Events Card', he: 'כרטיסיית 10 אירועים' }, price: '10,800', period: { en: 'total', he: 'סה"כ' }, details: { en: 'No staff included', he: 'ללא צוות' }, featured: false },
  { tier: { en: 'Annual', he: 'שנתי' }, price: '1,900', period: { en: '/month', he: '/חודש' }, details: { en: 'Unlimited events, No staff', he: 'אירועים ללא הגבלה, ללא צוות' }, featured: true },
  { tier: { en: '6-Month', he: '6 חודשים' }, price: '2,200', period: { en: '/month', he: '/חודש' }, details: { en: 'Unlimited events, No staff', he: 'אירועים ללא הגבלה, ללא צוות' }, featured: false },
  { tier: { en: 'Full Package', he: 'חבילה מלאה' }, price: '3,000', period: { en: 'one-time', he: 'חד פעמי' }, details: { en: 'No commitment. 2 staff members.', he: 'ללא התחייבות. כולל 2 אנשי צוות.' }, featured: false },
  { tier: { en: 'DIY / Custom', he: 'עשה זאת בעצמך' }, price: '650', period: { en: 'starting at', he: 'החל מ-' }, details: { en: 'No commitment, No staff', he: 'ללא התחייבות, ללא צוות' }, featured: false },
]

export default function Meeter() {
  const { lang } = useI18n()
  const [activeTab, setActiveTab] = useState('orgs')
  const [openFaq, setOpenFaq] = useState(null)
  const whatsappUrl = getWhatsappUrl(lang)
  const currentTab = tabs.find(tb => tb.id === activeTab)

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="bg-hbm-cream">
        <BubbleContainer bgColor="#FAF9F5">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-hbm-purple font-semibold text-sm uppercase tracking-widest mb-3">The Connection Engine</p>
            <h1 className="text-4xl md:text-6xl font-bold text-hbm-dark mb-4">
              {t({ en: 'The Operating System for Human Connection', he: 'מערכת ההפעלה לחיבור אנושי', es: 'El Sistema Operativo para la Conexión Humana', fr: "Le Système d'Exploitation de la Connexion Humaine", de: 'Das Betriebssystem für menschliche Verbindung', ar: 'نظام التشغيل للتواصل الإنساني' }, lang)}
            </h1>
            <p className="text-xl text-hbm-gray max-w-2xl mx-auto mb-8">
              {t({ en: 'No apps. No downloads. Just scan and connect.', he: 'בלי אפליקציות. בלי הורדות. פשוט סרקו והתחברו.', es: 'Sin apps. Sin descargas. Escanea y conecta.', fr: 'Pas d\'apps. Scannez et connectez.', de: 'Keine Apps. Scannen und verbinden.', ar: 'بدون تطبيقات. امسح وتواصل.' }, lang)}
            </p>
          </div>
        </BubbleContainer>
      </section>

      {/* Who is it for — Tabs */}
      <section className="bg-hbm-cream">
        <BubbleContainer bgColor="white">
          <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-hbm-dark text-center mb-10">
              {t({ en: 'Who is it for?', he: 'למי זה מתאים?', es: '¿Para quién es?', fr: 'Pour qui ?', de: 'Für wen?', ar: 'لمن هذا؟' }, lang)}
            </h2>

            {/* Tab bar */}
            <div className="flex justify-center gap-2 md:gap-4 mb-10 flex-wrap">
              {tabs.map(tb => (
                <button key={tb.id} onClick={() => setActiveTab(tb.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all ${
                    activeTab === tb.id
                      ? 'bg-hbm-purple text-white shadow-lg'
                      : 'bg-gray-100 text-hbm-gray hover:bg-gray-200'
                  }`}>
                  <tb.icon size={18} />
                  {t(tb.label, lang)}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {currentTab && (
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-hbm-orange/5 rounded-2xl p-8 border-l-4 border-hbm-orange">
                  <h3 className="font-bold text-hbm-orange mb-3">{t({ en: 'The Pain', he: 'הכאב', es: 'El Problema', fr: 'Le Problème', de: 'Das Problem', ar: 'المشكلة' }, lang)}</h3>
                  <p className="text-hbm-dark leading-relaxed">{t(currentTab.pain, lang)}</p>
                </div>
                <div className="bg-hbm-green/5 rounded-2xl p-8 border-l-4 border-hbm-green">
                  <h3 className="font-bold text-hbm-green mb-3">{t({ en: 'The Gain', he: 'הרווח', es: 'La Ganancia', fr: 'Le Gain', de: 'Der Gewinn', ar: 'الفائدة' }, lang)}</h3>
                  <p className="text-hbm-dark leading-relaxed">{t(currentTab.gain, lang)}</p>
                </div>
              </div>
            )}
          </div>
        </BubbleContainer>
      </section>

      {/* Features Grid */}
      <section className="bg-hbm-cream">
        <BubbleContainer bgColor="#FAF9F5">
          <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-hbm-dark text-center mb-12">
              {t({ en: 'Features', he: 'יכולות', es: 'Características', fr: 'Fonctionnalités', de: 'Funktionen', ar: 'الميزات' }, lang)}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feat, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 card-hover text-center shadow-lg">
                  <div className="w-14 h-14 rounded-full bg-hbm-purple/10 flex items-center justify-center mx-auto mb-4">
                    <feat.icon size={28} className="text-hbm-purple" />
                  </div>
                  <h3 className="font-bold text-hbm-dark mb-2">{t(feat.title, lang)}</h3>
                  <p className="text-hbm-gray text-sm">{t(feat.text, lang)}</p>
                </div>
              ))}
            </div>
          </div>
        </BubbleContainer>
      </section>

      {/* Pricing — 5 columns */}
      <section className="bg-hbm-cream">
        <BubbleContainer bgColor="white">
          <div className="max-w-7xl mx-auto w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-hbm-dark text-center mb-4">
              {t({ en: 'Pricing', he: 'תמחור', es: 'Precios', fr: 'Tarifs', de: 'Preise', ar: 'الأسعار' }, lang)}
            </h2>
            <p className="text-hbm-gray text-center mb-12">
              {t({ en: 'All prices in NIS (₪)', he: 'כל המחירים בשקלים (₪)', es: 'Todos los precios en NIS (₪)', fr: 'Tous les prix en NIS (₪)', de: 'Alle Preise in NIS (₪)', ar: 'جميع الأسعار بالشيكل (₪)' }, lang)}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {pricing.map((plan, i) => (
                <div key={i} className={`rounded-2xl p-5 border-2 transition-all ${plan.featured ? 'border-hbm-purple bg-hbm-light shadow-lg scale-105' : 'border-gray-200 bg-white hover:border-hbm-purple'}`}>
                  {plan.featured && <span className="inline-block bg-hbm-purple text-white text-xs font-bold px-3 py-1 rounded-full mb-3">{t({ en: 'Popular', he: 'פופולרי', es: 'Popular', fr: 'Populaire', de: 'Beliebt', ar: 'شائع' }, lang)}</span>}
                  <h3 className="font-bold text-hbm-dark text-sm mb-1">{t(plan.tier, lang)}</h3>
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-hbm-dark">₪{plan.price}</span>
                    <span className="text-hbm-gray text-xs ml-1">{t(plan.period, lang)}</span>
                  </div>
                  <p className="text-hbm-gray text-xs mb-4">{t(plan.details, lang)}</p>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                     className={`block text-center text-sm font-semibold py-2 px-4 rounded-full transition ${plan.featured ? 'bg-hbm-purple text-white hover:bg-hbm-purple/90' : 'bg-gray-100 text-hbm-dark hover:bg-gray-200'}`}>
                    {t({ en: "Let's talk", he: 'בואו נדבר', es: 'Hablemos', fr: 'Parlons', de: 'Kontakt', ar: 'لنتحدث' }, lang)}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </BubbleContainer>
      </section>

      {/* FAQ */}
      <section className="bg-hbm-cream">
        <BubbleContainer bgColor="#FAF9F5">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-3xl font-bold text-hbm-dark text-center mb-10">FAQ</h2>
            <div className="space-y-3">
              {meeter.items.map((item, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left">
                    <span className="font-semibold text-hbm-dark">{t(item.question, lang)}</span>
                    <ChevronDown size={20} className={`text-hbm-gray transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && <div className="px-6 pb-5 text-hbm-gray">{t(item.answer, lang)}</div>}
                </div>
              ))}
            </div>
          </div>
        </BubbleContainer>
      </section>

      {/* Next Page Bridge — To About Us */}
      <section className="bg-hbm-cream">
        <BubbleContainer bgColor="white">
          <div className="max-w-4xl mx-auto text-center bg-gradient-purple text-white p-12 md:p-16 rounded-[48px] shadow-2xl">
            <p className="text-sm uppercase tracking-widest opacity-70 mb-3">{t({ en: 'Who Are We?', he: 'מי אנחנו?' }, lang)}</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              {t({ en: 'Meet The People Behind HBM', he: 'הכירו את האנשים מאחורי HBM' }, lang)}
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              {t({ en: 'A team of real humans dedicated to bringing people together.', he: 'צוות של בני אדם אמיתיים המוקדשים לחיבור אנשים.' }, lang)}
            </p>
            <Link to="/about" className="btn-orange text-lg px-10 py-4 rounded-full inline-flex items-center gap-2">
              {t({ en: 'Learn More', he: 'למידע נוסף' }, lang)} <ArrowRight size={20} />
            </Link>
          </div>
        </BubbleContainer>
      </section>

      <Footer />
    </div>
  )
}
