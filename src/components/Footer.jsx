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
  
  const socialItems = global.footer.socialCards.filter(c => c.platform !== 'YouTube')

  const openLegal = (key) => {
    setLegalKey(key)
    setLegalModalOpen(true)
  }

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'Instagram': return <Instagram size={20} />
      case 'Facebook': return <Facebook size={20} />
      case 'LinkedIn': return <Linkedin size={20} />
      case 'WhatsApp': return <MessageCircle size={20} />
      default: return <Send size={20} />
    }
  }

  const getBrandColor = (platform) => {
    switch (platform) {
      case 'WhatsApp': return 'hover:bg-[#25D366] hover:text-white hover:border-[#25D366]'
      case 'LinkedIn': return 'hover:bg-[#0077B5] hover:text-white hover:border-[#0077B5]'
      case 'Instagram': return 'hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-transparent' // Instagram gradient approx
      case 'Facebook': return 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]'
      default: return 'hover:bg-hbm-orange hover:text-white hover:border-hbm-orange'
    }
  }

  const currentLegal = legalKey ? legalContent[legalKey] : null

  return (
    <footer className="bg-gradient-purple text-white py-12 relative overflow-hidden">
      
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Main Footer Content: Menu & Socials */}
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center md:items-start gap-12 mb-24 border-b border-white/10 pb-12">
             
             {/* Menu */}
             <div className="text-center md:text-left">
               <h4 className="font-bold text-sm mb-6 opacity-60 uppercase tracking-widest font-sofia">Menu</h4>
               <ul className="flex flex-col md:block space-y-3 text-base font-medium font-sofia opacity-90">
                 <li><Link to="/" className="hover:text-hbm-orange transition-colors inline-block hover:translate-x-1 duration-300">Home</Link></li>
                 <li><Link to="/meeter/what" className="hover:text-hbm-orange transition-colors inline-block hover:translate-x-1 duration-300">Meeter</Link></li>
                 <li><Link to="/events" className="hover:text-hbm-orange transition-colors inline-block hover:translate-x-1 duration-300">Events</Link></li>
                 <li><Link to="/about" className="hover:text-hbm-orange transition-colors inline-block hover:translate-x-1 duration-300">About</Link></li>
                 <li><Link to="/knowledge" className="hover:text-hbm-orange transition-colors inline-block hover:translate-x-1 duration-300">Knowledge</Link></li>
               </ul>
             </div>

             {/* Socials */}
             <div className="text-center md:text-left">
                <h4 className="font-bold text-sm mb-6 opacity-60 uppercase tracking-widest font-sofia">Socials</h4>
                <div className="grid grid-cols-2 gap-4">
                  {socialItems.map((item, index) => (
                    <a 
                      key={index} 
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10 transition-all group ${getBrandColor(item.platform)}`}
                      title={item.platform}
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                        {getSocialIcon(item.platform)}
                      </div>
                      <span className="font-medium text-sm group-hover:font-bold">{item.platform}</span>
                    </a>
                  ))}
                  {/* Email Button */}
                  <a 
                      href="mailto:Office@TheHBM.Org"
                      className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10 transition-all group hover:bg-hbm-orange hover:border-hbm-orange hover:text-white"
                  >
                      <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                        <Mail size={20} />
                      </div>
                      <span className="font-medium text-sm group-hover:font-bold">Email</span>
                  </a>
                </div>
             </div>
        </div>

        {/* Bottom Section: Watermark & Copyright */}
        <div className="text-center relative pt-12">
            {/* Watermark */}
            <h1 className="text-[18vw] font-bold leading-none opacity-5 tracking-tighter select-none font-sofia mix-blend-overlay pointer-events-none absolute left-1/2 bottom-0 -translate-x-1/2 w-full text-center whitespace-nowrap z-0">
              The HBM
            </h1>
            <p className="text-sm tracking-[0.3em] uppercase opacity-40 font-sofia mb-8 relative z-10">Bringing People Together</p>
            
            <div className="relative z-10 flex flex-col items-center justify-center text-[11px] font-bold tracking-widest opacity-50 uppercase border-t border-white/5 pt-8 gap-6">
              <div className="flex gap-8">
                <button onClick={() => openLegal('terms')} className="hover:opacity-100 hover:text-white transition-all underline decoration-white/30 underline-offset-4">Terms of Use</button>
                <button onClick={() => openLegal('privacy')} className="hover:opacity-100 hover:text-white transition-all underline decoration-white/30 underline-offset-4">Privacy Policy</button>
              </div>
              <p>© 2025 THE HBM, INC. ALL RIGHTS RESERVED.</p>
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

