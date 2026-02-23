import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n, t } from '../i18n/context'
import { Sparkles } from 'lucide-react'
import { siteContent } from '../data/content'

export default function SmartMatchingZone() {
  const navigate = useNavigate()
  const { lang } = useI18n()
  const [selectedInterests, setSelectedInterests] = useState([])
  const interests = [
    { en: 'Art', he: 'אמנות', color: 'bg-red-100 text-red-700 border-red-300' },
    { en: 'Music', he: 'מוזיקה', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    { en: 'Sport', he: 'ספורט', color: 'bg-green-100 text-green-700 border-green-300' },
    { en: 'Travel', he: 'טיולים', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { en: 'Food & Cooking', he: 'אוכל ובישול', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { en: 'Entrepreneurship', he: 'יזמות', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { en: 'Movies & TV', he: 'סרטים וטלוויזיה', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { en: 'Books', he: 'ספרים', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { en: 'Gaming', he: 'גיימינג', color: 'bg-teal-100 text-teal-700 border-teal-300' },
    { en: 'Fashion', he: 'אופנה', color: 'bg-rose-100 text-rose-700 border-rose-300' },
    { en: 'Family', he: 'משפחה', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  ]

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest.en)
        ? prev.filter((i) => i !== interest.en)
        : [...prev, interest.en]
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-hbm-purple" />
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {t({ en: 'Smart Algorithm', he: 'אלגוריתם חכם' }, lang)}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-hbm-dark mb-2">
            {t({ en: 'Select Your Interests', he: 'בחרו את תחומי העניין שלכם' }, lang)}
          </h3>
          <p className="text-sm text-gray-600">
            {t(
              {
                en: 'We\'ll match you with someone who shares your vibe',
                he: 'נתאים אתכם עם מישהו שחולק את האווירה שלכם',
              },
              lang
            )}
          </p>
        </div>

        {/* Interest Tags */}
        <div className="flex flex-wrap gap-3 mb-8">
          {interests.map((interest, idx) => (
            <button
              key={idx}
              onClick={() => toggleInterest(interest)}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm border-2 transition-all duration-200 hover:scale-105 ${
                selectedInterests.includes(interest.en)
                  ? interest.color + ' shadow-md'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {t(interest, lang)}
            </button>
          ))}
        </div>

        {/* CTA Button */}
        <button 
          onClick={() => navigate(siteContent.global.ctaUrl)}
          className="w-full bg-gradient-to-r from-hbm-purple to-hbm-orange text-white font-bold py-4 px-6 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 group">
          <span className="text-lg">
            {t({ en: 'Start Your 8 Minutes', he: 'התחילו את 8 הדקות שלכם' }, lang)}
          </span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>

        {/* Match Count */}
        <div className="h-6 mt-4">
          {selectedInterests.length > 0 && (
            <p className="text-center text-sm text-gray-500 animate-fade-in">
              {t(
                {
                  en: `${selectedInterests.length} interests selected • Finding your perfect match...`,
                  he: `${selectedInterests.length} תחומי עניין נבחרו • מחפשים את ההתאמה המושלמת...`,
                },
                lang
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
