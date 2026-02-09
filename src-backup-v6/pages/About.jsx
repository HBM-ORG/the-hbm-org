import { useState } from 'react'
import { X } from 'lucide-react'
import { siteContent } from '../data/content'
import { useT } from '../i18n/useT'

const { about } = siteContent

function AboutHero() {
  const t = useT()
  return (
    <section className="section-padding bg-gradient-hero">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-blue mb-2">{t(about.hero.title)}</h2>
        <p className="text-hbm-dark font-semibold text-lg mb-8">{t(about.hero.subtitle)}</p>
        <h3 className="text-3xl md:text-5xl font-[var(--font-display)] text-hbm-dark mb-8">{t(about.hero.bigText)}</h3>
        <div className="text-hbm-gray text-lg leading-relaxed max-w-3xl mx-auto text-start">
          {t(about.hero.description).split('\n\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
        </div>
      </div>
    </section>
  )
}

function WordOfMonth() {
  const t = useT()
  return (
    <section className="py-16 bg-hbm-peach/30">
      <div className="max-w-2xl mx-auto text-center px-6">
        <p className="text-sm font-semibold text-hbm-coral uppercase tracking-wider mb-2">{t(about.wordOfMonth.title)}</p>
        <h3 className="text-5xl md:text-6xl font-[var(--font-display)] text-hbm-blue mb-4">{t(about.wordOfMonth.word)}</h3>
        <p className="text-hbm-gray text-lg">{t(about.wordOfMonth.description)}</p>
      </div>
    </section>
  )
}

function GuidingPrinciples() {
  const t = useT()
  return (
    <section className="section-padding bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-[var(--font-display)] text-hbm-blue text-center mb-10">{t(about.guidingPrinciples.title)}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {about.guidingPrinciples.items.map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-hbm-cream/50">
              <span className="text-3xl font-bold text-hbm-coral/30">{i + 1}</span>
              <p className="text-lg text-hbm-dark font-medium pt-1">{t(item)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function VisionSection() {
  const t = useT()
  return (
    <section className="section-padding">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-blue text-center mb-12">{t(about.vision.title)}</h2>
        <div className="relative rounded-2xl overflow-hidden mb-12">
          <video src={about.vision.video} autoPlay muted loop playsInline className="w-full h-[400px] object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center px-6">
            <p className="text-white text-2xl md:text-3xl font-[var(--font-display)] text-center max-w-3xl">{t(about.vision.textOnVideo)}</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {about.vision.cards.map((card, i) => (
            <div key={i} className="p-8 rounded-2xl card-hover" style={{ backgroundColor: card.bgColor }}>
              <p className="text-hbm-dark leading-relaxed">{t(card.text)}</p>
            </div>
          ))}
        </div>
        <h3 className="text-3xl md:text-4xl font-[var(--font-display)] text-center" dangerouslySetInnerHTML={{ __html: t(about.vision.bigTextBelow) }} />
      </div>
    </section>
  )
}

function TeamSection() {
  const [selected, setSelected] = useState(null)
  const t = useT()
  const members = about.team.members.filter(m => m.name && m.image)

  return (
    <section className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-blue mb-12">{t(about.team.title)}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {members.map((m, i) => (
            <div key={i} className="text-center cursor-pointer group" onClick={() => setSelected(m)}>
              <div className="aspect-square rounded-xl overflow-hidden mb-3 team-photo">
                <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-bold text-sm">{m.name}</h4>
              <p className="text-xs text-hbm-gray">{t(m.role)}</p>
            </div>
          ))}
          {/* Alex placeholder */}
          {about.team.members.find(m => m.name === 'Alex' && !m.image) && (
            <div className="text-center">
              <div className="aspect-square rounded-xl bg-gray-100 mb-3 flex items-center justify-center">
                <span className="text-4xl text-gray-300">👤</span>
              </div>
              <h4 className="font-bold text-sm">Alex</h4>
              <p className="text-xs text-hbm-gray">Coming soon</p>
            </div>
          )}
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
              <div className="flex items-start gap-4 mb-4">
                <img src={selected.image} alt={selected.name} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <h3 className="font-bold text-xl uppercase">{selected.name}</h3>
                  <p className="text-hbm-gray text-sm">{t(selected.role)}</p>
                </div>
              </div>
              {selected.nickname && <p className="font-bold italic text-hbm-coral mb-3">{selected.nickname}</p>}
              <p className="text-hbm-gray leading-relaxed">{t(selected.bio)}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function ValuesSection() {
  const t = useT()
  return (
    <section className="section-padding">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-blue text-center mb-12">{t(about.values.title)}</h2>
        {about.values.groups.map((group, gi) => (
          <div key={gi} className="relative rounded-2xl overflow-hidden mb-8 p-8 md:p-12" style={{ backgroundColor: group.bgColor || 'transparent' }}>
            {group.bgVideo && <video src={group.bgVideo} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover -z-10" />}
            {group.bgVideo && <div className="absolute inset-0 bg-white/70 -z-5" />}
            <div className="relative z-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.items.map((v, vi) => (
                <div key={vi} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 flex items-start gap-4 card-hover">
                  <img src={v.image} alt="" className="value-img" />
                  <div>
                    <h4 className="font-bold text-hbm-blue mb-1">{t(v.title)}</h4>
                    <p className="text-sm text-hbm-gray">{t(v.text)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ClosingStatement() {
  const t = useT()
  return (
    <section className="section-padding bg-hbm-cream/30">
      <div className="max-w-4xl mx-auto text-center text-2xl md:text-3xl font-[var(--font-display)] leading-relaxed">
        {t(about.closingStatement).split('\n\n').map((p, i) => <p key={i} className="mb-6">{p}</p>)}
      </div>
    </section>
  )
}

export default function About() {
  return (
    <>
      <AboutHero />
      <WordOfMonth />
      <GuidingPrinciples />
      <VisionSection />
      <TeamSection />
      <ValuesSection />
      <ClosingStatement />
    </>
  )
}
