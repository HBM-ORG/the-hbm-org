import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'What is The HBM?',
    a: 'The Human Being Movement is a social platform built for real connection. We match you with someone new for an 8-minute video conversation — no profiles, no swiping, just real talk.',
  },
  {
    q: 'How does it work?',
    a: 'Sign up, click "Let\'s Go!", and our platform pairs you with another person. You\'ll have an 8-minute video call, then you can choose to connect further or move on.',
  },
  {
    q: 'Is it free?',
    a: 'Yes! The basic HBM experience is free. We believe connection should be accessible to everyone.',
  },
  {
    q: 'Is it safe?',
    a: 'Absolutely. We have clear community guidelines, and wherever people come together, we create a safe, respectful, and meaningful space.',
  },
  {
    q: 'Why 8 minutes?',
    a: "It's the sweet spot — short enough to say yes, long enough to feel good. Research shows meaningful connections can form in just a few minutes of genuine conversation.",
  },
  {
    q: 'Can I use HBM for my organization?',
    a: 'Yes! We offer B2B solutions for companies, universities, communities, and events. Check out our For B2B page for more details.',
  },
]

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-gray-100">
      <button
        className="w-full flex items-center justify-between py-6 text-left group"
        onClick={onToggle}
      >
        <span className="text-lg font-medium text-hbm-dark group-hover:text-hbm-blue transition-colors pr-8">
          {faq.q}
        </span>
        <ChevronDown
          size={20}
          className={`text-hbm-gray shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-hbm-gray leading-relaxed">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-6">
        <motion.h1
          className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-blue mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Frequently Asked Questions
        </motion.h1>
        <p className="text-center text-hbm-gray mb-12 text-lg">
          Everything you need to know about The HBM
        </p>

        <div>
          {faqs.map((faq, i) => (
            <FaqItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
