import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useEffect, useState } from 'react'
import { Clock, Heart, Brain, Zap } from 'lucide-react'
import { useI18n, t } from '../../i18n/context'

const Why8MinutesTimer = ({ compact = false }) => {
  const { lang } = useI18n()
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const progress = useMotionValue(0)
  const seconds = useTransform(progress, [0, 100], [480, 0]) // 8 minutes = 480 seconds
  const [displayTime, setDisplayTime] = useState('8:00')

  // Format seconds to MM:SS
  useEffect(() => {
    const unsubscribe = seconds.on('change', (latest) => {
      const mins = Math.floor(latest / 60)
      const secs = Math.floor(latest % 60)
      setDisplayTime(`${mins}:${secs.toString().padStart(2, '0')}`)
    })

    return () => unsubscribe()
  }, [seconds])

  const startTimer = () => {
    setIsTimerRunning(true)
    animate(progress, 100, {
      duration: 8, // 8 seconds animation (representing 8 minutes)
      ease: "linear",
      onComplete: () => {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6160AB', '#F07B3C', '#73C154']
          })
          progress.set(0)
          setIsTimerRunning(false)
        }, 500)
      }
    })
  }

  const circleProgress = useTransform(progress, [0, 100], [0, 1])
  const circumference = 2 * Math.PI * 120 // radius = 120
  const strokeDashoffset = useTransform(
    circleProgress,
    [0, 1],
    [circumference, 0]
  )

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br from-[#6160AB]/10 via-white to-[#F07B3C]/10 ${compact ? 'py-16' : 'py-32'}`}>
      {/* Animated background */}
      <motion.div
        className="absolute top-20 right-10 w-96 h-96 bg-[#6160AB]/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className={`text-center ${compact ? 'mb-10' : 'mb-16'}`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`${compact ? 'text-4xl md:text-6xl' : 'text-6xl md:text-8xl'} font-bold mb-6`}>
            <span className="text-gray-900">{t({ en: 'Why ', he: 'למה ' }, lang)}</span>
            <span className="bg-gradient-to-r from-[#6160AB] to-[#F07B3C] bg-clip-text text-transparent">
              {t({ en: '8 Minutes?', he: '8 דקות?' }, lang)}
            </span>
          </h2>

          <p className={`${compact ? 'text-lg' : 'text-2xl'} text-gray-700 max-w-4xl mx-auto leading-relaxed`}>
            {t({ 
              en: "It's the psychological 'Sweet Spot'. Short enough to feel safe (low risk), but long enough to create a meaningful bond (high reward).", 
              he: 'זו הנקודה הפסיכולוגית המושלמת. קצר מספיק כדי להרגיש בטוח (סיכון נמוך), אבל ארוך מספיק כדי ליצור קשר משמעותי (תגמול גבוה).' 
            }, lang)}
          </p>
        </motion.div>

        {/* Timer Circle */}
        <motion.div
          className={`max-w-md mx-auto ${compact ? 'mb-10 scale-90' : 'mb-20'}`}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative w-full aspect-square flex items-center justify-center">
            {/* Outer glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] rounded-full blur-3xl opacity-30"
              animate={{
                scale: isTimerRunning ? [1, 1.2, 1] : 1,
                opacity: isTimerRunning ? [0.3, 0.6, 0.3] : 0.3,
              }}
              transition={{
                duration: 2,
                repeat: isTimerRunning ? Infinity : 0,
              }}
            />

            {/* SVG Circle */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 300 300"
            >
              {/* Background circle */}
              <circle
                cx="150"
                cy="150"
                r="120"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
              />

              {/* Animated progress circle */}
              <motion.circle
                cx="150"
                cy="150"
                r="120"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={circumference}
                style={{
                  strokeDashoffset,
                }}
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6160AB" />
                  <stop offset="50%" stopColor="#F07B3C" />
                  <stop offset="100%" stopColor="#73C154" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center content */}
            <div className="relative text-center">
              <motion.div
                className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-[#6160AB] to-[#F07B3C] bg-clip-text text-transparent"
                animate={{
                  scale: isTimerRunning ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 1,
                  repeat: isTimerRunning ? Infinity : 0,
                }}
              >
                {displayTime}
              </motion.div>
              <p className="text-xl text-gray-600 font-medium mt-2">
                {t({ en: 'minutes', he: 'דקות' }, lang)}
              </p>

              {/* Start button */}
              {!isTimerRunning && (
                <motion.button
                  onClick={startTimer}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] text-white rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Clock className="inline w-5 h-5 mr-2" />
                  {t({ en: 'Watch It Count Down', he: 'צפו בספירה לאחור' }, lang)}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Feature cards below timer */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: Brain,
              title: t({ en: 'Scientifically Proven', he: 'מוכח מדעית' }, lang),
              description: t({ en: 'Optimal window for authentic connection', he: 'חלון אופטימלי לחיבור אותנטי' }, lang),
              color: '#6160AB'
            },
            {
              icon: Zap,
              title: t({ en: 'Low Commitment', he: 'מחויבות נמוכה' }, lang),
              description: t({ en: 'Everyone can spare 8 minutes', he: 'כולם יכולים להקדיש 8 דקות' }, lang),
              color: '#F07B3C'
            },
            {
              icon: Heart,
              title: t({ en: 'High Impact', he: 'השפעה גבוהה' }, lang),
              description: t({ en: 'Walk away energized and inspired', he: 'צאו עם אנרגיה והשראה' }, lang),
              color: '#73C154'
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className={`bg-white rounded-2xl shadow-xl border border-gray-100 text-center ${compact ? 'p-6' : 'p-8'}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -10, scale: 1.05 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{ backgroundColor: `${feature.color}20` }}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <feature.icon className="w-8 h-8" style={{ color: feature.color }} />
              </motion.div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Why8MinutesTimer
