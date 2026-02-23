import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, t } from '../i18n/context'
import { siteContent } from '../data/content'
import { legalContent } from '../data/legal'
import { Mail, Instagram, Facebook, Linkedin, MessageCircle, Send } from 'lucide-react'
import LegalModal from './LegalModal'

const { global } = siteContent

export default function Footer() {
  const { lang } = useI18n()
  const [legalModalOpen, setLegalModalOpen] = useState(false)
  const [legalKey, setLegalKey] = useState(null)
  
  // Get social items (excluding YouTube based on design)
  const socialItems = global.footer.socialCards.filter(c => c.platform !== 'YouTube')

  const openLegal = (key) => {
    setLegalKey(key)
    setLegalModalOpen(true)
  }

  const currentLegal = legalKey ? legalContent[legalKey] : null

  return (
    <footer className="bg-hbm-cream pb-8 px-2 md:px-4 relative overflow-hidden pt-12">
      
      {/* The Refined Bubble Container - Lavender Background with Central Glow */}
      <div className="w-[96%] max-w-[1800px] mx-auto rounded-[40px] md:rounded-[60px] relative overflow-hidden text-white px-6 py-12 md:py-20 md:px-16 shadow-xl
                      bg-[#9D99E5] bg-[radial-gradient(circle_at_50%_40%,_rgba(255,255,255,0.4)_0%,_rgba(255,255,255,0.1)_50%,_transparent_100%)]">
        
        {/* Header */}
        <div className="text-center mb-10 md:mb-16 relative z-20">
             <h2 className="text-2xl md:text-4xl font-bold tracking-wide drop-shadow-sm opacity-95">
               {t({ en: 'One Movement. Many Ways To Reach Us.', he: 'תנועה אחת. דרכים רבות להגיע אלינו.', es: 'Un movimiento. Muchas formas de llegar a nosotros.', fr: 'Un mouvement. De nombreuses façons de nous contacter.', de: 'Eine Bewegung. Viele Wege, uns zu erreichen.', ar: 'حركة واحدة. طرق عديدة للتواصل معنا.' }, lang)}
             </h2>
        </div>

        {/* 5-Column Grid */}
        <div className={`relative z-20 grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-6 mb-24 md:mb-32 ${lang === 'he' || lang === 'ar' ? 'text-center md:text-right' : 'text-center md:text-left'}`}>
           
           {/* Social Columns */}
           {socialItems.map((item, index) => (
             <a 
               key={index} 
               href={item.url}
               target="_blank"
               rel="noopener noreferrer"
               className="flex flex-col gap-2 group hover:opacity-100 opacity-90 transition-all hover:-translate-y-1 duration-300 items-center md:items-start"
             >
               <h3 className="font-bold text-xl">{item.platform}</h3>
               <p className="text-[12px] md:text-sm opacity-85 leading-relaxed max-w-[220px] font-medium tracking-wide">
                 {item.text}
               </p>
             </a>
           ))}

           {/* Office Email Column */}
           <a 
               href="mailto:Office@TheHBM.Org"
               className={`flex flex-col gap-2 group hover:opacity-100 opacity-90 transition-all hover:-translate-y-1 duration-300 ${lang === 'he' || lang === 'ar' ? 'items-center md:items-end' : 'items-center md:items-start'}`}
           >
               <h3 className="font-bold text-xl">Office@TheHBM.Org</h3>
               <p className="text-[12px] md:text-sm opacity-85 leading-relaxed max-w-[220px] font-medium tracking-wide">
                 {t({ en: "Questions, partnerships, or just to say hi — we read every email.", he: 'שאלות, שיתופי פעולה, או סתם להגיד שלום — אנחנו קוראים כל מייל.', es: 'Preguntas, colaboraciones o simplemente saludar — leemos cada correo.', fr: 'Questions, partenariats ou juste un bonjour — nous lisons chaque e-mail.', de: 'Fragen, Partnerschaften oder einfach Hallo sagen — wir lesen jede E-Mail.', ar: 'أسئلة، شراكات، أو مجرد تحية — نقرأ كل بريد إلكتروني.' }, lang)}
               </p>
           </a>

        </div>

        {/* Background Typography */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-10 flex flex-col items-center justify-end pb-4 md:pb-6">
            <h1 className="text-[25vw] md:text-[18vw] font-bold leading-[0.7] tracking-tighter opacity-25 font-sofia text-white pointer-events-none">
              The HBM
            </h1>
            <p className="text-[10px] md:text-sm tracking-[0.4em] uppercase opacity-70 font-sofia font-bold">
              {t({ en: 'Bringing People Together', he: 'מחברים אנשים', es: 'Uniendo personas', fr: 'Rapprocher les gens', de: 'Menschen verbinden', ar: 'نجمع الناس معاً' }, lang)}
            </p>
        </div>

        {/* Footer Bottom Bar */}
        <div className="relative z-20 flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs font-bold tracking-widest opacity-60 uppercase pt-8 gap-6 md:gap-0 mt-8 mb-4 md:mb-0 border-t border-white/10 md:border-none">
            <div className="text-center md:text-start order-2 md:order-1">
               <p>© 2026 THE HBM, INC. {t({ en: 'ALL RIGHTS RESERVED', he: 'כל הזכויות שמורות', es: 'TODOS LOS DERECHOS RESERVADOS', fr: 'TOUS DROITS RÉSERVÉS', de: 'ALLE RECHTE VORBEHALTEN', ar: 'جميع الحقوق محفوظة' }, lang)}.</p>
            </div>
            <div className="flex gap-6 order-1 md:order-2">
                 <button onClick={() => openLegal('terms')} className="hover:opacity-100 hover:text-white transition-all">{t({ en: 'Terms of Use', he: 'תנאי שימוש', es: 'Términos de uso', fr: "Conditions d'utilisation", de: 'Nutzungsbedingungen', ar: 'شروط الاستخدام' }, lang)}</button>
                 <button onClick={() => openLegal('privacy')} className="hover:opacity-100 hover:text-white transition-all">{t({ en: 'Privacy Policy', he: 'מדיניות פרטיות', es: 'Política de privacidad', fr: 'Politique de confidentialité', de: 'Datenschutz', ar: 'سياسة الخصوصية' }, lang)}</button>
            </div>
        </div>

      </div>

      <LegalModal 
        isOpen={legalModalOpen} 
        onClose={() => setLegalModalOpen(false)} 
        title={currentLegal && t(currentLegal.title, lang)}
        content={currentLegal && (
          <div dangerouslySetInnerHTML={{ __html: currentLegal.content }} className="space-y-4" />
        )}
      />
    </footer>
  )
}

