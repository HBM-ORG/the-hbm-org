import { motion } from 'framer-motion'
import { Building2, GraduationCap, Users, Landmark, ArrowRight } from 'lucide-react'
import { siteConfig } from '../data/content'

const segments = [
  {
    icon: Building2,
    title: 'Companies',
    description: 'Build team culture and boost employee engagement with meaningful 1-on-1 conversations.',
    color: 'bg-hbm-blue/10 text-hbm-blue',
  },
  {
    icon: GraduationCap,
    title: 'Universities',
    description: 'Help students connect, network, and build community across departments and campuses.',
    color: 'bg-hbm-coral/10 text-hbm-coral',
  },
  {
    icon: Users,
    title: 'Communities & NGOs',
    description: 'Strengthen community bonds and create inclusive spaces for dialogue and connection.',
    color: 'bg-hbm-lavender/20 text-hbm-purple',
  },
  {
    icon: Landmark,
    title: 'Events & Conferences',
    description: 'Add a unique networking experience to your event. Attendees meet real people, not just business cards.',
    color: 'bg-hbm-peach/40 text-hbm-coral-dark',
  },
]

export default function B2B() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h1
          className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-blue mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          HBM for Your Organization
        </motion.h1>
        <motion.p
          className="text-xl text-hbm-gray text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Bring the power of real human connection to your team, campus, community, or event.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {segments.map((seg, i) => (
            <motion.div
              key={i}
              className="p-8 rounded-3xl bg-white border border-gray-100 card-hover"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={`w-14 h-14 rounded-2xl ${seg.color} flex items-center justify-center mb-5`}>
                <seg.icon size={28} />
              </div>
              <h3 className="text-2xl font-[var(--font-display)] text-hbm-dark mb-3">{seg.title}</h3>
              <p className="text-hbm-gray leading-relaxed mb-5">{seg.description}</p>
              <a
                href={`mailto:${siteConfig.email}?subject=B2B Inquiry - ${seg.title}`}
                className="text-hbm-blue font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
              >
                Get in Touch <ArrowRight size={16} />
              </a>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center p-12 rounded-3xl bg-hbm-cream">
          <h2 className="text-3xl font-[var(--font-display)] text-hbm-dark mb-4">
            Ready to Bring HBM to Your Organization?
          </h2>
          <p className="text-hbm-gray mb-8 max-w-xl mx-auto">
            Let's discuss how 8-minute conversations can transform your team's culture and connection.
          </p>
          <a
            href={`mailto:${siteConfig.email}?subject=B2B Partnership Inquiry`}
            className="btn-primary"
          >
            Contact Us <ArrowRight className="inline ml-2" size={18} />
          </a>
        </div>
      </div>
    </section>
  )
}
