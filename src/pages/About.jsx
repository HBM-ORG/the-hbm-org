import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { siteContent } from "../data/content";
import { useI18n, t } from "../i18n/context";
import { ui } from "../i18n/translations";
import { getWhatsappUrl } from "../components/Layout";
import { ArrowRight, X, Linkedin, User } from "lucide-react";
import EyebrowBadge from "../components/EyebrowBadge";
import BubbleContainer from "../components/BubbleContainer";
import NextPageBridge from "../components/NextPageBridge";
import GlobeDemo from "../components/ui/GlobeDemo";
import SEO from "../components/SEO";
import { getApiBase } from "../utils/api";

const { about, global } = siteContent;

const vision = {
  en: "To create a world where no one is a stranger, by transforming chance encounters into meaningful connections that reshape reality.",
  he: "ליצור עולם שבו אף אדם אינו זר, על ידי הפיכת מפגשים אקראיים לחיבורים משמעותיים.",
  es: "Crear un mundo donde nadie sea un extraño, convirtiendo encuentros casuales en conexiones significativas.",
  fr: "Créer un monde où personne n'est un étranger, en transformant les rencontres fortuites en connexions significatives.",
  de: "Eine Welt schaffen, in der niemand ein Fremder ist, indem wir zufällige Begegnungen in bedeutungsvolle Verbindungen verwandeln.",
  ar: "خلق عالم لا يكون فيه أي شخص غريباً، من خلال تحويل اللقاءات العشوائية إلى روابط ذات معنى.",
};
const mission = {
  en: "To develop and operate a social platform, bridging physical and digital realms, that leverages technology, data, and AI to identify, amplify, and harness meaningful interactions, transforming them into authentic and lasting human connections.",
  he: "לספק לקהילות ולארגונים את הכלים הטכנולוגיים והחוויות ליצירת אינטראקציות אותנטיות, מהירות ומעוררות השראה המעודדות צמיחה אישית ושיתוף פעולה.",
  es: "Proporcionar a comunidades y organizaciones herramientas tecnológicas para crear interacciones auténticas e inspiradoras.",
  fr: "Fournir aux communautés et organisations les outils pour créer des interactions authentiques et inspirantes.",
  de: "Gemeinschaften und Organisationen technologische Werkzeuge bereitzustellen für authentische Interaktionen.",
  ar: "تزويد المجتمعات والمنظمات بالأدوات التكنولوجية لخلق تفاعلات أصيلة وملهمة.",
};

const values = [
  {
    title: { en: "Acceptance", he: "קבלה" },
    text: {
      en: "Seeing the other as they are, without judgment or comparison. Creating a safe space for dialogue.",
      he: "לראות את האחר כמו שהוא, ללא שיפוט או השוואה. יצירת מרחב בטוח לדיאלוג.",
    },
  },
  {
    title: { en: "Compassion", he: "חמלה" },
    text: {
      en: "Understanding the other's difficulty and wanting to help. A wish for their well-being.",
      he: "הבנת הקושי של האחר ורצון לעזור. איחול לרווחתם.",
    },
  },
  {
    title: { en: "Positivity", he: "חיוביות" },
    text: {
      en: "Choosing to see the good, focusing on complex realities with optimism and solutions.",
      he: "בחירה לראות את הטוב, התמקדות במציאות מורכבת עם אופטימיות ופתרונות.",
    },
  },
  {
    title: { en: "Mental Flexibility", he: "גמישות מחשבתית" },
    text: {
      en: "Looking at things from different angles, changing opinions, and adapting to changing situations.",
      he: "להסתכל על דברים מזוויות שונות, לשנות דעות ולהסתגל למצבים משתנים.",
    },
  },
  {
    title: { en: "Responsibility", he: "אחריות" },
    text: {
      en: "Committing to actions and words, acting with judgment and respect.",
      he: "מחויבות לפעולות ולמילים, פעולה בשיקול דעת וכבוד.",
    },
  },
  {
    title: { en: "Balance", he: "איזון" },
    text: {
      en: "Balancing life domains—work/rest, giving/receiving—to enable a healthy life.",
      he: "איזון תחומי חיים - עבודה/מנוחה, נתינה/קבלה - לאפשר חיים בריאים.",
    },
  },
  {
    title: { en: "Honesty", he: "כנות" },
    text: {
      en: "Telling the truth simply and directly, without masks. Building trust through authenticity.",
      he: "לספר את האמת בפשטות וישירות, בלי מסכות. בניית אמון דרך אותנטיות.",
    },
  },
  {
    title: { en: "Generosity", he: "נדיבות" },
    text: {
      en: "Giving beyond what is expected—time, knowledge, attention—out of a genuine desire to do good.",
      he: "לתת מעבר למצופה - זמן, ידע, תשומת לב - מתוך רצון אמיתי לעשות טוב.",
    },
  },
  {
    title: { en: "Modesty", he: "צניעות" },
    text: {
      en: "Recognizing our value without feeling superior. Doing the right thing because it's right, not for credit.",
      he: "הכרה בערך שלנו מבלי להרגיש עדיפים. לעשות את הדבר הנכון כי הוא נכון, לא בשביל קרדיט.",
    },
  },
  {
    title: { en: "Transparency", he: "שקיפות" },
    text: {
      en: 'Acting with clarity so information and intentions are understood, building trust and sharing the "why".',
      he: 'פעולה בבהירות כך שמידע וכוונות יובנו, בניית אמון ושיתוף ה"למה".',
    },
  },
];

// Isolated into its own component so its state doesn't cause About to re-render
function ValuesGrid({ lang }) {
  const [flippedCard, setFlippedCard] = useState(null);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {values.map((v, i) => (
        <div
          key={i}
          onClick={() => setFlippedCard(flippedCard === i ? null : i)}
          className="cursor-pointer rounded-xl p-5 min-h-[140px] flex items-center justify-center text-center transition-all card-hover"
          style={{ backgroundColor: flippedCard === i ? "#6160AB" : "#F5F3FF" }}
        >
          {flippedCard === i ? (
            <p className="text-white text-xs leading-relaxed font-['Sora']">
              {t(v.text, lang)}
            </p>
          ) : (
            <h4 className="font-bold text-hbm-purple text-lg font-['Sora']">
              {t(v.title, lang)}
            </h4>
          )}
        </div>
      ))}
    </div>
  );
}
const defaultTeam = Array.isArray(siteContent?.about?.team?.members) ? siteContent.about.team.members : [];

export default function About() {
  const { lang } = useI18n();
  const [selectedMember, setSelectedMember] = useState(null);
  const [teamMembers, setTeamMembers] = useState(defaultTeam);
  const whatsappUrl = getWhatsappUrl(lang);

  useEffect(() => {
    fetch(`${getApiBase()}/api/site-content`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.team?.length) {
          const staticMembers = about?.team?.members ?? defaultTeam;
          const mergedTeam = data.team.map((member) => {
            const staticMatch = staticMembers.find(
              (sm) => sm && sm.name === member.name,
            );
            if (staticMatch) {
              if (!member.image && !member.imageUrl) member.image = staticMatch.image;
              if (member.bio === undefined || member.bio === '') member.bio = staticMatch.bio;
              if (member.funFact === undefined || member.funFact === '') member.funFact = staticMatch.funFact;
              if (member.funFacts === undefined && staticMatch.funFacts) member.funFacts = staticMatch.funFacts;
            }
            return member;
          });
          setTeamMembers(mergedTeam);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <SEO
        title={t({ en: "About Us | The HBM", he: "מי אנחנו | The HBM" }, lang)}
        description={t(
          {
            en: "Meet the team behind The Human Being Movement. We are dedicated to bringing people together through authentic 8-minute connections.",
            he: "הכירו את הצוות שמאחורי תנועת בני האדם. אנחנו פועלים לחיבור אנשים דרך שיחות אותנטיות של 8 דקות.",
          },
          lang,
        )}
      />

      {/* Hero */}
      <section className="bg-hbm-cream pt-10 pb-6">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="mb-4 flex flex-col items-center">
            <EyebrowBadge text={t(ui.about.eyebrow, lang)} />
          </div>
          <h1
            className="text-4xl md:text-7xl font-bold mb-2 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] bg-clip-text text-transparent"
            style={{ letterSpacing: "-2px" }}
          >
            {t(about?.hero?.title ?? { en: "About Us", he: "מי אנחנו" }, lang)}
          </h1>
        </div>
      </section>

      {/* ── S1.5: WHO WE ARE BUBBLE (NEW) ── */}
      <section className="bg-hbm-cream pb-12 pt-4">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-[40px] border-4 border-hbm-purple/20 text-center mx-auto max-w-3xl"
          >
            <p className="text-xl md:text-2xl font-bold leading-relaxed font-['Sora'] text-hbm-dark">
              {lang === "he" ? (
                <>
                  <span className="text-hbm-purple font-black block mb-4 text-3xl md:text-4xl">
                    אנחנו הופכים זרים לחברים!
                  </span>
                  דרך שיחות אקראיות של 8 דקות,
                  <br /> בשידור חי באירוע עם פלטפורמת Meeter.
                  <br />
                  <span className="text-black font-bold mt-4 inline-block tracking-wide">
                    חיבור אמיתי. אנשים אמיתיים.
                  </span>
                </>
              ) : (
                <>
                  <span className="text-hbm-purple font-black block mb-4 text-3xl md:text-4xl">
                    We turn strangers into friends!
                  </span>
                  Through 8-minute random conversations,
                  <br /> live at the event with the Meeter platform.
                  <br />
                  <span className="text-black font-bold mt-4 inline-block tracking-wide">
                    Real connection. Real people.
                  </span>
                </>
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section id="mission" className="bg-hbm-cream pt-16 pb-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 px-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 bg-white/60 rounded-[32px] border border-hbm-purple/20 flex flex-col items-center text-center shadow-sm"
          >
            <span className="inline-block text-xs font-black text-hbm-purple uppercase tracking-[0.2em] border border-hbm-purple/30 rounded-full px-4 py-2 mb-6 font-['Sora']">
              {t({ en: "Our Vision", he: "החזון שלנו" }, lang)}
            </span>
            <p className="text-lg md:text-xl text-hbm-dark leading-relaxed font-semibold font-['Sora']">
              {t(vision, lang)}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 bg-white/60 rounded-[32px] border border-hbm-orange/20 flex flex-col items-center text-center shadow-sm"
          >
            <span className="inline-block text-xs font-black text-hbm-orange uppercase tracking-[0.2em] border border-hbm-orange/30 rounded-full px-4 py-2 mb-6 font-['Sora']">
              {t({ en: "Our Mission", he: "המשימה שלנו" }, lang)}
            </span>
            <p className="text-lg md:text-xl text-hbm-dark leading-relaxed font-semibold font-['Sora']">
              {t(mission, lang)}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive World Connection Section — globe + sentence right below */}
      <section className="bg-hbm-cream pt-0 pb-8 overflow-hidden">
        <div className="h-[360px] sm:h-[400px] md:h-[420px] w-full flex items-end justify-center" aria-hidden="true">
          <GlobeDemo key="about-globe" />
        </div>
        <div className="text-center mt-2 mb-4 px-4 -translate-y-2">
          <p className="text-sm md:text-base lg:text-lg font-bold text-hbm-dark/60 font-['Sora'] tracking-wide break-words">
            {t(
              {
                en: "Connecting people around the world",
                he: "מחברים אנשים מסביב לעולם",
              },
              lang,
            )}
          </p>
        </div>
      </section>

      {/* Values — Click to reveal */}
      <section id="values" className="bg-hbm-cream">
        <BubbleContainer bgColor="white">
          <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-hbm-dark text-center mb-4 font-['Sora']">
              {t(about?.values?.title ?? { en: "Our Values", he: "הערכים שלנו" }, lang)}
            </h2>
            <p className="text-hbm-gray text-center mb-12 font-['Sora']">
              {t(
                {
                  en: "Click to reveal each value",
                  he: "לחצו לחשיפת כל ערך",
                  es: "Haz clic para revelar",
                  fr: "Cliquez pour révéler",
                  de: "Klicken zum Aufdecken",
                  ar: "انقر للكشف",
                },
                lang,
              )}
            </p>
            {/* ValuesGrid is isolated so its state won't cause the Globe above to re-render */}
            <ValuesGrid lang={lang} />
          </div>
        </BubbleContainer>
      </section>

      {/* Team */}
      <section id="team" className="bg-hbm-cream">
        <BubbleContainer bgColor="white">
          <div className="max-w-6xl mx-auto w-full relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-hbm-dark text-center mb-12">
              {t(about?.team?.title ?? { en: "Meet The Team", he: "הכירו את הצוות" }, lang)}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {(teamMembers || [])
                .filter((m) => m && m.name && (m.image || m.imageUrl))
                .map((member, i) => (
                  <div
                    key={i}
                    className="text-center group cursor-pointer"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="w-32 h-32 md:w-44 md:h-44 mx-auto rounded-full overflow-hidden mb-6 team-photo border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500 ring-2 ring-hbm-purple/10 relative flex items-center justify-center bg-gray-100">
                      {member.image || member.imageUrl ? (
                        <img
                          src={member.image || member.imageUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          style={{
                            objectPosition:
                              member.imagePosition || "center center",
                            transform: member.imageScale
                              ? `scale(${member.imageScale})`
                              : "none",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`${member.image || member.imageUrl ? "hidden" : "flex"} w-full h-full items-center justify-center bg-gradient-to-br from-hbm-purple/10 to-hbm-orange/10 text-hbm-purple/40`}
                      >
                        <User size={40} />
                      </div>
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-7 h-7 md:w-9 md:h-9 bg-white rounded-full flex items-center justify-center text-[#0077B5] shadow-md hover:scale-110 transition-transform z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Linkedin size={16} />
                        </a>
                      )}
                    </div>
                    <h4 className="font-bold text-hbm-dark text-lg md:text-xl font-['Sora'] tracking-tight">
                      {member.name}
                    </h4>
                    <p className="text-hbm-purple text-xs md:text-sm font-bold uppercase tracking-widest mt-1 opacity-80 font-['Sora']">
                      {typeof member.role === "string"
                        ? member.role
                        : t(member.role, lang)}
                    </p>
                    {member.nickname && (
                      <p className="text-hbm-gray text-xs italic mt-2 opacity-60 font-['Sora']">
                        "
                        {typeof member.nickname === "string"
                          ? member.nickname
                          : t(member.nickname, lang)}
                        "
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </BubbleContainer>
      </section>

      {/* ── Team Bio Modal ── */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-hbm-dark/40 backdrop-blur-md"
            />

            {/* Modal Content — max-h on mobile so bio doesn't overflow; scroll inside */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] md:max-h-none bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              {/* Close Button — left side so LinkedIn (top-right of image) doesn't hide it */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              {/* Profile Image (Side) — smaller on mobile so bio fits on screen */}
              <div className="w-full md:w-2/5 md:max-w-sm shrink-0 bg-gray-100 relative flex items-start justify-center md:min-h-0">
                <div className="w-full aspect-[3/4] max-h-[260px] sm:max-h-[320px] md:max-h-none md:aspect-square md:h-full overflow-hidden">
                {selectedMember.image || selectedMember.imageUrl ? (
                  <img
                    src={selectedMember.image || selectedMember.imageUrl}
                    alt={selectedMember.name}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-gradient-to-br from-hbm-purple/10 to-hbm-orange/10 text-hbm-purple/40">
                    <User size={80} />
                  </div>
                )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent text-white pointer-events-none">
                  <h3 className="text-3xl font-black text-white tracking-tight mb-1">
                    {selectedMember.name}
                  </h3>
                  <p className="text-hbm-cream font-bold tracking-widest uppercase text-sm mb-2">
                    {typeof selectedMember.role === "string"
                      ? selectedMember.role
                      : t(selectedMember.role, lang)}
                  </p>
                  {selectedMember.nickname && (
                    <p className="text-white text-sm italic opacity-80">
                      "
                      {typeof selectedMember.nickname === "string"
                        ? selectedMember.nickname
                        : t(selectedMember.nickname, lang)}
                      "
                    </p>
                  )}
                </div>

                {/* LinkedIn Icon - Positioned at top right of image area */}
                {selectedMember.linkedin && (
                  <a
                    href={selectedMember.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-6 right-6 w-10 h-10 bg-[#0077B5] rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform z-20"
                  >
                    <Linkedin size={22} />
                  </a>
                )}
              </div>

              {/* Bio Content (Main) — fixed max height so card size stays "בול"; long bio scrolls inside */}
              <div className="w-full md:w-3/5 p-6 md:p-10 overflow-y-auto min-h-0 flex-1 max-h-[45vh] md:max-h-[55vh]">
                {selectedMember.nickname && (
                  <p className="text-hbm-dark font-black italic text-lg mb-4">
                    {t(selectedMember.nickname, lang)}:
                  </p>
                )}

                <div className="space-y-4">
                  {/* Bio (primary — same label/text size as previous Fun Fact block) */}
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-hbm-orange">
                      {lang === "he" ? "ביו" : "Bio"}:{" "}
                    </p>
                    {typeof selectedMember.bio === "string" ? (
                      <p className="text-sm text-gray-500 leading-relaxed">{selectedMember.bio}</p>
                    ) : (
                      (Array.isArray(t(selectedMember.bio, lang)) ? t(selectedMember.bio, lang) : []).map((para, idx) => (
                        <p key={idx} className="text-sm text-gray-500 leading-relaxed mb-2">
                          {para}
                        </p>
                      ))
                    )}
                  </div>
                  {/* Fun Fact (optional, secondary) */}
                  {(() => {
                    let facts = [];
                    if (Array.isArray(selectedMember.funFacts)) {
                      facts = selectedMember.funFacts.map((f) => (typeof f === "string" ? f : t(f, lang)));
                    } else if (selectedMember.funFact) {
                      const v = selectedMember.funFact;
                      const str = typeof v === "string" ? v : t(v, lang);
                      facts = str ? str.split(/\n/).map((s) => s.trim()).filter(Boolean) : [];
                    }
                    if (facts.length === 0) return null;
                    return (
                      <div className="pt-4 border-t border-gray-100 space-y-2">
                        <p className="text-sm font-bold text-hbm-orange">
                          {facts.length > 1 ? (lang === "he" ? "עובדות מהנות" : "Fun Facts") : (lang === "he" ? "עובדה מהנה" : "Fun Fact")}:{" "}
                        </p>
                        {facts.map((fact, idx) => (
                          <p key={idx} className="text-sm text-gray-500 italic">
                            {fact}
                          </p>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Our Logo */}
      <section id="logo" className="bg-hbm-cream">
        <BubbleContainer bgColor="white">
          <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-hbm-dark text-center mb-12">
              {t(
                {
                  en: "Our Logo",
                  he: "הלוגו שלנו",
                  es: "Nuestro Logo",
                  fr: "Notre Logo",
                  de: "Unser Logo",
                  ar: "شعارنا",
                },
                lang,
              )}
            </h2>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="flex justify-center">
                {/* Logo path must exist in public/logos/ at build/deploy (Hostinger). Root-relative paths are correct for production. */}
                <img
                  src="/logos/file-2qgRiQ7eUZ1uhx7Xfasq3P-The HBM LOGO.png"
                  alt="HBM Logo"
                  className="w-40 md:w-56 h-auto drop-shadow-xl hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <p className="text-hbm-gray leading-relaxed mb-6">
                  {t(
                    {
                      en: "Our logo represents two figures connecting—bringing the human element back to the center of the circle. The colors (Orange, Green, Purple) symbolize energy, growth, and depth.",
                      he: "הלוגו שלנו מייצג שתי דמויות שמתחברות — מחזיר את האלמנט האנושי למרכז המעגל. הצבעים (כתום, ירוק, סגול) מסמלים אנרגיה, צמיחה ועומק.",
                      es: "Nuestro logo representa dos figuras conectándose. Los colores simbolizan energía, crecimiento y profundidad.",
                      fr: "Notre logo représente deux figures qui se connectent. Les couleurs symbolisent énergie, croissance et profondeur.",
                      de: "Unser Logo zeigt zwei sich verbindende Figuren. Die Farben symbolisieren Energie, Wachstum und Tiefe.",
                      ar: "يمثل شعارنا شخصيتين تتواصلان. الألوان ترمز للطاقة والنمو والعمق.",
                    },
                    lang,
                  )}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-hbm-orange" />
                    <span className="font-semibold text-sm">
                      {t(
                        {
                          en: "Orange — Energy & Warmth",
                          he: "כתום — אנרגיה וחום",
                          es: "Naranja — Energía",
                          fr: "Orange — Énergie",
                          de: "Orange — Energie",
                          ar: "برتقالي — طاقة",
                        },
                        lang,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-hbm-green" />
                    <span className="font-semibold text-sm">
                      {t(
                        {
                          en: "Green — Growth & Authenticity",
                          he: "ירוק — צמיחה ואותנטיות",
                          es: "Verde — Crecimiento",
                          fr: "Vert — Croissance",
                          de: "Grün — Wachstum",
                          ar: "أخضر — نمو",
                        },
                        lang,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-hbm-purple" />
                    <span className="font-semibold text-sm">
                      {t(
                        {
                          en: "Purple — Wisdom & Trust",
                          he: "סגול — חוכמה ואמון",
                          es: "Púrpura — Sabiduría",
                          fr: "Violet — Sagesse",
                          de: "Lila — Weisheit",
                          ar: "بنفسجي — حكمة",
                        },
                        lang,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BubbleContainer>
      </section>
    </div>
  );
}
