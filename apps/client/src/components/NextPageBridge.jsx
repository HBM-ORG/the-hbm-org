import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useI18n, t } from '../i18n/context'

export default function NextPageBridge({ to, title, description, buttonText, eyebrow }) {
  const { lang } = useI18n()

  return (
    <section className="bg-hbm-cream py-16 px-6">
      <div className="max-w-4xl mx-auto text-center bg-gradient-purple text-white p-12 md:p-16 rounded-[48px] shadow-2xl relative overflow-hidden">
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white rounded-full blur-3xl mix-blend-overlay"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-hbm-orange rounded-full blur-3xl mix-blend-overlay"></div>
        </div>

        <div className="relative z-10">
          {eyebrow && (
            <p className="text-sm uppercase tracking-widest opacity-70 mb-4 font-bold">
              {t(eyebrow, lang)}
            </p>
          )}
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 font-sofia">
            {t(title, lang)}
          </h2>
          
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t(description, lang)}
          </p>
          
          <Link 
            to={to} 
            className="btn-orange text-lg px-10 py-4 rounded-full inline-flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
          >
            {t(buttonText, lang)} <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  )
}
