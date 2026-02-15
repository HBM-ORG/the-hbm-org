import { useState } from 'react'
import { siteContent } from '../data/content'
import { useI18n, t } from '../i18n/context'
import { getWhatsappUrl } from '../components/Layout'
import { ArrowRight } from 'lucide-react'
import EyebrowBadge from '../components/EyebrowBadge'

const { about, global } = siteContent

const vision = {
  en: 'To create a world where no one is a stranger, by transforming chance encounters into meaningful connections that reshape reality.',
  he: 'ליצור עולם שבו אף אדם אינו זר, על ידי הפיכת מפגשים אקראיים לחיבורים משמעותיים.',
  es: 'Crear un mundo donde nadie sea un extraño, convirtiendo encuentros casuales en conexiones significativas.',
  fr: "Créer un monde où personne n'est un étranger, en transformant les rencontres fortuites en connexions significatives.",
  de: 'Eine Welt schaffen, in der niemand ein Fremder ist, indem wir zufällige Begegnungen in bedeutungsvolle Verbindungen verwandeln.',
  ar: 'خلق عالم لا يكون فيه أي شخص غريباً، من خلال تحويل اللقاءات العشوائية إلى روابط ذات معنى.',
}
const mission = {
  en: 'To develop and operate a social platform, bridging physical and digital realms, that leverages technology, data, and AI to identify, amplify, and harness meaningful interactions, transforming them into authentic and lasting human connections.',
  he: 'לספק לקהילות ולארגונים את הכלים הטכנולוגיים והחוויות ליצירת אינטראקציות אותנטיות, מהירות ומעוררות השראה המעודדות צמיחה אישית ושיתוף פעולה.',
  es: 'Proporcionar a comunidades y organizaciones herramientas tecnológicas para crear interacciones auténticas e inspiradoras.',
  fr: "Fournir aux communautés et organisations les outils pour créer des interactions authentiques et inspirantes.",
  de: 'Gemeinschaften und Organisationen technologische Werkzeuge bereitzustellen für authentische Interaktionen.',
  ar: 'تزويد المجتمعات والمنظمات بالأدوات التكنولوجية لخلق تفاعلات أصيلة وملهمة.',
}

const values = [
  { title: { en: 'Acceptance', he: 'קבלה' }, text: { en: 'Seeing the other as they are, without judgment or comparison. Creating a safe space for dialogue.', he: 'לראות את האחר כמו שהוא, ללא שיפוט או השוואה. יצירת מרחב בטוח לדיאלוג.' } },
  { title: { en: 'Compassion', he: 'חמלה' }, text: { en: "Understanding the other's difficulty and wanting to help. A wish for their well-being.", he: 'הבנת הקושי של האחר ורצון לעזור. איחול לרווחתם.' } },
  { title: { en: 'Positivity', he: 'חיוביות' }, text: { en: 'Choosing to see the good, focusing on complex realities with optimism and solutions.', he: 'בחירה לראות את הטוב, התמקדות במציאות מורכבת עם אופטימיות ופתרונות.' } },
  { title: { en: 'Mental Flexibility', he: 'גמישות מחשבתית' }, text: { en: 'Looking at things from different angles, changing opinions, and adapting to changing situations.', he: 'להסתכל על דברים מזוויות שונות, לשנות דעות ולהסתגל למצבים משתנים.' } },
  { title: { en: 'Responsibility', he: 'אחריות' }, text: { en: 'Committing to actions and words, acting with judgment and respect.', he: 'מחויבות לפעולות ולמילים, פעולה בשיקול דעת וכבוד.' } },
  { title: { en: 'Balance', he: 'איזון' }, text: { en: 'Balancing life domains—work/rest, giving/receiving—to enable a healthy life.', he: 'איזון תחומי חיים - עבודה/מנוחה, נתינה/קבלה - לאפשר חיים בריאים.' } },
  { title: { en: 'Honesty', he: 'כנות' }, text: { en: 'Telling the truth simply and directly, without masks. Building trust through authenticity.', he: 'לספר את האמת בפשטות וישירות, בלי מסכות. בניית אמון דרך אותנטיות.' } },
  { title: { en: 'Generosity', he: 'נדיבות' }, text: { en: 'Giving beyond what is expected—time, knowledge, attention—out of a genuine desire to do good.', he: 'לתת מעבר למצופה - זמן, ידע, תשומת לב - מתוך רצון אמיתי לעשות טוב.' } },
  { title: { en: 'Modesty', he: 'צניעות' }, text: { en: "Recognizing our value without feeling superior. Doing the right thing because it's right, not for credit.", he: 'הכרה בערך שלנו מבלי להרגיש עדיפים. לעשות את הדבר הנכון כי הוא נכון, לא בשביל קרדיט.' } },
  { title: { en: 'Transparency', he: 'שקיפות' }, text: { en: 'Acting with clarity so information and intentions are understood, building trust and sharing the "why".', he: 'פעולה בבהירות כך שמידע וכוונות יובנו, בניית אמון ושיתוף ה"למה".' } },
]

export default function About() {
  const { lang } = useI18n()
  const [flippedCard, setFlippedCard] = useState(null)
  const whatsappUrl = getWhatsappUrl(lang)

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="bg-gradient-hero section-padding text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <EyebrowBadge text="ABOUT US" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] bg-clip-text text-transparent">{t(about.hero.title, lang)}</h1>
          <p className="text-xl text-hbm-gray">{t(about.hero.subtitle, lang)}</p>
        </div>
      </section>

      {/* Big statement */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-hbm-dark mb-8">{t(about.hero.bigText, lang)}</h2>
          <p className="text-lg text-hbm-gray leading-relaxed whitespace-pre-line">{t(about.hero.description, lang)}</p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section id="mission" className="section-padding bg-hbm-cream">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-sm font-bold text-hbm-purple uppercase tracking-widest mb-4">
              {t({ en: 'Our Vision', he: 'החזון שלנו', es: 'Nuestra Visión', fr: 'Notre Vision', de: 'Unsere Vision', ar: 'رؤيتنا' }, lang)}
            </h3>
            <p className="text-lg text-hbm-dark leading-relaxed font-semibold">{t(vision, lang)}</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-sm font-bold text-hbm-orange uppercase tracking-widest mb-4">
              {t({ en: 'Our Mission', he: 'המשימה שלנו', es: 'Nuestra Misión', fr: 'Notre Mission', de: 'Unsere Mission', ar: 'مهمتنا' }, lang)}
            </h3>
            <p className="text-lg text-hbm-dark leading-relaxed">{t(mission, lang)}</p>
          </div>
        </div>
      </section>

      {/* Values — Click to reveal */}
      <section id="values" className="section-padding bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-hbm-dark text-center mb-4">{t(about.values.title, lang)}</h2>
          <p className="text-hbm-gray text-center mb-12">
            {t({ en: 'Click to reveal each value', he: 'לחצו לחשיפת כל ערך', es: 'Haz clic para revelar', fr: 'Cliquez pour révéler', de: 'Klicken zum Aufdecken', ar: 'انقر للكشف' }, lang)}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {values.map((v, i) => (
              <div key={i} onClick={() => setFlippedCard(flippedCard === i ? null : i)}
                   className="cursor-pointer rounded-xl p-5 min-h-[140px] flex items-center justify-center text-center transition-all card-hover"
                   style={{ backgroundColor: flippedCard === i ? '#6160AB' : '#F5F3FF' }}>
                {flippedCard === i ? (
                  <p className="text-white text-xs leading-relaxed">{t(v.text, lang)}</p>
                ) : (
                  <h4 className="font-bold text-hbm-purple text-lg">{t(v.title, lang)}</h4>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="section-padding bg-hbm-cream">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-hbm-dark text-center mb-12">{t(about.team.title, lang)}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {about.team.members.filter(m => m.name && m.image).map((member, i) => (
              <div key={i} className="text-center group">
                <div className="w-28 h-28 mx-auto rounded-full overflow-hidden mb-3 team-photo border-3 border-hbm-purple/20">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold text-hbm-dark text-sm">{member.name}</h4>
                <p className="text-hbm-purple text-xs font-semibold">{t(member.role, lang)}</p>
                {member.nickname && <p className="text-hbm-gray text-xs italic mt-1">"{member.nickname}"</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guiding Principles */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-hbm-dark mb-8">{t(about.guidingPrinciples.title, lang)}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {about.guidingPrinciples.items.map((item, i) => (
              <div key={i} className="bg-hbm-cream rounded-xl p-6 text-left">
                <p className="text-hbm-dark font-semibold">{t(item, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Statement */}
      <section className="section-padding bg-hbm-cream">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xl md:text-2xl text-hbm-dark leading-relaxed whitespace-pre-line">{t(about.closingStatement, lang)}</p>
        </div>
      </section>

    </div>
  )
}
