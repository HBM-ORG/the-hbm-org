import { useState, useEffect } from 'react'
import { ArrowRight, Play, ExternalLink } from 'lucide-react'
import { siteContent } from '../data/content'
import { useI18n } from '../i18n/context'
import { useT } from '../i18n/useT'
import { getWhatsappUrl } from '../components/Layout'

const { home, global: g } = siteContent

function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0)
  const { lang } = useI18n()
  const t = useT()
  const words = lang === 'he' ? (home.hero.rotatingWordsHe || home.hero.rotatingWords) : home.hero.rotatingWords

  useEffect(() => {
    const interval = setInterval(() => setWordIndex((p) => (p + 1) % words.length), 2000)
    return () => clearInterval(interval)
  }, [words.length])

  return (
    <section className="section-padding text-center bg-gradient-hero overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center gap-4 md:gap-8 mb-10 flex-wrap">
          {home.hero.imagePairs.map((pair, i) => (
            <div key={i} className="flex items-center">
              <div className="video-circle" style={{ borderColor: pair.leftBorder }}>
                <video src={pair.left} autoPlay muted loop playsInline poster={pair.poster} />
              </div>
              <div className="video-circle -ml-3" style={{ borderColor: pair.rightBorder }}>
                <video src={pair.right} autoPlay muted loop playsInline poster={pair.poster} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-hbm-coral text-lg font-medium mb-2 h-7 word-rotate" key={wordIndex}>{words[wordIndex]}</p>
        <h1 className="text-5xl md:text-7xl font-[var(--font-display)] text-hbm-blue leading-tight mb-8">
          {t(home.hero.titlePrefix)}<span className="text-hbm-coral word-rotate" key={`w-${wordIndex}`}>{words[wordIndex]}</span>
          <br />{t(home.hero.titleSuffix)}
        </h1>
        <a href={getWhatsappUrl(lang)} target="_blank" rel="noopener noreferrer" className="btn-primary text-lg px-10 py-4">
          {t(home.hero.ctaText)}
        </a>
      </div>
    </section>
  )
}

function ConversationCards() {
  const t = useT()
  const { lang } = useI18n()
  const titles = home.conversationCards.titleLines[lang] || home.conversationCards.titleLines.en
  return (
    <section className="section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          {titles.map((line, i) => (
            <h2 key={i} className={`text-4xl md:text-5xl font-[var(--font-display)] leading-tight ${i === 0 ? 'text-hbm-dark' : i === 1 ? 'text-hbm-coral/60' : 'text-hbm-blue'}`}>{line}</h2>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {home.conversationCards.cards.map((card, i) => (
            <div key={i} className="p-8 rounded-2xl card-hover" style={{ backgroundColor: card.bgColor }}>
              <h4 className="font-bold text-hbm-dark text-lg mb-2">{t(card.title)}</h4>
              <p className="text-hbm-dark/80">{t(card.text)}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <a href={getWhatsappUrl(lang)} target="_blank" rel="noopener noreferrer" className="btn-outline">
            {t(home.conversationCards.ctaText)} <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  )
}

function BannerSection() {
  const t = useT()
  const { lang } = useI18n()
  return (
    <section className="relative overflow-hidden">
      <div className="relative">
        <video src={home.banner.video} autoPlay muted loop playsInline className="w-full h-[500px] object-cover" />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center px-6">
          <h2 className="text-4xl md:text-5xl font-[var(--font-display)] mb-4">{t(home.banner.title)}</h2>
          <p className="text-xl md:text-2xl font-semibold mb-4" dangerouslySetInnerHTML={{ __html: t(home.banner.textHtml) }} />
          <p className="text-base md:text-lg opacity-80 max-w-2xl mb-8">{t(home.banner.description)}</p>
          <a href={getWhatsappUrl(lang)} target="_blank" rel="noopener noreferrer" className="btn-primary text-lg px-10 py-4">{t(home.banner.ctaText)}</a>
        </div>
      </div>
      {/* Elad's YouTube video */}
      <div className="bg-hbm-dark py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-[var(--font-display)] text-white mb-8">{t(home.banner.eladVideoTitle)}</h3>
          <div className="relative rounded-2xl overflow-hidden aspect-video">
            <iframe
              src="https://www.youtube.com/embed/R7smYF02Kjo"
              title="Why 8 Minutes - The HBM"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <a href="https://www.youtube.com/@TheHBM" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 text-white/70 hover:text-white transition-colors text-sm">
            {t({ en: 'Watch more on our YouTube channel →', he: 'צפו בעוד בערוץ היוטיוב שלנו →' })}
          </a>
        </div>
      </div>
    </section>
  )
}

function EliVideoSection() {
  const t = useT()
  if (!home.eliVideo.videoUrl || home.eliVideo.videoUrl === 'PLACEHOLDER_ELI_VIDEO_URL') {
    return (
      <section className="section-padding bg-hbm-cream/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-[var(--font-display)] text-hbm-blue mb-6">{t(home.eliVideo.title)}</h2>
          <div className="aspect-video rounded-2xl bg-gray-200 flex items-center justify-center">
            <p className="text-hbm-gray">Video coming soon</p>
          </div>
          <p className="mt-4 text-hbm-gray">{t(home.eliVideo.description)}</p>
        </div>
      </section>
    )
  }
  return null
}

function HowItWorks() {
  const [activeTab, setActiveTab] = useState('video')
  const t = useT()
  const section = activeTab === 'video' ? home.howItWorks.videoSteps : home.howItWorks.physicalSteps

  return (
    <section className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-blue text-center mb-4">{t(home.howItWorks.title)}</h2>
        <p className="text-center text-hbm-gray max-w-2xl mx-auto mb-8 font-semibold">{t(home.howItWorks.subtitle)}</p>

        {/* Toggle Video / Physical */}
        <div className="flex justify-center gap-4 mb-12">
          {['video', 'physical'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${activeTab === tab ? 'bg-hbm-blue text-white' : 'bg-gray-100 text-hbm-dark hover:bg-gray-200'}`}>
              {t(tab === 'video' ? home.howItWorks.videoSteps.title : home.howItWorks.physicalSteps.title)}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {section.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-hbm-blue/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-hbm-blue font-bold text-lg">{i + 1}</span>
                </div>
                <p className="text-lg text-hbm-dark pt-2">{t(step.text)}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <img src={home.howItWorks.phoneMockup} alt="HBM App" className="phone-mockup" />
          </div>
        </div>
      </div>
    </section>
  )
}

function Guidelines() {
  const t = useT()
  return (
    <section className="section-padding bg-hbm-cream/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-[var(--font-display)] text-center mb-4">{t(home.guidelines.title)}</h2>
        <p className="text-center text-hbm-gray max-w-3xl mx-auto mb-14">{t(home.guidelines.subtitle)}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {home.guidelines.items.map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl card-hover">
              <img src={item.icon} alt="" className="guideline-icon mb-4" />
              <h4 className="font-bold text-hbm-dark mb-2">{t(item.title)}</h4>
              <p className="text-sm text-hbm-gray leading-relaxed">{t(item.text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ClientLogos() {
  const logos = g.clientLogos.filter(l => l.logo)
  if (logos.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-hbm-gray/40 text-sm">Partner logos coming soon</p>
          <div className="flex justify-center gap-8 mt-6 flex-wrap">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="w-24 h-12 rounded bg-gray-100" />
            ))}
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-center gap-10 flex-wrap items-center">
          {logos.map((l, i) => <img key={i} src={l.logo} alt={l.name} className="h-10 opacity-60 hover:opacity-100 transition-opacity" />)}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <ConversationCards />
      <BannerSection />
      <EliVideoSection />
      <HowItWorks />
      <Guidelines />
      <ClientLogos />
    </>
  )
}
