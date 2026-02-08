import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, ChevronRight } from 'lucide-react'
import {
  heroContent,
  valuePropsContent,
  why8Content,
  howItWorksContent,
  guidelinesContent,
  siteConfig,
} from '../data/content'

/* ============================================
   HERO SECTION
   ============================================ */
function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % heroContent.rotatingWords.length)
        setIsAnimating(false)
      }, 400)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  // Placeholder circle images using ui-avatars
  const avatarGroups = [
    ['Emma', 'Liam', 'Sofia'],
    ['Noah', 'Ava', 'Maya'],
    ['Eli', 'Mia', 'Dan'],
    ['Yael', 'Tom', 'Noa'],
  ]

  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-20">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-hbm-peach-light rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-hbm-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Avatar Circles Row */}
        <div className="flex justify-center gap-6 md:gap-12 mb-12">
          {avatarGroups.map((group, gi) => (
            <div key={gi} className="flex -space-x-4">
              {group.map((name, i) => (
                <motion.img
                  key={name}
                  src={`https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=96&rounded=true&bold=true`}
                  alt={name}
                  className="circle-image w-16 h-16 md:w-20 md:h-20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: gi * 0.15 + i * 0.1, duration: 0.5 }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Rotating Word */}
        <div className="text-center mb-4">
          <span
            className={`inline-block text-lg md:text-xl font-medium text-hbm-lavender tracking-wide ${
              isAnimating ? 'animate-fade-out-up' : 'animate-fade-in-up'
            }`}
          >
            {heroContent.rotatingWords[wordIndex]}
          </span>
        </div>

        {/* Main Headline */}
        <motion.h1
          className="text-center font-[var(--font-display)] text-5xl md:text-7xl lg:text-8xl leading-tight text-hbm-blue mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {heroContent.title}
          <br />
          {heroContent.titleEnd}
        </motion.h1>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <a href={heroContent.ctaLink} className="btn-primary text-lg px-10 py-4">
            {heroContent.cta}
          </a>
        </motion.div>
      </div>
    </section>
  )
}

/* ============================================
   VALUE PROPS SECTION
   ============================================ */
function ValuePropsSection() {
  const colorClasses = {
    coral: 'bg-hbm-coral/10 border-hbm-coral/20',
    peach: 'bg-hbm-peach/40 border-hbm-peach',
    lavender: 'bg-hbm-lavender/10 border-hbm-lavender/20',
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Headline Stack */}
        <div className="mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-dark mb-2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {valuePropsContent.headline}
          </motion.h2>
          <motion.h2
            className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-coral mb-2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {valuePropsContent.subline}
          </motion.h2>
          <motion.h2
            className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-blue"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {valuePropsContent.detail}
          </motion.h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {valuePropsContent.cards.map((card, i) => (
            <motion.div
              key={i}
              className={`p-8 rounded-3xl border ${colorClasses[card.color]} card-hover`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <p className="text-hbm-dark text-lg leading-relaxed font-medium">
                {card.text}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a href={`mailto:${siteConfig.email}`} className="btn-secondary">
            Join Us <ArrowRight className="inline ml-2" size={18} />
          </a>
        </div>
      </div>
    </section>
  )
}

/* ============================================
   WHY 8 MINUTES SECTION
   ============================================ */
function Why8Section() {
  return (
    <section className="py-24 bg-hbm-cream relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-hbm-coral/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          className="text-4xl md:text-6xl font-[var(--font-display)] text-hbm-blue mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {why8Content.headline}
        </motion.h2>

        <motion.p
          className="text-xl md:text-2xl text-hbm-dark mb-4 leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Short enough <strong className="text-hbm-coral">{why8Content.bold1}</strong>,
          yet long enough <strong className="text-hbm-coral">{why8Content.bold2}</strong>
        </motion.p>

        <motion.p
          className="text-lg text-hbm-gray max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
        >
          {why8Content.subtext}
        </motion.p>

        <a href={`mailto:${siteConfig.email}`} className="btn-primary">
          {why8Content.cta}
        </a>
      </div>
    </section>
  )
}

/* ============================================
   VIDEO SECTION
   ============================================ */
function VideoSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          className="relative rounded-3xl overflow-hidden bg-hbm-dark aspect-video flex items-center justify-center group cursor-pointer"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* Placeholder - replace with actual video embed */}
          <div className="absolute inset-0 bg-gradient-to-br from-hbm-blue/20 to-hbm-coral/20" />
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-all group-hover:scale-110">
              <Play size={32} className="text-white ml-1" />
            </div>
            <h3 className="text-white text-xl md:text-2xl font-[var(--font-display)]">
              See Video: The Power of 8 Minutes
            </h3>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ============================================
   HOW IT WORKS SECTION
   ============================================ */
function HowItWorksSection() {
  return (
    <section className="py-24 bg-hbm-gray-light">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-blue mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {howItWorksContent.headline}
          </motion.h2>
          <p className="text-lg text-hbm-gray max-w-2xl mx-auto">
            {howItWorksContent.subline}
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {howItWorksContent.steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative bg-white rounded-3xl p-8 card-hover"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-hbm-blue/10 flex items-center justify-center mb-5">
                <span className="text-hbm-blue font-bold text-xl">{step.number}</span>
              </div>
              <p className="text-hbm-dark font-medium leading-relaxed">{step.text}</p>
              {i < howItWorksContent.steps.length - 1 && (
                <ChevronRight
                  className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-hbm-lavender"
                  size={24}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================
   GUIDELINES SECTION
   ============================================ */
function GuidelinesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-dark mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {guidelinesContent.headline}
          </motion.h2>
          <p className="text-lg text-hbm-gray max-w-3xl mx-auto">
            {guidelinesContent.subline}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {guidelinesContent.items.map((item, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-2xl bg-hbm-cream border border-hbm-peach/30 card-hover"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <span className="text-3xl mb-3 block">{item.icon}</span>
              <h4 className="text-hbm-dark font-[var(--font-display)] text-lg mb-2">
                {item.title}
              </h4>
              <p className="text-hbm-gray text-sm leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================
   NEWSLETTER SECTION
   ============================================ */
function NewsletterSection() {
  return (
    <section className="py-20 bg-hbm-blue">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-[var(--font-display)] text-white mb-4">
          Subscribe to News & Resources
        </h2>
        <p className="text-white/70 mb-8">Stay connected with The Human Being Movement</p>
        <form
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 px-5 py-3 rounded-full text-hbm-dark outline-none focus:ring-2 focus:ring-hbm-coral"
          />
          <button type="submit" className="btn-primary bg-hbm-coral text-white py-3 px-8">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  )
}

/* ============================================
   HOME PAGE
   ============================================ */
export default function Home() {
  return (
    <>
      <HeroSection />
      <ValuePropsSection />
      <Why8Section />
      <VideoSection />
      <HowItWorksSection />
      <GuidelinesSection />
      <NewsletterSection />
    </>
  )
}
