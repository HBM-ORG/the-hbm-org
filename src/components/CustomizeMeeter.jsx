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
          
          {/* Screen */}
          <div className="bg-white flex-col rounded-[32px] overflow-hidden aspect-[9/19] relative border border-gray-100 flex items-center justify-center shadow-inner">
            <div className="flex flex-col items-center justify-center animate-pulse-slow">
              {/* Clean text representation without smiley */}
              <h1 className="text-[32px] font-bold text-[#6160AB] tracking-wider mb-2" style={{letterSpacing: '0.1em'}}>
                Meeter
              </h1>
              <div className="flex items-center gap-1.5 opacity-80 mt-2">
                <span className="text-[#6160AB] font-semibold text-xs tracking-wide">by HBM</span>
                <img src="/assets/emotion-logo.png" alt="HBM" className="w-4 h-4 rounded-full" />
              </div>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-400 rounded-full" />
        </div>
      </div>
    </div>
  )
}
