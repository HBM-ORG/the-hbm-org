import { useI18n, t } from '../i18n/context'
import { BarChart3, TrendingUp, Users } from 'lucide-react'

export default function MeasureTheMagic() {
  const { lang } = useI18n()

  const stats = [
    {
      icon: Users,
      value: '127',
      label: { en: 'Connections', he: 'חיבורים' },
      color: 'hbm-purple',
    },
    {
      icon: TrendingUp,
      value: '4.8',
      label: { en: 'Avg Rating', he: 'דירוג ממוצע' },
      color: 'hbm-orange',
    },
    {
      icon: BarChart3,
      value: '89%',
      label: { en: 'Follow-ups', he: 'המשכים' },
      color: 'hbm-green',
    },
  ]

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Main Dashboard Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {t({ en: 'Live Event Data', he: 'נתוני אירוע חיים' }, lang)}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-hbm-dark">
            {t({ en: 'Real-Time Insights', he: 'תובנות בזמן אמת' }, lang)}
          </h3>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 text-center border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-full bg-${stat.color}/10 flex items-center justify-center mx-auto mb-3`}>
                <stat.icon size={20} className={`text-${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-hbm-dark mb-1">{stat.value}</p>
              <p className="text-xs text-gray-600 font-medium">{t(stat.label, lang)}</p>
            </div>
          ))}
        </div>

        {/* Context Note */}
        <div className="bg-gradient-to-r from-hbm-purple/5 to-hbm-orange/5 rounded-xl p-4 border border-hbm-purple/10">
          <p className="text-sm text-hbm-gray leading-relaxed">
            {t(
              {
                en: 'Track these metrics live during your event, then access detailed summary reports afterwards.',
                he: 'עקבו אחרי המדדים האלה בזמן אמת במהלך האירוע, ואז גישה לדוחות סיכום מפורטים אחר כך.',
              },
              lang
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
