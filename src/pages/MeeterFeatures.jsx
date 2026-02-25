import { useI18n, t } from '../i18n/context'
import EyebrowBadge from '../components/EyebrowBadge'
import BubbleContainer from '../components/BubbleContainer'
import NextPageBridge from '../components/NextPageBridge'
import IceBreakerCard from '../components/IceBreakerCard'
import MeasureTheMagic from '../components/MeasureTheMagic'
import SmartMatchingZone from '../components/SmartMatchingZone'
import EmotionMatrixMockup from '../components/EmotionMatrixMockup'
import CustomLocationsMockup from '../components/CustomLocationsMockup'
import ConnectionCardMockup from '../components/ConnectionCardMockup'
import CustomizeMeeter from '../components/CustomizeMeeter'
import { Palette, Type, Tag, MessageCircle, Share2 } from 'lucide-react'
import { siteContent } from '../data/content'
import SEO from '../components/SEO'

export default function MeeterFeatures() {
  const { lang } = useI18n()
  const features = siteContent.home.features

  return (
    <div className="min-h-screen bg-hbm-cream">
      <SEO />
      {/* Hero */}
      <section className="bg-hbm-cream pt-24 pb-20">
        <div className="max-w-6xl mx-auto text-center px-6">
          <div className="mb-8 flex justify-center">
            <EyebrowBadge text="THE MEETER - FEATURES" />
          </div>
          <h1
            className="text-4xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] bg-clip-text text-transparent font-['Sora'] leading-[1.05] tracking-tight max-w-5xl mx-auto"
            style={{ letterSpacing: '-2px' }}
          >
            {t(features.sectionTitle, lang)}
          </h1>
          <p className="text-xl md:text-2xl text-hbm-gray font-['Sora'] max-w-2xl mx-auto">
            {t({ en: 'See what makes Meeter special.', he: 'ראו מה הופך את Meeter למיוחד.' }, lang)}
          </p>
        </div>
      </section>

      {/* Section 1: Customize Meeter (Text Left, Visual Right) */}
      <section className="bg-hbm-cream py-8">
        <div className="max-w-6xl mx-auto px-6 mb-8 text-center">
          <h2 className="text-[32px] md:text-[58px] font-semibold text-hbm-dark font-['Sora'] tracking-tight">
            {t({ en: 'Brand Your Experience', he: 'מתגו את החוויה שלכם' }, lang)}
          </h2>
        </div>
        <BubbleContainer bgColor="white" fullHeight={false}>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
            {/* Phone Mockup Branding */}
            <div className="flex justify-center">
              <CustomizeMeeter imageSrc="/assets/logo.png" />
            </div>

            {/* Content Area */}
            <div className="space-y-6">
              <p className="text-lg md:text-[22px] text-hbm-gray leading-relaxed font-['Sora'] mb-4">
                {t(
                  { 
                    en: 'Every event manager or community organizer can fully customize the Meeter experience to fit their unique vision and identity.', 
                    he: 'כל מנהל אירוע או קהילה יכול לעצב ולהתאים אישית את חוויית ה-Meeter במלואה כדי שתתאים בדיוק לחזון ולזהות שלו.' 
                  }, 
                  lang
                )}
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="w-12 h-12 rounded-full bg-[#fbd5c1]/30 flex items-center justify-center flex-shrink-0">
                    <Palette size={24} className="text-[#F07B3C]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-hbm-dark text-lg mb-1 font-['Sora']">{t({ en: 'Logo & Event Title', he: 'לוגו ושם אירוע' }, lang)}</h4>
                    <p className="text-gray-600 font-medium font-['Sora']">{t({ en: 'Your brand, your name. Display your logo and unique event title throughout the platform.', he: 'המותג שלכם, השם שלכם. הציגו את הלוגו ושם האירוע הייחודי שלכם לאורך כל החוויה.' }, lang)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="w-12 h-12 rounded-full bg-[#bbc0ff]/30 flex items-center justify-center flex-shrink-0">
                    <Type size={24} className="text-[#6160AB]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-hbm-dark text-lg mb-1 font-['Sora']">{t({ en: 'Custom Matching Zones', he: 'מיקומי מפגש מותאמים' }, lang)}</h4>
                    <p className="text-gray-600 font-medium font-['Sora']">{t({ en: 'Rename matching zones to highlight sponsor areas or specific physical spots.', he: 'שנו את שמות אזורי המפגש כדי להבליט נותני חסות או נקודות פיזיות ספציפיות.' }, lang)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="w-12 h-12 rounded-full bg-[#d8eecf]/30 flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={24} className="text-[#73C154]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-hbm-dark text-lg mb-1 font-['Sora']">{t({ en: 'Tailored Ice-Breakers', he: 'שוברי קרח מותאמים' }, lang)}</h4>
                    <p className="text-gray-600 font-medium font-['Sora']">{t({ en: 'Set the tone with guided questions designed specifically for your community vibe.', he: 'קבעו את הטון עם שאלות מונחות שעוצבו במיוחד לאווירה של הקהילה שלכם.' }, lang)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="w-12 h-12 rounded-full bg-[#fbd5c1]/30 flex items-center justify-center flex-shrink-0">
                    <Tag size={24} className="text-[#F07B3C]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-hbm-dark text-lg mb-1 font-['Sora']">{t({ en: 'Personalized Interests', he: 'תחומי עניין אישיים' }, lang)}</h4>
                    <p className="text-gray-600 font-medium font-['Sora']">{t({ en: 'Define your own interest tags and stickers that drive high-quality connections.', he: 'הגדירו תגיות עניין ומדבקות משלכם שמובילות לחיבורים איכותיים ומדויקים.' }, lang)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BubbleContainer>
      </section>

      {/* Section 2: Personalized Interests & Algorithm (Text Left, Visual Right) */}
      <section className="bg-hbm-cream py-8">
        <div className="max-w-6xl mx-auto px-6 mb-8 text-center">
          <h2 className="text-[32px] md:text-[58px] font-semibold text-hbm-dark font-['Sora'] tracking-tight">
            {t(features.matchingZone.title, lang)}
          </h2>
        </div>
        <BubbleContainer bgColor="#FAF9F5" fullHeight={false}>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
            <div className="order-1 md:order-2">
              <SmartMatchingZone />
            </div>
            <div className="space-y-6 order-2 md:order-1">
              <p className="text-lg md:text-[22px] text-hbm-gray font-['Sora'] leading-relaxed">
                {t(features.matchingZone.description, lang)}
              </p>
              <p className="text-lg md:text-[22px] text-hbm-purple font-black leading-relaxed border-r-4 border-hbm-purple/30 pr-4 italic font-['Sora']">
                {t(
                  { 
                    en: 'While we use a smart interest-based algorithm, we also strongly believe in the magic of randomness — because you never know where your next big opportunity might come from.', 
                    he: 'לצד אלגוריתם חכם מבוסס תחומי עניין, אנחנו מאמינים גדולים גם בקסם של רנדומליות – כי אף פעם אי אפשר לדעת מאיפה תגיע ההזדמנות הגדולה הבאה.' 
                  }, 
                  lang
                )}
              </p>
              <ul className="space-y-4 font-['Sora']">
                {features.matchingZone.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-hbm-green/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-hbm-green text-sm font-bold">✓</span>
                    </div>
                    <span className="text-hbm-dark font-semibold">{t(bullet, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </BubbleContainer>
      </section>

      {/* Section 3: Ice-Breakers (Text Left, Visual Right) */}
      <section className="bg-hbm-cream py-8">
        <div className="max-w-6xl mx-auto px-6 mb-8 text-center">
          <h2 className="text-[32px] md:text-[58px] font-semibold text-hbm-dark font-['Sora'] tracking-tight">
            {t(features.iceBreakers.title, lang)}
          </h2>
        </div>
        <BubbleContainer bgColor="white" fullHeight={false}>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
            <div className="order-1 md:order-2">
              <IceBreakerCard />
            </div>
            <div className="space-y-6 order-2 md:order-1">
              <p className="text-lg md:text-[22px] text-hbm-gray leading-relaxed font-['Sora']">
                {t(features.iceBreakers.description, lang)}
              </p>
              <ul className="space-y-4 font-['Sora']">
                {features.iceBreakers.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-hbm-orange/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-hbm-orange text-sm font-bold">✓</span>
                    </div>
                    <span className="text-hbm-dark font-semibold">{t(bullet, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </BubbleContainer>
      </section>

      {/* Section 4: Custom Matching Points - Physical Experience */}
      <section className="bg-hbm-cream py-8">
        <div className="max-w-6xl mx-auto px-6 mb-8 text-center">
          <h2 className="text-[32px] md:text-[58px] font-semibold text-hbm-dark font-['Sora'] tracking-tight">
            {t(features.customLocations.title, lang)}
          </h2>
        </div>
        <BubbleContainer bgColor="#FAF9F5" fullHeight={false}>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
            <div className="order-1 flex justify-center">
              <CustomLocationsMockup />
            </div>
            <div className="space-y-6 order-2">
              <p className="text-lg md:text-[22px] text-hbm-gray leading-relaxed font-['Sora']">
                {t(features.customLocations.description, lang)}
              </p>
              <ul className="space-y-4 font-['Sora']">
                {features.customLocations.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#6160AB]/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#6160AB] text-sm font-bold">✓</span>
                    </div>
                    <span className="text-hbm-dark font-semibold">{t(bullet, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </BubbleContainer>
      </section>

      {/* Section 4.5: Stay in Touch (Text Left, Visual Right) - Digital Exchange */}
      <section className="bg-hbm-cream py-8">
        <div className="max-w-6xl mx-auto px-6 mb-8 text-center">
          <h2 className="text-[32px] md:text-[58px] font-semibold text-hbm-dark font-['Sora'] tracking-tight">
            {t({ en: 'Stay in Touch', he: 'שומרים על קשר' }, lang)}
          </h2>
        </div>
        <BubbleContainer bgColor="white" fullHeight={false}>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
            <div className="order-1 md:order-2">
              <ConnectionCardMockup />
            </div>
            <div className="space-y-6 order-2 md:order-1">
              <p className="text-lg md:text-[22px] text-hbm-gray leading-relaxed font-['Sora']">
                {t({ en: 'The connection continues after the session. If both of you want to stay in touch, you can instantly exchange digital cards with your preferred social and contact details.', he: 'הקשר ממשיך גם אחרי המפגש. אם שניכם מעוניינים להישאר בקשר, תוכלו להחליף כרטיסי חיבור דיגיטליים באופן מיידי עם הפרטים שבחרתם לשתף.' }, lang)}
              </p>
              <ul className="space-y-4 font-['Sora']">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-hbm-orange/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-hbm-orange text-sm font-bold">✓</span>
                  </div>
                  <span className="text-hbm-dark font-semibold">{t({ en: 'Mutual consent connection', he: 'חיבור בהסכמה הדדית בלבד' }, lang)}</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-hbm-orange/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-hbm-orange text-sm font-bold">✓</span>
                  </div>
                  <span className="text-hbm-dark font-semibold">{t({ en: 'Choose what to share: WhatsApp, Instagram, or Email', he: 'בחרו מה לשתף: וואטסאפ, אינסטגרם או מייל' }, lang)}</span>
                </li>
              </ul>
            </div>
          </div>
        </BubbleContainer>
      </section>

      {/* Section 5: Live Data (Visual Left, Text Right) */}
      <section className="bg-hbm-cream py-8">
        <div className="max-w-6xl mx-auto px-6 mb-8 text-center">
          <h2 className="text-[32px] md:text-[58px] font-semibold text-hbm-dark font-['Sora'] tracking-tight">
            {t(features.liveData.title, lang)}
          </h2>
        </div>
        <BubbleContainer bgColor="white" fullHeight={false}>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
            <div className="order-1">
              <MeasureTheMagic />
            </div>
            <div className="space-y-6 order-2">
              <p className="text-lg md:text-[22px] text-hbm-gray leading-relaxed font-['Sora']">
                {t(features.liveData.description, lang)}
              </p>
              <ul className="space-y-4 font-['Sora']">
                {features.liveData.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#73C154]/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#73C154] text-sm font-bold">✓</span>
                    </div>
                    <span className="text-hbm-dark font-semibold">{t(bullet, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </BubbleContainer>
      </section>

      {/* Section 6: Emotion Matrix (Visual Left, Text Right) */}
      <section className="bg-hbm-cream py-8 pb-16">
        <div className="max-w-6xl mx-auto px-6 mb-8 text-center">
          <h2 className="text-[32px] md:text-[58px] font-semibold text-hbm-dark font-['Sora'] tracking-tight">
            {t(features.emotionMatrix.title, lang)}
          </h2>
        </div>
        <BubbleContainer bgColor="#FAF9F5" fullHeight={false}>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
            <div className="order-1">
              <EmotionMatrixMockup />
            </div>
            <div className="space-y-6 order-2">
              <p className="text-lg md:text-[22px] text-hbm-gray font-['Sora'] leading-relaxed">
                {t(features.emotionMatrix.description, lang)}
              </p>
              <ul className="space-y-4 font-['Sora']">
                {features.emotionMatrix.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-hbm-purple/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-hbm-purple text-sm font-bold">✓</span>
                    </div>
                    <span className="text-hbm-dark font-semibold">{t(bullet, lang)}</span>
                  </li>
                ))}
              </ul>
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
