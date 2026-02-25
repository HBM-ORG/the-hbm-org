import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n, t } from '../i18n/context'
import { Sparkles } from 'lucide-react'
import { siteContent } from '../data/content'

export default function SmartMatchingZone() {
  const navigate = useNavigate()
  const { lang } = useI18n()
  const [selectedInterests, setSelectedInterests] = useState([])
  const [activeCategory, setActiveCategory] = useState('hobbies')

  const categories = {
    hobbies: {
      label: { en: 'Hobbies', he: 'תחביבים' },
      activeColor: 'bg-hbm-purple border-hbm-purple text-white shadow-[#6160AB]/30',
      items: [
        { en: 'Art', he: 'אמנות' },
        { en: 'Music', he: 'מוזיקה' },
        { en: 'Sport', he: 'ספורט' },
        { en: 'Travel', he: 'טיולים' },
        { en: 'Food & Cooking', he: 'אוכל ובישול' },
        { en: 'Entrepreneurship', he: 'יזמות' },
        { en: 'Movies & TV', he: 'סרטים וטלוויזיה' },
        { en: 'Books', he: 'ספרים' },
        { en: 'Gaming', he: 'גיימינג' },
        { en: 'Fashion', he: 'אופנה' },
        { en: 'Family', he: 'משפחה' },
      ]
    },
    role: {
      label: { en: 'Role', he: 'תפקיד' },
      activeColor: 'bg-[#73C154] border-[#73C154] text-white shadow-[#73C154]/30',
      items: [
        { en: 'CEO / Founder', he: 'מנכ"ל / מייסד' },
        { en: 'Developer', he: 'מפתח' },
        { en: 'Designer', he: 'מעצב' },
        { en: 'Marketing', he: 'שיווק' },
        { en: 'Product Manager', he: 'מנהל מוצר' },
        { en: 'Sales', he: 'מכירות' },
        { en: 'Management', he: 'ניהול' },
        { en: 'Creative', he: 'קריאייטיב' },
      ]
    },
    identity: {
      label: { en: 'Identity', he: 'זהות' },
      activeColor: 'bg-hbm-orange border-hbm-orange text-white shadow-[#F07B3C]/30',
      items: [
        { en: 'Coffee Lover', he: 'חובב קפה' },
        { en: 'Night Owl', he: 'איש לילה' },
        { en: 'Early Bird', he: 'מקיץ מוקדם' },
        { en: 'Pet Parent', he: 'הורה לחיות' },
        { en: 'Optimist', he: 'אופטימי' },
        { en: 'Techie', he: 'טכנולוגי' },
        { en: 'Foodie', he: 'פודי' },
        { en: 'Creator', he: 'יוצר' },
        { en: 'Dog Person', he: 'אוהב כלבים' },
        { en: 'Bookworm', he: 'תולעת ספרים' },
        { en: 'Nature Lover', he: 'אוהב טבע' },
        { en: 'Visionary', he: 'בעל חזון' },
      ]
    }
  }

  const toggleInterest = (interestEn) => {
    setSelectedInterests((prev) =>
      prev.includes(interestEn)
        ? prev.filter((i) => i !== interestEn)
        : [...prev, interestEn]
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl p-6 md:p-10 border border-gray-100 flex flex-col items-center">
        {/* Header */}
        <div className="mb-6 md:mb-8 text-center w-full">
          <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
            <Sparkles size={16} className="text-[#6160AB]" />
            <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest font-['Sora']">
              SMART ALGORITHM
            </span>
          </div>
          <h3 className="text-2xl md:text-[32px] font-black text-hbm-dark mb-1 md:mb-2 font-['Sora'] tracking-tight">
            {t({ en: 'Select Your Interests', he: 'בחרו את תחומי העניין' }, lang)}
          </h3>
          <p className="text-[12px] md:text-[14px] text-gray-500 font-medium font-['Sora']">
            {t({ en: "We'll match you with someone who shares your vibe", he: 'נתאים אתכם עם מישהו שחולק את האווירה שלכם' }, lang)}
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex bg-[#F5F6FE] p-1 md:p-1.5 rounded-xl md:rounded-2xl mb-6 md:mb-8 w-fit">
          {Object.entries(categories).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 font-['Sora'] ${
                activeCategory === key
                  ? 'bg-white text-hbm-dark shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t(cat.label, lang)}
            </button>
          ))}
        </div>

        {/* Interests Grid */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12 min-h-[120px] md:min-h-[160px] content-start">
          {categories[activeCategory].items.map((item, idx) => {
            const isSelected = selectedInterests.includes(item.en)
            return (
              <button
                key={idx}
                onClick={() => toggleInterest(item.en)}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-[11px] md:text-[13px] border-2 transition-all duration-300 font-['Sora'] whitespace-nowrap min-w-[100px] md:min-w-[140px] text-center ${
                  isSelected
                    ? `${categories[activeCategory].activeColor} scale-105 shadow-lg`
                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:text-gray-600'
                }`}
              >
                {t(item, lang)}
              </button>
            )
          })}
        </div>

        {/* CTA Button */}
        <button 
          onClick={() => navigate(siteContent.global.ctaUrl)}
          className="w-full bg-gradient-to-r from-[#6160AB] to-[#F07B3C] text-white font-black py-4 md:py-5 px-6 md:px-8 rounded-2xl md:rounded-3xl transition-all duration-300 hover:scale-[1.02] shadow-xl flex items-center justify-center gap-3 group font-['Sora'] uppercase tracking-widest text-sm"
        >
          <span>
            {t({ en: 'Start Your 8 Minutes', he: 'התחילו את 8 הדקות שלכם' }, lang)}
          </span>
          <span className="group-hover:translate-x-1 transition-transform text-xl md:text-2xl">→</span>
        </button>
      </div>
    </div>
  )
}
