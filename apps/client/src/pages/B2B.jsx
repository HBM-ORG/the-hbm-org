import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { siteContent } from '../data/content'
import { useI18n } from '../i18n/context'
import { useT } from '../i18n/useT'
import { getWhatsappUrl } from '../components/Layout'

const { b2b, global: g } = siteContent

function B2BHero() {
  const t = useT()
  return (
    <section className="section-padding bg-hbm-dark text-white text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-[var(--font-display)] mb-6">{t(b2b.headline)}</h1>
        <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">{t(b2b.description)}</p>
      </div>
    </section>
  )
}

function TabsSection() {
  const [activeTab, setActiveTab] = useState(0)
  const t = useT()
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[550px]">
        <video key={b2b.tabs[activeTab].bgVideo} src={b2b.tabs[activeTab].bgVideo} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 section-padding">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-3 mb-12 justify-center">
              {b2b.tabs.map((tab, i) => (
                <button key={i} onClick={() => setActiveTab(i)}
                  className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${i === activeTab ? 'bg-white text-hbm-dark' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {t(tab.label)}
                </button>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {b2b.tabs[activeTab].cards.map((card, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-2xl text-white border border-white/10">
                  <h3 className="text-xl font-bold mb-3">{t(card.title)}</h3>
                  <p className="text-white/80 leading-relaxed">{t(card.text)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AdminFlow() {
  const t = useT()
  return (
    <section className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-[var(--font-display)] text-hbm-blue text-center mb-4">{t(b2b.adminFlow.title)}</h2>
        <p className="text-center text-hbm-gray mb-12 max-w-2xl mx-auto">{t(b2b.adminFlow.subtitle)}</p>
        <div className="grid md:grid-cols-4 gap-8">
          {b2b.adminFlow.steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 rounded-full bg-hbm-blue/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-hbm-blue">{i + 1}</span>
              </div>
              <h4 className="font-bold text-hbm-dark mb-2">{t(step.title)}</h4>
              <p className="text-sm text-hbm-gray">{t(step.text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ThriveStatement() {
  const t = useT()
  return (
    <section className="section-padding bg-hbm-cream/30">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-[var(--font-display)] text-hbm-dark mb-4">{t(b2b.thriveStatement.bigTitle)}</h2>
        <p className="text-lg text-hbm-gray">{t(b2b.thriveStatement.smallTitle)}</p>
      </div>
    </section>
  )
}

function StepsSection() {
  const t = useT()
  return (
    <section className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-[var(--font-display)] text-center mb-2">{t(b2b.steps.title)}</h2>
        <p className="text-center text-hbm-dark font-bold text-xl mb-14">{t(b2b.steps.subtitle)}</p>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {b2b.steps.items.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-hbm-coral/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-hbm-coral">{i + 1}</span>
                </div>
                <div>
                  <h4 className="font-bold text-hbm-dark mb-1">{t(step.title)}</h4>
                  <p className="text-hbm-gray">{t(step.text)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <img src={b2b.steps.phoneMockup} alt="HBM Platform" className="phone-mockup" />
          </div>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  const t = useT()
  const { lang } = useI18n()
  return (
    <section className="section-padding bg-hbm-blue text-white text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-[var(--font-display)] mb-3">{t(b2b.cta.title)}</h2>
        <p className="text-xl mb-8 text-white/80">{t(b2b.cta.subtitle)}</p>
        <a href={getWhatsappUrl(lang)} target="_blank" rel="noopener noreferrer" className="btn-primary text-lg px-10 py-4 bg-white text-hbm-blue hover:bg-gray-100">
          {t(b2b.cta.ctaText)} <ArrowRight size={20} />
        </a>
      </div>
    </section>
  )
}

export default function B2B() {
  return (
    <>
      <B2BHero />
      <TabsSection />
      <AdminFlow />
      <ThriveStatement />
      <StepsSection />
      <CTASection />
    </>
  )
}
