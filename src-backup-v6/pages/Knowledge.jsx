import { useState } from 'react'
import { useI18n, t } from '../i18n/context'
import { BookOpen, Play, Calendar, Sparkles } from 'lucide-react'

const books = [
  { title: 'You Were Born Rich', author: 'Bob Proctor', insight: 'Your thoughts create your reality. Most people are programmed for scarcity — reprogram yourself for abundance.' },
  { title: 'Think and Grow Rich', author: 'Napoleon Hill', insight: 'Every achievement starts with a burning desire. The mind is the only thing you have absolute control over.' },
  { title: 'The Power of Your Subconscious Mind', author: 'Joseph Murphy', insight: 'Your subconscious mind works 24/7. Feed it positive thoughts and watch your life transform.' },
  { title: 'Atomic Habits', author: 'James Clear', insight: 'Small changes compound into remarkable results. Focus on systems, not goals.' },
  { title: 'The 7 Habits of Highly Effective People', author: 'Stephen Covey', insight: 'Begin with the end in mind. Seek first to understand, then to be understood.' },
  { title: 'Start With Why', author: 'Simon Sinek', insight: "People don't buy what you do, they buy why you do it. Start with purpose." },
]

const videos = [
  { title: 'The Power of Connection', platform: 'YouTube', url: 'https://www.youtube.com/@TheHBM', description: 'Why 8 minutes can change everything' },
  { title: 'HBM Event Highlights', platform: 'Instagram', url: 'https://www.instagram.com/the__hbm/', description: 'Best moments from our events' },
  { title: "Founder's Story", platform: 'YouTube', url: 'https://www.youtube.com/watch?v=R7smYF02Kjo', description: 'Elad shares the vision behind HBM' },
]

const logoMeaning = {
  title: { en: 'The HBM Logo', he: 'הלוגו של HBM' },
  description: { en: 'Our logo represents the convergence of people — two paths meeting at a point of connection. The vibrant colors symbolize diversity, energy, and the beauty of human interaction. Every element was designed to reflect our core belief: when people connect authentically, extraordinary things happen.', he: 'הלוגו שלנו מייצג את המפגש בין אנשים — שני נתיבים שנפגשים בנקודת חיבור. הצבעים התוססים מסמלים גיוון, אנרגיה, ויופי האינטראקציה האנושית.' },
}

export default function Knowledge() {
  const { lang } = useI18n()
  const [activeTab, setActiveTab] = useState('books')

  const tabs = [
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'videos', label: 'Videos', icon: Play },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'brand', label: 'Our Brand', icon: Sparkles },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-hero section-padding text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-hbm-green font-semibold text-sm uppercase tracking-widest mb-3">The Wisdom Base</p>
          <h1 className="text-4xl md:text-6xl font-bold text-hbm-dark mb-4">
            Knowledge
          </h1>
          <p className="text-xl text-hbm-gray max-w-2xl mx-auto">
            A library of philosophical and practical wisdom. Books, videos, and insights curated by our founders.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-6xl mx-auto px-6 py-4 border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-1 font-semibold text-sm whitespace-nowrap ${
                activeTab === tab.id ? 'tab-active' : 'tab-inactive'
              }`}>
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="section-padding max-w-6xl mx-auto">

        {activeTab === 'books' && (
          <div>
            <h2 className="text-3xl font-bold text-hbm-dark mb-2">Recommended Reading</h2>
            <p className="text-hbm-gray mb-8">Books that shaped our thinking and can shape yours.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book, i) => (
                <div key={i} className="knowledge-card card-hover">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-hbm-light flex items-center justify-center">
                      <BookOpen size={24} className="text-hbm-purple" />
                    </div>
                    <div>
                      <h3 className="font-bold text-hbm-dark text-sm">{book.title}</h3>
                      <p className="text-hbm-gray text-xs">{book.author}</p>
                    </div>
                  </div>
                  <p className="text-hbm-gray text-sm leading-relaxed">💡 {book.insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div>
            <h2 className="text-3xl font-bold text-hbm-dark mb-2">Videos & Reels</h2>
            <p className="text-hbm-gray mb-8">Watch, learn, and get inspired.</p>

            {/* Featured video */}
            <div className="mb-10 rounded-2xl overflow-hidden shadow-lg">
              <div className="aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/R7smYF02Kjo"
                  title="HBM Founder's Story"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {videos.map((video, i) => (
                <a key={i} href={video.url} target="_blank" rel="noopener noreferrer"
                   className="knowledge-card card-hover group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-hbm-orange/10 flex items-center justify-center group-hover:bg-hbm-orange/20 transition">
                      <Play size={20} className="text-hbm-orange" />
                    </div>
                    <span className="text-xs font-semibold text-hbm-purple uppercase">{video.platform}</span>
                  </div>
                  <h3 className="font-bold text-hbm-dark mb-1">{video.title}</h3>
                  <p className="text-hbm-gray text-sm">{video.description}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div>
            <h2 className="text-3xl font-bold text-hbm-dark mb-2">Special Dates</h2>
            <p className="text-hbm-gray mb-8">Content aligned with meaningful moments in the calendar.</p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { date: 'Feb 14', name: "Valentine's Day", theme: 'Authentic Connection', color: 'hbm-orange' },
                { date: 'Mar 20', name: 'International Day of Happiness', theme: 'Joy Through Connection', color: 'hbm-green' },
                { date: 'May 1', name: 'May Day', theme: 'Working Together', color: 'hbm-purple' },
                { date: 'Jun 30', name: 'Social Media Day', theme: 'Real vs Digital Connection', color: 'hbm-orange' },
                { date: 'Sep 21', name: 'International Day of Peace', theme: 'Bridges Not Walls', color: 'hbm-green' },
                { date: 'Nov 13', name: 'World Kindness Day', theme: 'Small Acts, Big Impact', color: 'hbm-purple' },
              ].map((item, i) => (
                <div key={i} className="knowledge-card flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-${item.color}/10 flex flex-col items-center justify-center flex-shrink-0`}>
                    <span className="text-xs font-bold text-hbm-gray">{item.date.split(' ')[0]}</span>
                    <span className="text-lg font-bold text-hbm-dark">{item.date.split(' ')[1]}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-hbm-dark">{item.name}</h3>
                    <p className="text-hbm-gray text-sm">Theme: {item.theme}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'brand' && (
          <div>
            <h2 className="text-3xl font-bold text-hbm-dark mb-2">Our Brand & Philosophy</h2>
            <p className="text-hbm-gray mb-8">The meaning behind everything we do.</p>

            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="flex items-center justify-center">
                <img src="https://www.thehbm.org/wp-content/uploads/2025/06/Logo-and-Tagline.png"
                     alt="HBM Logo" className="max-w-xs w-full" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-hbm-dark mb-4">{t(logoMeaning.title, lang)}</h3>
                <p className="text-hbm-gray leading-relaxed mb-6">{t(logoMeaning.description, lang)}</p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-hbm-purple" />
                    <span className="font-semibold">Purple — Wisdom & Trust</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-hbm-orange" />
                    <span className="font-semibold">Orange — Energy & Warmth</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-hbm-green" />
                    <span className="font-semibold">Green — Growth & Authenticity</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </section>
    </div>
  )
}
