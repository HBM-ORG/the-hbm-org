import { motion } from 'framer-motion'
import { X, Check, Zap } from 'lucide-react'
import { useI18n, t } from '../../i18n/context'
import BubbleContainer from '../BubbleContainer'

const ComparisonSection = () => {
  const { lang } = useI18n()

  const oldWay = [
    { text: t({ en: 'Standing alone checking your phone', he: 'עומדים לבד ובודקים את הטלפון' }, lang) },
    { text: t({ en: 'Forced small talk with strangers', he: 'שיחת חולין מאולצת עם זרים' }, lang) },
    { text: t({ en: "Exchanging cards you'll never use", he: 'החלפת כרטיסי ביקור שלעולם לא תשתמשו בהם' }, lang) },
    { text: t({ en: 'Leaving without real connections', he: 'עוזבים בלי חיבורים אמיתיים' }, lang) },
  ]

  const hbmWay = [
    { text: t({ en: 'Instant smart matching', he: 'התאמה חכמה מיידית' }, lang) },
    { text: t({ en: 'Curated ice-breakers', he: 'שוברי קרח מותאמים' }, lang) },
    { text: t({ en: 'Structured 8-minute deep conversations', he: 'שיחות מעמיקות של 8 דקות' }, lang) },
    { text: t({ en: 'Real relationships that last', he: 'מערכות יחסים אמיתיות שנשארות' }, lang) },
  ]

  return (
    <section className="bg-hbm-cream">
      <BubbleContainer bgColor="white">
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-[#6160AB] to-[#F07B3C] bg-clip-text text-transparent mb-4">
              {t({ en: 'Before and After', he: 'לפני ואחרי ' }, lang)}
            </h2>
            <p className="text-xl text-gray-600">
               {t({ en: 'Stop settling for awkward. Start connecting for real.', he: 'תפסיקו להסתפק במביך. תתחילו להתחבר באמת.' }, lang)}
            </p>
          </motion.div>

          {/* Comparison Grid */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* OLD WAY - Left Card */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative h-full p-6 rounded-3xl bg-white border-2 border-red-200 shadow-xl overflow-hidden">


                {/* Badge */}
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-semibold mb-6"
                  whileHover={{ scale: 1.05 }}
                >
                  <X className="w-4 h-4" />
                  {t({ en: 'OLD WAY', he: 'הדרך הישנה' }, lang)}
                </motion.div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {t({ en: 'Awkward Networking', he: 'נטוורקינג מביך' }, lang)}
                </h3>

                {/* List */}
                <div className="space-y-5">
                  {oldWay.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-4 p-3 bg-red-50 rounded-xl border border-red-100"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <X className="flex-shrink-0 w-6 h-6 text-red-500 mt-0.5" strokeWidth={3} />
                      <div className="flex items-center gap-3">
                        <p className="text-gray-700 font-medium">{item.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* HBM WAY - Right Card */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative h-full p-6 rounded-3xl bg-gradient-to-br from-[#6160AB]/5 via-[#F07B3C]/5 to-[#73C154]/5 border-2 border-[#73C154] shadow-2xl overflow-hidden">


                {/* Badge - Enhanced with Multiple Animations */}
                <div className="relative inline-block mb-6">
                  {/* Floating Particles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 bg-white rounded-full"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        x: [0, Math.random() * 10 - 5, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut"
                      }}
                    />
                  ))}

                  {/* Main Badge */}
                  <motion.div
                    className="relative inline-flex items-center gap-2 px-6 py-3 text-white rounded-full text-sm font-bold overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #73C154, #6160AB, #F07B3C, #73C154)',
                      backgroundSize: '300% 300%',
                    }}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      backgroundPosition: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear"
                      },
                      scale: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {/* Shimmer Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 1
                      }}
                    />

                    {/* Content */}
                    <Check className="w-5 h-5 relative z-10" strokeWidth={3} />
                    <span className="relative z-10 tracking-wide">
                      {t({ en: 'HBM WAY', he: 'דרך HBM' }, lang)}
                    </span>
                  </motion.div>

                  {/* Dynamic Glow */}
                  <motion.div
                    className="absolute inset-0 rounded-full blur-xl -z-10"
                    style={{
                      background: 'linear-gradient(135deg, #73C154, #6160AB, #F07B3C)',
                      backgroundSize: '200% 200%',
                    }}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#6160AB] to-[#F07B3C] bg-clip-text text-transparent mb-6">
                  {t({ en: 'Guided Connection', he: 'חיבור מודרך' }, lang)}
                </h3>

                {/* List */}
                <div className="space-y-5">
                  {hbmWay.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-4 p-3 bg-white rounded-xl border border-[#73C154]/30 shadow-sm"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ 
                        scale: 1.03,
                        boxShadow: '0 10px 30px rgba(115, 193, 84, 0.2)'
                      }}
                    >
                      <Check className="flex-shrink-0 w-6 h-6 text-[#73C154] mt-0.5" strokeWidth={3} />
                      <div className="flex items-center gap-3">
                        <p className="text-gray-700 font-medium">{item.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-[#73C154]/20 via-transparent to-[#6160AB]/20 rounded-3xl opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          </div>

          {/* CTA below */}

        </div>
      </BubbleContainer>
    </section>
  )
}

export default ComparisonSection
