import { useI18n, t } from '../i18n/context'
import { motion } from 'framer-motion'
import { Mail, ArrowRight } from 'lucide-react'

export default function LeadGenCTA({ 
  title = { en: 'Want to bring Meeter to your world?', he: 'רוצים להביא את Meeter אליכם?' },
  subtitle = { en: "Let's discuss how we can transform your space or community together.", he: 'בואו נדבר על איך נוכל לשנות את המרחב או הקהילה שלכם יחד.' },
  buttonText = { en: 'Contact Us', he: 'דברו איתנו' }
}) {
  const { lang } = useI18n()

  return (
    <section 
      className="relative py-24 px-6 overflow-hidden" 
      style={{ backgroundColor: '#FAF9F5' }}
    >
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 p-8 md:p-20 rounded-[48px] shadow-2xl text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 font-['Sora'] text-hbm-dark tracking-tight leading-tight">
            {t(title, lang)}
          </h2>
          <p className="text-hbm-gray text-xl md:text-2xl mb-12 font-['Sofia_Pro'] max-w-2xl mx-auto leading-relaxed font-medium">
            {t(subtitle, lang)}
          </p>

          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            className="inline-block"
          >
            <a 
              href="mailto:office@thehbm.org"
              className="group flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] text-white rounded-full text-xl font-bold shadow-2xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(240,123,60,0.3)]"
            >
              <Mail size={24} className="group-hover:rotate-12 transition-transform" />
              <span>{t(buttonText, lang)}</span>
              <ArrowRight size={24} className={`transition-transform duration-300 group-hover:translate-x-2 ${lang === 'he' ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
            </a>
          </motion.div>

          <p className="mt-8 text-sm text-hbm-gray/60 font-medium font-['Sofia_Pro']">
            office@thehbm.org
          </p>
        </div>
      </div>
    </section>
  )
}
