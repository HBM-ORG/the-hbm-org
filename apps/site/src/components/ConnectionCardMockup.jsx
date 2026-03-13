import { motion } from 'framer-motion'
import { Mail, Phone, Instagram, Send, Copy, Share2, Sparkles, Linkedin, ArrowRight } from 'lucide-react'
import { useI18n, t } from '../i18n/context'

export default function ConnectionCardMockup() {
  const { lang } = useI18n()

  return (
    <div className="w-full flex justify-center items-center">
      <div className="relative w-[280px]">
        {/* Phone Frame */}
        <div className="bg-white rounded-[45px] p-2 shadow-2xl border-2 border-gray-100 relative overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20" />
          
          {/* Screen Content */}
          <div className="bg-gradient-to-b from-[#F5F6FE] to-white rounded-[38px] overflow-hidden aspect-[9/19] relative flex flex-col items-center pt-12 px-5 shadow-inner">
            
            {/* Celebration Icon */}
            <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="mb-4 text-4xl"
            >
              🎉
            </motion.div>

            <h2 className="text-xl font-black text-[#6160AB] text-center leading-tight mb-2 font-['Sora']">
              {t({ en: 'You have a new connection!', he: 'יש לכם חיבור חדש!' }, lang)}
            </h2>
            <p className="text-[10px] text-hbm-gray text-center mb-6 font-medium font-['Sofia_Pro']">
              {t({ en: 'You both agreed to connect. Here are their details:', he: 'שניכם הסכמתם להתחבר. הנה הפרטים שלהם:' }, lang)}
            </p>

            {/* The Card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-xl border border-white/60 mb-6"
            >
              <div className="text-center mb-4">
                <span className="text-lg font-black text-hbm-dark font-['Sofia_Pro']">The HBM</span>
              </div>

              <div className="space-y-3 font-['Sofia_Pro']">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2 text-hbm-gray">
                    <Mail size={12} className="text-[#6160AB]" />
                    <span>Email</span>
                  </div>
                  <span className="font-bold text-hbm-dark">office@thehbm.org</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2 text-hbm-gray">
                    <Phone size={12} className="text-[#6160AB]" />
                    <span>Phone</span>
                  </div>
                  <span className="font-bold text-hbm-dark">0587073136</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2 text-hbm-gray">
                    <Instagram size={12} className="text-[#6160AB]" />
                    <span>Instagram</span>
                  </div>
                  <span className="font-bold text-hbm-dark">@the__hbm</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2 text-hbm-gray">
                    <Linkedin size={12} className="text-[#6160AB]" />
                    <span>LinkedIn</span>
                  </div>
                  <span className="font-bold text-hbm-dark">The HBM</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 w-full mb-6 font-['Sofia_Pro']">
              <div className="bg-white rounded-xl py-2 px-3 shadow-sm border border-gray-50 flex items-center justify-center gap-2">
                <Mail size={12} className="text-hbm-gray" />
                <span className="text-[9px] font-bold text-hbm-gray">Email</span>
              </div>
              <div className="bg-white rounded-xl py-2 px-3 shadow-sm border border-gray-50 flex items-center justify-center gap-2">
                <Share2 size={12} className="text-hbm-gray" />
                <span className="text-[9px] font-bold text-hbm-gray">WhatsApp</span>
              </div>
              <div className="col-span-2 bg-white rounded-xl py-2 px-3 shadow-sm border border-gray-50 flex items-center justify-center gap-2">
                <Instagram size={12} className="text-hbm-gray" />
                <span className="text-[9px] font-bold text-hbm-gray">Instagram</span>
              </div>
            </div>

            {/* Next Button */}
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-[#6160AB] text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg font-['Sofia_Pro'] uppercase tracking-wider"
            >
              <span>{t({ en: 'Next Round', he: 'עוד סיבוב' }, lang)}</span>
              <ArrowRight size={14} />
            </motion.button>

            {/* Sparkles Decoration */}
            <div className="absolute top-20 right-4 opacity-20">
              <Sparkles className="text-hbm-orange" size={20} />
            </div>
          </div>
          

        </div>
      </div>
    </div>
  )
}
