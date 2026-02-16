import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, t } from '../i18n/context'
import { BookOpen, Play, Calendar, ArrowRight } from 'lucide-react'
import EyebrowBadge from '../components/EyebrowBadge'
import BubbleContainer from '../components/BubbleContainer'
import NextPageBridge from '../components/NextPageBridge'


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
]

export default function Knowledge() {
  const { lang } = useI18n()
  const [activeTab, setActiveTab] = useState('books')

  return (
    <div className="min-h-screen">
      
      {/* Hero & Navigation */}
      <section className="bg-hbm-cream pt-20 pb-12">
          <div className="max-w-4xl mx-auto text-center px-6">
            <div className="mb-6 flex justify-center">
              <EyebrowBadge text="THE WISDOM BASE" />
            </div>
            <h1 className="text-4xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] bg-clip-text text-transparent" style={{letterSpacing:'-2px'}}>
              {t({ en: 'Knowledge', he: 'ידע', es: 'Conocimiento', fr: 'Savoir', de: 'Wissen', ar: 'المعرفة' }, lang)}
            </h1>
            <p className="text-xl text-hbm-gray max-w-2xl mx-auto mb-10">
              {t({ en: 'We believe that thought creates reality. Here are the sources that inspire our movement.', he: 'אנחנו מאמינים שמחשבה יוצרת מציאות. הנה המקורות שמעוררים השראה בתנועה שלנו.', es: 'Creemos que el pensamiento crea la realidad.', fr: 'Nous croyons que la pensée crée la réalité.', de: 'Wir glauben, dass Gedanken Realität schaffen.', ar: 'نؤمن أن الفكر يصنع الواقع.' }, lang)}
            </p>

            {/* Navigation Tabs */}
            <div className="inline-flex flex-wrap justify-center gap-4 bg-white p-2 rounded-full border border-gray-200 shadow-sm">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-6 rounded-full font-semibold text-sm transition-all ${
                    activeTab === tab.id 
                    ? 'bg-hbm-purple text-white shadow-lg' 
                    : 'hover:bg-gray-50 text-hbm-gray'
                  }`}>
                  <tab.icon size={18} />{t(tab.label, lang)}
                </button>
              ))}
            </div>
          </div>
      </section>

      {/* Content Section */}
      <section id="content" className="bg-hbm-cream">
        <BubbleContainer bgColor="white">
          <div className="max-w-6xl mx-auto w-full">
            
            {activeTab === 'books' && (
              <div>
                <h2 className="text-3xl font-bold text-hbm-dark mb-8 text-center">{t({ en: 'Recommended Reading', he: 'קריאה מומלצת', es: 'Lectura Recomendada', fr: 'Lecture Recommandée', de: 'Empfohlene Lektüre', ar: 'قراءة موصى بها' }, lang)}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.map((book, i) => (
                    <div key={i} className="knowledge-card card-hover bg-hbm-light/30 p-6 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm"><BookOpen size={24} className="text-hbm-purple" /></div>
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
                <h2 className="text-3xl font-bold text-hbm-dark mb-8 text-center">{t({ en: 'Videos', he: 'סרטונים', es: 'Videos', fr: 'Vidéos', de: 'Videos', ar: 'فيديوهات' }, lang)}</h2>
                <div className="rounded-2xl overflow-hidden shadow-lg mb-8 max-w-3xl mx-auto">
                  <div className="aspect-video">
                    <iframe src="https://www.youtube.com/embed/R7smYF02Kjo" title="HBM" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                </div>
              </div>
            )}



          </div>
        </BubbleContainer>
      </section>

      {/* Next Page Bridge — To Contact */}
      <NextPageBridge 
        to="/contact"
        eyebrow={{ en: 'Ready to Connect?', he: 'מוכנים להתחבר?' }}
        title={{ en: 'Let\'s Start a Conversation', he: 'בואו נתחיל שיחה' }}
        description={{ en: 'Whether you have a question or just want to say hi, we are here.', he: 'בין אם יש לכם שאלה או סתם רוצים להגיד היי, אנחנו כאן.' }}
        buttonText={{ en: 'Contact Us', he: 'צרו קשר' }}
      />


    </div>
  )
}
