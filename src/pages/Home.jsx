import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MacbookScroll } from "../components/ui/MacbookScroll";
import { siteContent } from "../data/content";
import { useI18n, t } from "../i18n/context";
import { ui } from "../i18n/translations";
import { getWhatsappUrl } from "../components/Layout";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import {
  AnimatedHero,
  Why8Minutes,
  QuoteCarousel,
  InteractiveCard,
  PhilosophyQuote,
  ManifestoSection,
  Guidelines,
  HowItWorks,
} from "../components/Home";
import BubbleContainer from "../components/BubbleContainer";
import NextPageBridge from "../components/NextPageBridge";
import EyebrowBadge from "../components/EyebrowBadge";
import { Quote, Star } from "lucide-react";
import SEO from "../components/SEO";
import { getApiBase } from "../utils/api";

const WP = "https://www.thehbm.org/wp-content/uploads";
const { home, global } = siteContent;

const partnerLogos = [
  { name: "Partner 1", src: "/partner-logos/44.png" },
  { name: "Partner 2", src: "/partner-logos/45.png" },
  { name: "Partner 3", src: "/partner-logos/46.png" },
  { name: "Partner 4", src: "/partner-logos/47.png" },
  { name: "Partner 5", src: "/partner-logos/48.png" },
  { name: "Partner 6", src: "/partner-logos/49.png" },
  { name: "Partner 7", src: "/partner-logos/50.png" },
  { name: "Partner 8", src: "/partner-logos/51.png" },
  { name: "Partner 9", src: "/partner-logos/52.png" },
  { name: "Partner 10", src: "/partner-logos/53.png" },
  { name: "Partner 11", src: "/partner-logos/54.png" },
  { name: "Partner 12", src: "/partner-logos/55.png" },
  { name: "Partner 13", src: "/partner-logos/56.png" },
];

const dailyQuotes = [
  {
    text: "We cannot live only for ourselves. A thousand fibers connect us.",
    author: "Herman Melville",
  },
  {
    text: "The meeting of two personalities is like the contact of two chemical substances.",
    author: "Carl Jung",
  },
  {
    text: "Connection is why we're here. It gives purpose and meaning to our lives.",
    author: "Brené Brown",
  },
  { text: "Your thoughts create your reality.", author: "Bob Proctor" },
  {
    text: "Every achievement starts with a burning desire.",
    author: "Napoleon Hill",
  },
  { text: "What you think, you become.", author: "Buddha" },
  {
    text: "The best way to predict the future is to create it.",
    author: "Abraham Lincoln",
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
  },
];

const OpportunityWord = ({ lang }) => {
  const wordsEn = [
    "Opportunity",
    "Connection",
    "Partner",
    "Deal",
    "Friend",
    "Mentor",
    "Study Buddy",
    "Coffee Mate",
    "Venture",
    "Community",
    "Job",
    "Date",
  ];
  const wordsHe = [
    "הזדמנות",
    "שותף",
    "עסקה",
    "חבר",
    "מנטור",
    "שותף ללימודים",
    "שותף לקפה",
    "מיזם",
    "קהילה",
    "עבודה",
    "דייט",
  ];
  const [idx, setIdx] = useState(0);
  const list = lang === "he" || lang === "ar" ? wordsHe : wordsEn;

  useEffect(() => {
    const timer = setInterval(
      () => setIdx((prev) => (prev + 1) % list.length),
      2000,
    );
    return () => clearInterval(timer);
  }, [list.length]);

  return (
    <motion.p
      key={idx}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="text-4xl sm:text-6xl md:text-7xl lg:text-[10rem] font-black text-hbm-orange leading-none drop-shadow-2xl word-break break-words overflow-hidden"
      style={{ letterSpacing: "-0.05em", maxWidth: "100vw" }}
    >
      {list[idx]}
    </motion.p>
  );
};

const whyCards = [
  {
    title: {
      en: "Master the art of human connection",
      he: "לשלוט באמנות החיבור האנושי",
    },
    text: {
      en: "Your social skills are a superpower. In a world of screens, the ability to build rapport is rare. Use every 8-minute session as a micro-workout to sharpen your empathy and communication.",
      he: "כישורים חברתיים הם כוח-על. בעולם של מסכים, היכולת לבנות קשר היא נדירה. השתמשו בכל פגישת 8 דקות כאימון מיני לחידוד האמפתיה והתקשורת שלכם.",
    },
  },
  {
    title: { en: "Give your ideas a stage", he: "תן לרעיונות שלך במה" },
    text: {
      en: "Stop thinking, start sharing. Great ideas die in isolation. Use Meeter to stress-test your thoughts with a fresh set of ears and turn abstract concepts into actionable reality.",
      he: "תפסיקו לחשוב, תתחילו לשתף. רעיונות גדולים מתים בבידוד. השתמשו ב-Meeter כדי לבחון את המחשבות שלכם עם אוזניים טריות ולהפוך מושגים מופשטים למציאות מעשית.",
    },
  },
  {
    title: {
      en: 'Increase your "luck factor"',
      he: 'להגדיל את "מקדם המזל" שלך',
    },
    text: {
      en: 'Luck is a numbers game. The more people you meet, the more doors you open. Meeter creates the "planned accidents" that lead to your next big project, mentor, or breakthrough.',
      he: 'מזל הוא משחק מספרים. ככל שתפגשו יותר אנשים, כך תפתחו יותר דלתות. Meeter יוצר את ה"תאונות המתוכננות" שיוביל לפרויקט הגדול הבא שלכם, מנטור, או פריצת דרך.',
    },
  },
  {
    title: { en: "Sharpen your social axe", he: "לחדד את הגרזן החברתי שלך" },
    text: {
      en: 'Train for the real world. Every conversation is a chance to practice being present and authentic. Sharpen your "social axe" so you can hack through any real-life challenge with ease.',
      he: 'אמנו את עצמכם לעולם האמיתי. כל שיחה היא הזדמנות לתרגל נוכחות ואותנטיות. חדדו את "הגרזן החברתי" שלכם כדי שתוכלו להתמודד עם כל אתגר בחיים האמיתיים בקלות.',
    },
  },
];

const WhyHBMCards = ({ lang }) => {
  const [flipped, setFlipped] = useState(null);
  return (
    <section className="bg-hbm-cream">
      <BubbleContainer bgColor="white">
        <div className="max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-hbm-dark mb-3">
              {t({ en: "What's in it for me?", he: "מה יוצא לי מזה?" }, lang)}
            </h2>
            <p className="text-hbm-gray">
              {t(
                {
                  en: "Click each card to discover more",
                  he: "לחצו על כל קלף לגלות עוד",
                },
                lang,
              )}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {whyCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => setFlipped(flipped === i ? null : i)}
                className="cursor-pointer rounded-xl p-6 min-h-[160px] flex items-center justify-center text-center transition-all card-hover"
                style={{
                  backgroundColor: flipped === i ? "#6160AB" : "#F5F3FF",
                }}
              >
                {flipped === i ? (
                  <p className="text-white text-sm leading-relaxed">
                    {t(card.text, lang)}
                  </p>
                ) : (
                  <h4 className="font-bold text-hbm-purple text-xl leading-snug">
                    {t(card.title, lang)}
                  </h4>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </BubbleContainer>
    </section>
  );
};

const TestimonialsGrid = ({ testimonials, lang }) => {
  return (
    <section className="bg-hbm-cream py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-hbm-dark mb-4">
            {lang === "he" || lang === "ar" ? "השפעה אמיתית" : "Real Impact"}
          </h2>
          <p className="text-hbm-gray">
            {lang === "he" || lang === "ar"
              ? "מה אנשים אומרים על החוויות שלנו"
              : "What people are saying about our experiences"}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col h-full card-hover hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-6">
                <Quote className="w-10 h-10 text-hbm-purple/10" />
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  {t.companyLogo && (
                    <img
                      src={t.companyLogo}
                      alt="Company"
                      className="h-6 object-contain opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                    />
                  )}
                </div>
              </div>
              <p className="text-hbm-dark font-medium italic mb-8 flex-1 text-lg leading-relaxed font-sans">
                "{t.quote}"
              </p>
              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-hbm-purple text-lg tracking-tight leading-none">
                    {t.author}
                  </h4>
                  <p className="text-[10px] font-black text-hbm-orange uppercase tracking-[0.2em] mt-1.5">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const { lang } = useI18n();
  const isHe = lang === "he" || lang === "ar";
  const dailyQuote = dailyQuotes[new Date().getDate() % dailyQuotes.length];

  const whatsappUrl = getWhatsappUrl(lang);

  const [partnerLogosList, setPartnerLogosList] = useState(partnerLogos);
  const [testimonialsList, setTestimonialsList] = useState([]);

  useEffect(() => {
    fetch(`${getApiBase()}/api/site-content`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.partners?.length) setPartnerLogosList(data.partners);
        if (data?.testimonials?.length) setTestimonialsList(data.testimonials);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-hbm-cream">
      <SEO
        title={t(
          {
            en: "The HBM | Bringing People Together | 8-Minute Connections",
            he: "The HBM | מחברים אנשים | שיחות של 8 דקות",
          },
          lang,
        )}
        description={t(
          {
            en: "Experience the power of 8-minute human connections. Join The HBM for real networking events and meaningful conversations.",
            he: "ouve את העוצמה של חיבורים אנושיים של 8 דקות. הצטרפו ל-HBM לאירועי נטוורקינג אמיתיים ושיחות משמעותיות.",
          },
          lang,
        )}
      />

      {/* ═══════════════════ HERO ═══════════════════ */}
      <AnimatedHero
        imagePairs={home.hero.imagePairs}
        titlePrefix={home.hero.titlePrefix}
        rotatingWords={home.hero.rotatingWords}
        rotatingWordsHe={home.hero.rotatingWordsHe}
        titleSuffix={home.hero.titleSuffix}
      />

      {/* ═══════════════════ TRUSTED PARTNERS ═══════════════════ */}
      <section
        id="partners"
        className="bg-hbm-cream pb-24 overflow-hidden pt-12"
      >
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-400 text-xs uppercase tracking-[0.2em] mb-12 font-bold">
            {t({ en: "Trusted Partners", he: "שותפים מהימנים" }, lang)}
          </p>
          <div className="relative w-full overflow-hidden mask-gradient-x">
            <div
              className="flex gap-12 md:gap-24 items-center w-max animate-marquee"
              style={{ paddingLeft: "2rem", animationDuration: "30s" }}
            >
              {[
                ...partnerLogosList,
                ...partnerLogosList,
                ...partnerLogosList,
                ...partnerLogosList,
              ].map((partner, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 h-32 md:h-40 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-300 px-4"
                >
                  <img
                    src={partner.logoUrl || partner.src}
                    alt={partner.name}
                    className="h-full w-auto object-contain transition-all duration-300 hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ OPPORTUNITY ROTATOR — 2X SIZE ═══════════════════ */}
      <section
        className="py-32 overflow-hidden relative"
        style={{ backgroundColor: "#FAF9F5" }}
      >
        {/* Aura blob for opportunity */}
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-hbm-orange/5 rounded-full blur-[100px] pointer-events-none"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity }}
        />

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-hbm-dark mb-4">
              {t({ en: "Find your next...", he: "מצאו את ה..." }, lang)}
            </h2>
            <OpportunityWord lang={lang} />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ WHY HBM — FLIP CARDS ═══════════════════ */}
      <WhyHBMCards lang={lang} />

      {/* ═══════════════════ CONVERSATION CARDS — SPLIT LAYOUT ═══════════════════ */}
      <section className="section-padding bg-hbm-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Left side — Headlines + CTA */}
            <div className="md:w-2/5">
              <h2 className="text-5xl md:text-7xl font-black text-hbm-dark mb-1 leading-tight tracking-tight">
                {t(home.conversationCards.titleLines, lang)?.[0]}
              </h2>
              <h2 className="text-3xl md:text-4xl font-bold text-hbm-purple/60 mb-8 italic leading-tight">
                {t(home.conversationCards.titleLines, lang)?.[1]}
              </h2>
              <Link to="/events" className="btn-orange rounded-full px-8 py-3">
                {t(home.conversationCards.ctaText, lang)}
              </Link>
            </div>

            {/* Right side — 3 floating cards with 3D hover effects */}
            <div className="md:w-3/5 relative space-y-4">
              {(home?.conversationCards?.cards || []).map((card, i) => (
                <InteractiveCard
                  key={i}
                  card={card}
                  index={i}
                  lang={lang}
                  t={t}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHY 8 MINUTES — INSTAGRAM CAROUSEL ═══════════════════ */}
      <Why8Minutes />

      {/* ═══════════════════ REAL IMPACT TESTIMONIALS REMOVED PER USER REQUEST ═══════════════════ */}
      {/* ═══════════════════ DAILY INSPIRATION — QUOTE CAROUSEL ═══════════════════ */}
      <QuoteCarousel />

      {/* ═══════════════════ WHAT MAKES THIS WORK — Guidelines ═══════════════════ */}
      <Guidelines />

      <NextPageBridge
        to="/meeter"
        eyebrow={{ en: "Curious?", he: "סקרנים?" }}
        title={{
          en: "More than an tool, its a new way to connect.",
          he: "יותר מאפליקציה. דרך חדשה להתחבר.",
        }}
        description={{
          en: "Imagine a social network where you don't scroll, you just meet. In real life. 8 minutes at a time.",
          he: "תארו לעצמכם רשת חברתית שבה לא גוללים, אלא פשוט נפגשים. במציאות. 8 דקות בכל פעם.",
        }}
        buttonText={{ en: "What Is It?", he: "מה זה?" }}
      />
    </div>
  );
}
