import { useI18n, t } from '../i18n/context'

export default function CustomizeMeeter({ imageSrc }) {
  const { lang } = useI18n()

  return (
    <div className="w-full flex justify-center items-center">
      {/* Phone Mockup ONLY */}
      <div className="relative w-[260px]">
        {/* Phone Frame - Lighter, cleaner design */}
        <div className="bg-white rounded-[40px] p-2 shadow-xl border-2 border-gray-200 relative">
          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />
          
          {/* Screen Content */}
          <div className="bg-[#FAF9F5] rounded-[32px] overflow-hidden aspect-[9/19] relative border border-gray-100 flex flex-col items-center pt-16 px-4 shadow-inner">
            {/* Template Box 1: Logo */}
            <div className="w-full aspect-video bg-white/50 border-2 border-dashed border-[#F07B3C]/30 rounded-2xl flex flex-col items-center justify-center p-4 mb-8 group transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-[#fbd5c1]/20 flex items-center justify-center mb-2">
                <span className="text-[#F07B3C] text-xl"></span>
              </div>
              <span className="text-[10px] font-bold text-[#F07B3C] uppercase tracking-widest text-center font-['Sofia_Pro']">
                {t({ en: 'Your Logo Here', he: 'הלוגו שלכם כאן' }, lang)}
              </span>
            </div>

            {/* The Meeter Branding Middle */}
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-[28px] font-bold text-[#6160AB] tracking-wider font-['Sora']" style={{letterSpacing: '0.1em'}}>
                Meeter
              </h1>
              <div className="flex items-center gap-1.5 opacity-60 font-['Sofia_Pro']">
                <span className="text-[#6160AB] font-semibold text-[10px] tracking-wide">by HBM</span>
                <img src="/assets/emotion-logo.png" alt="HBM" className="w-3 h-3 rounded-full" />
              </div>
            </div>

            {/* Template Box 2: Title & Description */}
            <div className="w-full bg-white/80 border-2 border-dashed border-[#6160AB]/30 rounded-2xl p-3 flex flex-col gap-1.5">
              <div className="h-1.5 w-2/3 bg-[#6160AB]/10 rounded-full" />
              <div className="h-1.5 w-full bg-[#6160AB]/5 rounded-full" />
              <span className="text-[9px] font-bold text-[#6160AB] uppercase tracking-widest mt-0.5 font-['Sofia_Pro']">
                {t({ en: 'Event Description', he: 'תיאור האירוע' }, lang)}
              </span>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  )
}
