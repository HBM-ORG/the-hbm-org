import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { siteContent } from '../data/content'
import { useT } from '../i18n/useT'

const { meeter } = siteContent

function FAQItem({ item, isOpen, onToggle }) {
  const t = useT()
  return (
    <div className="border-b border-gray-200">
      <button onClick={onToggle} className="w-full flex items-center justify-between py-6 text-left group">
        <h3 className="text-lg font-semibold text-hbm-dark pr-4 group-hover:text-hbm-blue transition-colors">{t(item.question)}</h3>
        <ChevronDown size={20} className={`flex-shrink-0 text-hbm-gray transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
        <p className="text-hbm-gray leading-relaxed">{t(item.answer)}</p>
      </div>
    </div>
  )
}

export default function Meeter() {
  const [openIndex, setOpenIndex] = useState(null)
  const t = useT()

  return (
    <section className="section-padding bg-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-blue text-center mb-4">{t(meeter.title)}</h1>
        <p className="text-center text-hbm-gray max-w-2xl mx-auto mb-12">{t(meeter.subtitle)}</p>
        <div>
          {meeter.items.map((item, i) => (
            <FAQItem key={i} item={item} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
          ))}
        </div>
      </div>
    </section>
  )
}
