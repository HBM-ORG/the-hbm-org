import { MapPin, Check, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n, t } from '../i18n/context'

export default function CustomLocationsMockup() {
  const { lang } = useI18n()
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative w-full max-w-[340px] mx-auto overflow-hidden bg-[#F5F6FE] rounded-[48px] border-[12px] border-white shadow-2xl p-6 flex flex-col items-center"
      style={{ height: '640px' }}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-[#6160AB] text-[42px] font-black mb-6 mt-4 tracking-tighter"
      >
        Go to:
      </motion.div>
      
      {/* Location Image Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="relative w-full h-[220px] rounded-[24px] overflow-hidden mb-6 shadow-xl bg-gray-900 group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
           {/* Fallback pattern / image since we want a cool vibe but don't have the exact DJ photo */}
           <div className="absolute inset-0 opacity-40 mix-blend-luminosity bg-[url('https://images.unsplash.com/photo-1516280440502-6cfa358249cd?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center group-hover:mix-blend-normal transition-all duration-700" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#bbc0ff] backdrop-blur-md flex items-center justify-center text-[#6160AB] shadow-inner">
              <MapPin size={22} strokeWidth={2.5} />
            </div>
            <span className="text-white text-2xl font-black tracking-wide text-shadow-sm">
              {t({ en: 'DJ Zone', he: 'עמדת דיג׳יי' }, lang)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Conversation Tip Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="w-full bg-white rounded-2xl p-5 shadow-sm border border-[#bbc0ff]/20 mb-auto relative"
      >
         <div className="flex items-center gap-2 mb-3">
           <span className="text-xl">💡</span>
           <span className="text-xs font-bold text-[#6160AB] uppercase tracking-wider">
             {t({ en: 'Conversation Tip', he: 'טיפ לשיחה' }, lang)}
           </span>
         </div>
         <p className="text-[#1a1a1a] font-medium leading-tight mb-5 text-[15px]">
           {t({ en: 'Be genuinely curious — show real interest in the other person.', he: 'היו סקרנים באמת — הראו עניין אכפתי ואמיתי.' }, lang)}
         </p>
         <div className="border-t border-gray-100 pt-3 text-center text-xs text-gray-400 font-bold flex items-center justify-center gap-2">
           <ArrowLeft size={12} className="text-gray-300" />
           {t({ en: 'Swipe me', he: 'החליקו אותי' }, lang)}
           <ArrowLeft size={12} className="text-gray-300 rotate-180" />
         </div>
      </motion.div>

      {/* Big Action Button */}
      <motion.button 
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="w-full py-4 bg-[#bbc0ff] hover:bg-[#a5abbf] text-white rounded-2xl font-black text-xl mb-4 mt-6 transition-colors flex justify-center items-center gap-3 shadow-md"
      >
        <Check size={24} strokeWidth={4} />
        {t({ en: "I've arrived!", he: "הגעתי!" }, lang)}
      </motion.button>
      
      {/* Secondary Button */}
      <motion.button 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
        className="py-3 px-10 bg-white border border-gray-200 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-colors shadow-sm text-sm"
      >
        {t({ en: 'Back', he: 'חזור' }, lang)}
      </motion.button>

    </motion.div>
  )
}
