import { useState, useRef, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useI18n, LANGUAGES } from '../i18n/context'

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = LANGUAGES.find(l => l.code === lang)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isRtl = current?.dir === 'rtl'

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-hbm-dark hover:bg-gray-100 transition-colors"
        aria-label={current?.label || 'Language'}>
        <Globe size={16} />
        <span>{current?.flag}</span>
      </button>

      {open && (
        <div
          className={`absolute top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[160px] z-50 ${isRtl ? 'right-0 left-auto' : 'left-0 right-auto'}`}
          dir="ltr"
          role="listbox"
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false) }}
              role="option"
              aria-selected={l.code === lang}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                l.code === lang ? 'text-hbm-blue font-semibold bg-hbm-blue/5' : 'text-hbm-dark'
              }`}
              dir={l.dir}
            >
              <span className="text-lg shrink-0">{l.flag}</span>
              <span className={l.dir === 'rtl' ? 'text-right flex-1' : ''}>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
