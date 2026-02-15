import { useState } from 'react'
import { useI18n, t } from '../i18n/context'
import { BookOpen, Play, Calendar, Sparkles } from 'lucide-react'
import EyebrowBadge from '../components/EyebrowBadge'

const books = [
  { title: 'You Were Born Rich', author: 'Bob Proctor', insight: { en: 'Your thoughts create your reality. Reprogram yourself for abundance.', he: 'המחשבות שלך יוצרות את המציאות שלך. תכנת מחדש את עצמך לשפע.' } },
  { title: 'Think and Grow Rich', author: 'Napoleon Hill', insight: { en: 'Every achievement starts with a burning desire. The mind is your greatest asset.', he: 'כל הישג מתחיל ברצון בוער. המוח הוא הנכס הגדול ביותר שלך.' } },
  { title: 'The Power of Your Subconscious Mind', author: 'Joseph Murphy', insight: { en: 'Your subconscious works 24/7. Feed it positive thoughts.', he: 'התת-מודע עובד 24/7. תזינו אותו עם מחשבות חיוביות.' } },
  { title: 'Atomic Habits', author: 'James Clear', insight: { en: 'Small changes compound into remarkable results. Focus on systems.', he: 'שינויים קטנים מצטברים לתוצאות מדהימות. התמקדו במערכות.' } },
  { title: 'The 7 Habits', author: 'Stephen Covey', insight: { en: 'Begin with the end in mind. Seek first to understand.', he: 'התחילו עם הסוף בראש. חפשו קודם להבין.' } },
  { title: 'Start With Why', author: 'Simon Sinek', insight: { en: "People don't buy what you do, they buy why you do it.", he: 'אנשים לא קונים מה שאתם עושים, הם קונים למה אתם עושים את זה.' } },
]

const tabs = [
  { id: 'books', label: { en: 'Books', he: 'ספרים', es: 'Libros', fr: 'Livres', de: 'Bücher', ar: 'كتب' }, icon: BookOpen },
  { id: 'videos', label: { en: 'Videos', he: 'סרטונים', es: 'Videos', fr: 'Vidéos', de: 'Videos', ar: 'فيديو' }, icon: Play },
  { id: 'brand', label: { en: 'Our Logo', he: 'הלוגו שלנו', es: 'Nuestro Logo', fr: 'Notre Logo', de: 'Unser Logo', ar: 'شعارنا' }, icon: Sparkles },
]

export default function Knowledge() {
  const { lang } = useI18n()
  const [activeTab, setActiveTab] = useState('books')

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-hero section-padding text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <EyebrowBadge text="THE WISDOM BASE" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-hbm-dark mb-4">
            {t({ en: 'Knowledge', he: 'ידע', es: 'Conocimiento', fr: 'Savoir', de: 'Wissen', ar: 'المعرفة' }, lang)}
          </h1>
          <p className="text-xl text-hbm-gray max-w-2xl mx-auto">
            {t({ en: 'We believe that thought creates reality. Here are the sources that inspire our movement.', he: 'אנחנו מאמינים שמחשבה יוצרת מציאות. הנה המקורות שמעוררים השראה בתנועה שלנו.', es: 'Creemos que el pensamiento crea la realidad.', fr: 'Nous croyons que la pensée crée la réalité.', de: 'Wir glauben, dass Gedanken Realität schaffen.', ar: 'نؤمن أن الفكر يصنع الواقع.' }, lang)}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-4 border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-1 font-semibold text-sm whitespace-nowrap ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}`}>
              <tab.icon size={18} />{t(tab.label, lang)}
            </button>
          ))}
        </div>
      </section>

      <section id="books" className="section-padding max-w-6xl mx-auto">
        {activeTab === 'books' && (
          <div>
            <h2 className="text-3xl font-bold text-hbm-dark mb-8">{t({ en: 'Recommended Reading', he: 'קריאה מומלצת', es: 'Lectura Recomendada', fr: 'Lecture Recommandée', de: 'Empfohlene Lektüre', ar: 'قراءة موصى بها' }, lang)}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book, i) => (
                <div key={i} className="knowledge-card card-hover">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-hbm-light flex items-center justify-center"><BookOpen size={24} className="text-hbm-purple" /></div>
                    <div><h3 className="font-bold text-hbm-dark text-sm">{book.title}</h3><p className="text-hbm-gray text-xs">{book.author}</p></div>
                  </div>
                  <p className="text-hbm-gray text-sm">💡 {t(book.insight, lang)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div>
            <h2 className="text-3xl font-bold text-hbm-dark mb-8">{t({ en: 'Videos', he: 'סרטונים', es: 'Videos', fr: 'Vidéos', de: 'Videos', ar: 'فيديوهات' }, lang)}</h2>
            <div className="rounded-2xl overflow-hidden shadow-lg mb-8">
              <div className="aspect-video">
                <iframe src="https://www.youtube.com/embed/R7smYF02Kjo" title="HBM" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'brand' && (
          <div>
            <h2 className="text-3xl font-bold text-hbm-dark mb-8">{t({ en: 'Our Logo', he: 'הלוגו שלנו', es: 'Nuestro Logo', fr: 'Notre Logo', de: 'Unser Logo', ar: 'شعارنا' }, lang)}</h2>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="flex justify-center">
                <img src="https://www.thehbm.org/wp-content/uploads/2025/06/Logo-and-Tagline.png" alt="HBM Logo" className="max-w-xs w-full" />
              </div>
              <div>
                <p className="text-hbm-gray leading-relaxed mb-6">
                  {t({ en: 'Our logo represents two figures connecting—bringing the human element back to the center of the circle. The colors (Orange, Green, Purple) symbolize energy, growth, and depth.', he: 'הלוגו שלנו מייצג שתי דמויות שמתחברות — מחזיר את האלמנט האנושי למרכז המעגל. הצבעים (כתום, ירוק, סגול) מסמלים אנרגיה, צמיחה ועומק.', es: 'Nuestro logo representa dos figuras conectándose. Los colores simbolizan energía, crecimiento y profundidad.', fr: 'Notre logo représente deux figures qui se connectent. Les couleurs symbolisent énergie, croissance et profondeur.', de: 'Unser Logo zeigt zwei sich verbindende Figuren. Die Farben symbolisieren Energie, Wachstum und Tiefe.', ar: 'يمثل شعارنا شخصيتين تتواصلان. الألوان ترمز للطاقة والنمو والعمق.' }, lang)}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-hbm-orange" /><span className="font-semibold text-sm">{t({ en: 'Orange — Energy & Warmth', he: 'כתום — אנרגיה וחום', es: 'Naranja — Energía', fr: 'Orange — Énergie', de: 'Orange — Energie', ar: 'برتقالي — طاقة' }, lang)}</span></div>
                  <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-hbm-green" /><span className="font-semibold text-sm">{t({ en: 'Green — Growth & Authenticity', he: 'ירוק — צמיחה ואותנטיות', es: 'Verde — Crecimiento', fr: 'Vert — Croissance', de: 'Grün — Wachstum', ar: 'أخضر — نمو' }, lang)}</span></div>
                  <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-hbm-purple" /><span className="font-semibold text-sm">{t({ en: 'Purple — Wisdom & Trust', he: 'סגול — חוכמה ואמון', es: 'Púrpura — Sabiduría', fr: 'Violet — Sagesse', de: 'Lila — Weisheit', ar: 'بنفسجي — حكمة' }, lang)}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
