import { createContext, useContext, useState, useEffect } from 'react'

// Supported languages
export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'he', label: 'עברית', flag: '🇮🇱', dir: 'rtl' },
  { code: 'es', label: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', dir: 'rtl' },
]

const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('hbm-lang') || 'en'
  })

  useEffect(() => {
    localStorage.setItem('hbm-lang', lang)
    const langObj = LANGUAGES.find(l => l.code === lang)
    document.documentElement.setAttribute('lang', lang)
    document.documentElement.setAttribute('dir', langObj?.dir || 'ltr')
  }, [lang])

  return (
    <I18nContext.Provider value={{ lang, setLang }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}

// Translation helper - returns translated text or falls back to English
export function t(translations, lang) {
  if (typeof translations === 'string') return translations
  return translations?.[lang] || translations?.en || translations?.he || ''
}
