import { useI18n, t } from '../i18n/context'
import { Palette, Type, Tag } from 'lucide-react'

export default function CustomizeMeeter() {
  const { lang } = useI18n()

  const customizationOptions = [
    {
      icon: Palette,
      title: { en: 'Custom Logo', he: 'לוגו מותאם' },
      description: { en: 'Upload your brand logo', he: 'העלו את הלוגו של המותג שלכם' },
    },
    {
      icon: Type,
      title: { en: 'Event Title', he: 'כותרת אירוע' },
      description: { en: 'Personalize the event name', he: 'התאימו אישית את שם האירוע' },
    },
    {
      icon: Tag,
      title: { en: 'Custom Interests', he: 'תחומי עניין מותאמים' },
      description: { en: 'Define your own interest tags', he: 'הגדירו תגיות עניין משלכם' },
    },
  ]

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        {/* Phone Mockup */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-[240px]">
            {/* Phone Frame - Lighter, cleaner design */}
            <div className="bg-white rounded-[40px] p-2 shadow-xl border-2 border-gray-200">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />
              
              {/* Screen */}
              <div className="bg-white rounded-[32px] overflow-hidden aspect-[9/19] relative border border-gray-100">
                {/* Header with Logo */}
                <div className="bg-gradient-to-r from-hbm-purple to-hbm-orange p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-2xl">🏢</span>
                    </div>
                    <div>
                      <p className="text-xs opacity-80">Welcome to</p>
                      <p className="font-bold text-sm">Your Company Event</p>
                    </div>
                  </div>
                </div>

                {/* Profile Card */}
                <div className="p-4">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-hbm-purple/20 to-hbm-orange/20 flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div>
                        <p className="font-bold text-hbm-dark">Sofia Cohen</p>
                        <p className="text-xs text-gray-500">Ready to connect</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        Tech
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        Fitness
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Home Indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="space-y-4">
          {customizationOptions.map((option, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-hbm-purple/10 flex items-center justify-center flex-shrink-0">
                <option.icon size={20} className="text-hbm-purple" />
              </div>
              <div>
                <h4 className="font-bold text-hbm-dark mb-1">{t(option.title, lang)}</h4>
                <p className="text-sm text-gray-600">{t(option.description, lang)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
