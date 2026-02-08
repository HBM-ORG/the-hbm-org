import { motion } from 'framer-motion'
import { Heart, Users, Globe } from 'lucide-react'

export default function About() {
  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-6">
        <motion.h1
          className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-blue mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          About The HBM
        </motion.h1>

        <motion.p
          className="text-xl text-hbm-gray text-center max-w-3xl mx-auto mb-16 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          The Human Being Movement is more than a platform — it's a belief that real connection
          can happen anywhere, between anyone, in just 8 minutes.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: Heart,
              title: 'Our Mission',
              text: 'To bring people together through authentic, meaningful conversations — one 8-minute call at a time.',
            },
            {
              icon: Users,
              title: 'Our Community',
              text: 'A growing movement of people who believe that connection starts with showing up as your true self.',
            },
            {
              icon: Globe,
              title: 'Our Vision',
              text: 'A world where every person has access to genuine human connection, regardless of geography or background.',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="text-center p-8 rounded-3xl bg-hbm-cream card-hover"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-hbm-blue/10 flex items-center justify-center mx-auto mb-5">
                <item.icon size={28} className="text-hbm-blue" />
              </div>
              <h3 className="text-xl font-[var(--font-display)] text-hbm-dark mb-3">{item.title}</h3>
              <p className="text-hbm-gray leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>

        {/* TODO: Add team section, story, photos */}
        <div className="text-center p-12 rounded-3xl bg-hbm-gray-light">
          <p className="text-hbm-gray text-lg">
            🚧 Full About page content coming soon — team photos, our story, and more.
          </p>
        </div>
      </div>
    </section>
  )
}
