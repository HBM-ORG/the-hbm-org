import { useI18n, t } from '../i18n/context'
import EyebrowBadge from '../components/EyebrowBadge'
import BubbleContainer from '../components/BubbleContainer'
import NextPageBridge from '../components/NextPageBridge'
import IceBreakerCard from '../components/IceBreakerCard'
import MeasureTheMagic from '../components/MeasureTheMagic'
import SmartMatchingZone from '../components/SmartMatchingZone'
import EmotionMatrixMockup from '../components/EmotionMatrixMockup'
import CustomLocationsMockup from '../components/CustomLocationsMockup'
import CustomizeMeeter from '../components/CustomizeMeeter'
import { Palette, Type, Tag, MessageCircle } from 'lucide-react'
import { siteContent } from '../data/content'

export default function MeeterFeatures() {
  const { lang } = useI18n()
  const features = siteContent.home.features

  return (
    <div className="min-h-screen bg-hbm-cream">
      {/* Hero */}
      <section className="bg-hbm-cream pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="mb-6">
            <EyebrowBadge text="THE MEETER - FEATURES" />
          </div>
          <h1
            className="text-4xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] bg-clip-text text-transparent"
            style={{ letterSpacing: '-2px' }}
          >
            {t(features.sectionTitle, lang)}
          </h1>
          <p className="text-xl text-hbm-gray">
            {t({ en: 'See what makes Meeter special.', he: 'ראו מה הופך את Meeter למיוחד.' }, lang)}
          </p>
        </div>
      </section>

      {/* Section 1: Ice-Breakers (Text Left, Visual Right) */}
      <section className="bg-hbm-cream py-12">
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-hbm-dark mb-4">
            {t(features.iceBreakers.title, lang)}
          </h2>
        </div>
        <BubbleContainer bgColor="white">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
            {/* Text Content */}
            <div className="space-y-6">
              <p className="text-lg text-hbm-gray leading-relaxed">
                {t(features.iceBreakers.description, lang)}
              </p>
              <ul className="space-y-4">
                {features.iceBreakers.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-hbm-orange text-2xl flex-shrink-0">✓</span>
                    <span className="text-hbm-dark font-medium">{t(bullet, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive Card */}
            <div>
              <IceBreakerCard />
            </div>
          </div>
        </BubbleContainer>
      </section>

      {/* Section 2: Measure the Magic (Visual Left, Text Right) */}
      <section className="bg-hbm-cream py-12">
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-hbm-dark mb-4">
            {t(features.liveData.title, lang)}
          </h2>
        </div>
        <BubbleContainer bgColor="#FAF9F5">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
            {/* Dashboard Visual */}
            <div className="order-2 md:order-1">
              <MeasureTheMagic />
            </div>

            {/* Text Content */}
            <div className="space-y-6 order-1 md:order-2">
              <p className="text-lg text-hbm-gray leading-relaxed">
                {t(features.liveData.description, lang)}
              </p>
              <ul className="space-y-4">
                {features.liveData.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-hbm-purple text-2xl flex-shrink-0">✓</span>
                    <span className="text-hbm-dark font-medium">{t(bullet, lang)}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-white rounded-xl p-4 border-l-4 border-hbm-orange">
                <p className="text-sm text-hbm-gray">
                  <strong className="text-hbm-dark">
                    {t({ en: 'Live & Post-Event:', he: 'חי ואחרי האירוע:' }, lang)}
                  </strong>{' '}
                  {t(
                    {
                      en: 'Access these insights during the event and download comprehensive reports afterwards.',
                      he: 'גישה לתובנות אלה במהלך האירוע והורדת דוחות מקיפים אחר כך.',
                    },
                    lang
                  )}
                </p>
              </div>
            </div>
          </div>
        </BubbleContainer>
      </section>

      {/* Section 3: Smart Matching (Text Left, Visual Right) */}
      <section className="bg-hbm-cream py-12">
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-hbm-dark mb-4">
            {t(features.matchingZone.title, lang)}
          </h2>
        </div>
        <BubbleContainer bgColor="white">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
            {/* Text Content */}
            <div className="space-y-6">
              <p className="text-lg text-hbm-gray leading-relaxed">
                {t(features.matchingZone.description, lang)}
              </p>
              <ul className="space-y-4">
                {features.matchingZone.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-hbm-green text-2xl flex-shrink-0">✓</span>
                    <span className="text-hbm-dark font-medium">{t(bullet, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Matching UI */}
            <div>
              <SmartMatchingZone />
            </div>
          </div>
        </BubbleContainer>
      </section>

      {/* Section 3.5: Emotion Matrix (Visual Left, Text Right) */}
      <section className="bg-hbm-cream py-12">
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-hbm-dark mb-4">
            {t(features.emotionMatrix.title, lang)}
          </h2>
        </div>
        <BubbleContainer bgColor="#FAF9F5">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
            {/* Phone Mockup Matrix */}
            <div className="order-2 md:order-1">
              <EmotionMatrixMockup />
            </div>

            {/* Text Content */}
            <div className="space-y-6 order-1 md:order-2">
              <p className="text-lg text-hbm-gray leading-relaxed">
                {t(features.emotionMatrix.description, lang)}
              </p>
              <ul className="space-y-4">
                {features.emotionMatrix.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-hbm-purple text-2xl flex-shrink-0">✓</span>
                    <span className="text-hbm-dark font-medium">{t(bullet, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </BubbleContainer>
      </section>

      {/* Section 3.6: Custom Locations (Text Left, Visual Right) */}
      <section className="bg-hbm-cream py-12">
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-hbm-dark mb-4">
            {t(features.customLocations.title, lang)}
          </h2>
        </div>
        <BubbleContainer bgColor="white">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
            {/* Text Content */}
            <div className="space-y-6">
              <p className="text-lg text-hbm-gray leading-relaxed">
                {t(features.customLocations.description, lang)}
              </p>
              <ul className="space-y-4">
                {features.customLocations.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-[#6160AB] text-2xl flex-shrink-0">✓</span>
                    <span className="text-hbm-dark font-medium">{t(bullet, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Phone Mockup */}
            <div className="flex justify-center">
              <CustomLocationsMockup />
            </div>
          </div>
        </BubbleContainer>
      </section>

      {/* Section 4: Customize Meeter (Text Left, Visual Right) */}
      <section className="bg-hbm-cream py-12">
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-hbm-dark mb-4">
            {t({ en: 'Customize Your Meeter', he: 'התאימו אישית את ה-Meeter שלכם' }, lang)}
          </h2>
        </div>
        <BubbleContainer bgColor="white">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
            {/* Phone Mockup */}
            <div className="flex justify-center">
              <CustomizeMeeter imageSrc="/assets/logo.png" />
            </div>

            {/* Text Content */}
            <div className="space-y-6 order-1 md:order-2">
              <p className="text-lg text-hbm-gray leading-relaxed">
                {t(
                  {
                    en: 'Make Meeter truly yours. Customize the experience to match your brand and event needs.',
                    he: 'הפכו את Meeter לשלכם באמת. התאימו אישית את החוויה כדי להתאים למותג ולצרכי האירוע שלכם.',
                  },
                  lang
                )}
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="w-12 h-12 rounded-full bg-[#fbd5c1]/30 flex items-center justify-center flex-shrink-0">
                    <Palette size={24} className="text-[#F07B3C]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-hbm-dark text-lg mb-1">{t({ en: 'Custom Logo', he: 'לוגו מותאם' }, lang)}</h4>
                    <p className="text-gray-600 leading-relaxed font-medium">{t({ en: 'Upload your brand logo', he: 'העלו את הלוגו של המותג שלכם' }, lang)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="w-12 h-12 rounded-full bg-[#bbc0ff]/30 flex items-center justify-center flex-shrink-0">
                    <Type size={24} className="text-[#6160AB]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-hbm-dark text-lg mb-1">{t({ en: 'Event Title', he: 'כותרת אירוע' }, lang)}</h4>
                    <p className="text-gray-600 leading-relaxed font-medium">{t({ en: 'Personalize the event name', he: 'התאימו אישית את שם האירוע' }, lang)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="w-12 h-12 rounded-full bg-[#fbd5c1]/30 flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={24} className="text-[#F07B3C]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-hbm-dark text-lg mb-1">{t({ en: 'Ice-Breakers & Tips', he: 'שוברי קרח וטיפים' }, lang)}</h4>
                    <p className="text-gray-600 leading-relaxed font-medium">{t({ en: 'Personalize questions to match your theme', he: 'התאימו את השאלות והטיפים לנושא האירוע' }, lang)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="w-12 h-12 rounded-full bg-[#d8eecf]/30 flex items-center justify-center flex-shrink-0">
                    <Tag size={24} className="text-[#73C154]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-hbm-dark text-lg mb-1">{t({ en: 'Custom Interests', he: 'תחומי עניין מותאמים' }, lang)}</h4>
                    <p className="text-gray-600 leading-relaxed font-medium">{t({ en: 'Define your own interest tags', he: 'הגדירו תגיות עניין משלכם' }, lang)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BubbleContainer>
      </section>

      {/* Bridge to Events */}
      <NextPageBridge
        to="/events"
        eyebrow={{ en: 'Experience It', he: 'חוו את זה' }}
        title={features.bridge.buttonText}
        description={{
          en: 'Join our upcoming events and see the magic of genuine connection in action.',
          he: 'הצטרפו לאירועים הקרובים שלנו וראו את הקסם של חיבור אמיתי בפעולה.',
        }}
        buttonText={features.bridge.buttonText}
      />
    </div>
  )
}
