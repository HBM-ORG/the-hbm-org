import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  MapPin,
  ChevronDown,
  Edit3,
  Settings,
  Star,
  Sparkles,
} from "lucide-react";
import { useI18n, t } from "../../i18n/context";
import { MagicCard } from "../ui/MagicCard";
import BubbleContainer from "../BubbleContainer";
import CountdownTimer from "./CountdownTimer";
import CalendarDropdown from "./CalendarDropdown";
import { hbmAnalytics } from "../../utils/admin-analytics";
import { getApiBase, resolveAssetUrl } from "../../utils/api";
import { getCtaFormFieldsForEvent } from "../../../../../lib/cta-form-fields.js";

const NextEventHero = ({
  event,
  isEditable = false,
  onUpdate = () => {},
  onUpload = () => {},
  visuals = {},
  /** When set (e.g. in admin preview), asset paths are loaded from this origin so images show correctly */
  assetBase = "",
}) => {
  const { lang } = useI18n();
  /** When true, the entire event registration page is shown in English only (no Hebrew). */
  const effectiveLang = event?.contentEnglishOnly ? "en" : lang;
  const [activeFaq, setActiveFaq] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    termsAccepted: false,
    marketingOptIn: false,
  });
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [registerFieldError, setRegisterFieldError] = useState(null);

  const regFields = getCtaFormFieldsForEvent(event || {});

  const clearRegisterFieldError = (field) => {
    setRegisterFieldError((prev) => (prev?.field === field ? null : prev));
  };

  // Normalize data access with defaults
  const promoBubbles = event.promoBubbles || [];
  const whatToExpect = event.whatToExpect || {};
  const partnership = event.partnership || {};
  const imageBubbles = event.imageBubbles || [];
  const freeText = event.freeText || "";
  const showPartnership = event.showPartnership ?? true;

  const resolveAsset = (url) =>
    url && assetBase && String(url).startsWith("/") ? assetBase + url : url;

  // Visuals from props or defaults
  const brightness = visuals.brightness || 100;
  const blur = visuals.blur || 0;
  const videoScale = visuals.videoScale || 1.0;
  const overlayOpacity = visuals.overlayOpacity ?? 40;

  // Normalize dates to midnight to check if strictly past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(event.date);
  const isPast = eventDate < today;

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitStatus("submitting");
    setRegisterFieldError(null);

    try {
      const bodyData = {
        name: formState.name,
        email: formState.email,
        phone: formState.phone,
        source: formState.source,
        eventId: event.id || "physical",
        eventName: event.title?.en || event.title,
        language: lang,
        termsAccepted: formState.termsAccepted === true,
      };
      const response = await fetch(`${getApiBase()}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        hbmAnalytics.recordRegComplete(
          event.id,
          event.title.en || event.title,
          formState.source,
        );
        setSubmitStatus("success");
      } else {
        const hint =
          effectiveLang === "he" && data.hintHe ? data.hintHe : data.hint;
        setRegisterFieldError({
          field: typeof data.field === "string" ? data.field : null,
          message:
            typeof data.error === "string"
              ? data.error
              : t(
                  {
                    en: "Registration failed. Please try again.",
                    he: "ההרשמה נכשלה. אנא נסה שוב.",
                  },
                  effectiveLang,
                ),
          hint: typeof hint === "string" ? hint : undefined,
        });
        setSubmitStatus("idle");
      }
    } catch (err) {
      console.error(err);
      setRegisterFieldError({
        field: null,
        message: t(
          {
            en: "Connection error. Is the server running?",
            he: "שגיאת חיבור. האם השרת פועל?",
          },
          effectiveLang,
        ),
      });
      setSubmitStatus("idle");
    }
  };

  const fieldRingClass = (field) =>
    registerFieldError?.field === field
      ? "ring-2 ring-red-400 ring-offset-0 ring-offset-transparent"
      : "";

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-['Sora'] pb-20">
      {/* 1. HERO SECTION (Constrained Height) */}
      <div
        className="relative w-full flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ minHeight: "850px" }}
      >
        {/* Background Media */}
        <div className="absolute inset-0 z-0 h-full w-full bg-gray-900">
          {event.heroVideo ? (
            <video
              src={resolveAsset(event.heroVideo)}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover transition-all duration-300"
              style={{
                filter: `brightness(${brightness}%) blur(${blur}px)`,
                transform: `scale(${videoScale})`,
              }}
            />
          ) : (
            <img
              src={
                resolveAsset(event.heroImage || event.image)
                || resolveAssetUrl("/assets/default-hero.jpg")
              }
              alt="Event Background"
              className="w-full h-full object-cover transition-all duration-300"
              style={{
                filter: `brightness(${brightness}%) blur(${blur}px)`,
                transform: `scale(${videoScale})`,
              }}
            />
          )}
          <div
            className="absolute inset-0 bg-black transition-opacity duration-300"
            style={{ opacity: overlayOpacity / 100 }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#FAF9F5] via-[#FAF9F5]/80 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-4xl px-6 w-full flex flex-col items-center h-full justify-center pt-20 pb-40">
          {/* Status Badges & Admin Controls */}
          <div className="absolute top-10 left-10 z-50 flex items-center gap-3">
            {event.status === "draft" && (
              <div className="bg-amber-400 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-200/50 flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full" /> Draft Mode
              </div>
            )}
            {isEditable && (
              <button
                onClick={() => onUpdate("openSettings", true)}
                className="bg-white/90 backdrop-blur-xl text-gray-900 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-white hover:bg-[#6160AB] hover:text-white transition-all flex items-center gap-2 group"
              >
                <Settings className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />{" "}
                Visual Edit
              </button>
            )}
          </div>

          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="px-5 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-white text-xs font-bold tracking-widest uppercase shadow-lg">
              {isPast
                ? t({ en: "PAST EVENT", he: "אירוע עבר" }, effectiveLang)
                : t({ en: "UPCOMING EXPERIENCE", he: "החוויה הבאה" }, effectiveLang)}
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-8xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl relative group"
          >
            {t(event.title, effectiveLang)}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-white/90 font-medium mb-12 max-w-2xl mx-auto drop-shadow-lg leading-relaxed relative"
          >
            {t(event.description, effectiveLang)}
          </motion.p>

          {/* Countdown & Registration - BUBBLE DESIGN RESTORED */}
          {!isPast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-2xl mx-auto flex flex-col items-center"
            >
              {/* Countdown Section (Separate Bubbles) */}
              <div className="mb-8 scale-110">
                <CountdownTimer targetDate={event.date} />
              </div>

              {/* Registration Bubble */}
              <MagicCard
                className="w-full p-8 md:p-10 text-center rounded-[40px] shadow-2xl border-white/20 bg-black/40 backdrop-blur-3xl group/card !overflow-visible"
                gradientColor="#6160AB"
              >
                {!isRegisterOpen ? (
                  <div className="flex flex-col items-center">
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                      {new Date(event.date).toLocaleDateString(
                        effectiveLang === "he" ? "he-IL" : "en-US",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-white/60 text-sm font-bold uppercase tracking-widest mb-8">
                      <MapPin className="w-3.5 h-3.5 text-hbm-orange" />{" "}
                      {event.location}
                    </div>
                    <button
                      onClick={() => {
                        setIsRegisterOpen(true);
                        hbmAnalytics.recordRegStart(
                          event.id,
                          event.title.en || event.title,
                        );
                      }}
                      className="w-full py-5 rounded-2xl font-black text-white text-xl shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-xl"
                    >
                      {t({ en: "Reserve My Spot", he: "שריין מקום" }, effectiveLang)}
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    {submitStatus === "success" ? (
                      <div className="text-center py-4 flex flex-col items-center">
                        <div className="w-16 h-16 bg-[#39ff14]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="w-8 h-8 text-[#39ff14]" />
                        </div>
                        <h3 className="text-white font-bold text-2xl mb-1">
                          {t({ en: "You're In!", he: "אתם בפנים!" }, effectiveLang)}
                        </h3>
                        <p className="text-white/60 text-sm mb-6">
                          {t(
                            {
                              en: "Check your email for details.",
                              he: "בדקו את המייל לפרטי הרישום.",
                            },
                            effectiveLang,
                          )}
                        </p>

                        <CalendarDropdown
                          eventData={{
                            title: t(event.title, effectiveLang),
                            description: t(event.description, effectiveLang),
                            location:
                              event.locationParams?.addressText ||
                              event.location,
                            startTime: new Date(event.date),
                            endTime: new Date(
                              new Date(event.date).getTime() +
                                3 * 60 * 60 * 1000,
                            ),
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => setIsRegisterOpen(false)}
                          className="mt-8 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                          {t({ en: "Close", he: "סגור" }, effectiveLang)}
                        </button>
                      </div>
                    ) : (
                      <>
                        {(regFields.name.show || regFields.phone.show) && (
                          <div
                            className={
                              regFields.name.show && regFields.phone.show
                                ? "grid md:grid-cols-2 gap-4"
                                : ""
                            }
                          >
                            {regFields.name.show && (
                              <input
                                type="text"
                                placeholder={t(
                                  { en: "Full Name", he: "שם מלא" },
                                  effectiveLang,
                                )}
                                required={regFields.name.required}
                                className={`w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F07B3C] focus:bg-black/50 transition-all text-sm backdrop-blur-sm ${fieldRingClass("name")}`}
                                value={formState.name}
                                onChange={(e) => {
                                  clearRegisterFieldError("name");
                                  setFormState({
                                    ...formState,
                                    name: e.target.value,
                                  });
                                }}
                              />
                            )}
                            {regFields.phone.show && (
                              <input
                                type="tel"
                                placeholder={t(
                                  {
                                    en: "Phone Number",
                                    he: "מספר טלפון",
                                  },
                                  effectiveLang,
                                )}
                                required={regFields.phone.required}
                                className={`w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F07B3C] focus:bg-black/50 transition-all text-sm backdrop-blur-sm ${fieldRingClass("phone")}`}
                                value={formState.phone}
                                onChange={(e) => {
                                  clearRegisterFieldError("phone");
                                  setFormState({
                                    ...formState,
                                    phone: e.target.value,
                                  });
                                }}
                              />
                            )}
                          </div>
                        )}
                        {regFields.email.show && (
                          <input
                            type="email"
                            placeholder={t(
                              {
                                en: "Email Address",
                                he: "כתובת אימייל",
                              },
                              effectiveLang,
                            )}
                            required={regFields.email.required}
                            className={`w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F07B3C] focus:bg-black/50 transition-all text-sm backdrop-blur-sm ${fieldRingClass("email")}`}
                            value={formState.email}
                            onChange={(e) => {
                              clearRegisterFieldError("email");
                              setFormState({
                                ...formState,
                                email: e.target.value,
                              });
                            }}
                          />
                        )}

                        {regFields.source.show && (
                          <div className="relative">
                            <select
                              className={`w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F07B3C] focus:bg-black/50 transition-all text-sm backdrop-blur-sm appearance-none ${fieldRingClass("source")}`}
                              value={formState.source || ""}
                              onChange={(e) => {
                                clearRegisterFieldError("source");
                                setFormState({
                                  ...formState,
                                  source: e.target.value,
                                });
                              }}
                              required={regFields.source.required}
                            >
                              <option value="" disabled className="text-gray-500">
                                {t(
                                  {
                                    en: "How did you hear about us?",
                                    he: "איך שמעת עלינו?",
                                  },
                                  effectiveLang,
                                )}
                              </option>
                              <option value="social" className="text-black">
                                {t(
                                  {
                                    en: "Social Networks",
                                    he: "רשתות חברתיות",
                                  },
                                  effectiveLang,
                                )}
                              </option>
                              <option value="whatsapp" className="text-black">
                                {t(
                                  {
                                    en: "WhatsApp Group",
                                    he: "קבוצת וואטסאפ",
                                  },
                                  effectiveLang,
                                )}
                              </option>
                              <option value="friend" className="text-black">
                                {t(
                                  {
                                    en: "Friend / Word of Mouth",
                                    he: "חבר / מפה לאוזן",
                                  },
                                  effectiveLang,
                                )}
                              </option>
                              <option value="staff" className="text-black">
                                HBM Staff
                              </option>
                              <option value="other" className="text-black">
                                {t(
                                  { en: "Other", he: "אחר" },
                                  effectiveLang,
                                )}
                              </option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                          </div>
                        )}

                        {(regFields.terms.show || regFields.marketing.show) && (
                          <div
                            className={`space-y-3 pt-2 text-left px-1 rounded-lg ${fieldRingClass("terms")}`}
                          >
                            {regFields.terms.show && (
                              <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  className="mt-1 w-4 h-4 shrink-0 rounded border-white/40 bg-white/5 text-[#F07B3C] focus:ring-[#F07B3C]"
                                  checked={formState.termsAccepted}
                                  onChange={(e) => {
                                    clearRegisterFieldError("terms");
                                    setFormState({
                                      ...formState,
                                      termsAccepted: e.target.checked,
                                    });
                                  }}
                                  required={regFields.terms.required}
                                />
                                <span className="text-[10px] text-white/70 leading-tight">
                                  {t(
                                    {
                                      en: (
                                        <>
                                          I approve that I have read and agree
                                          to the{" "}
                                          <a
                                            href={resolveAssetUrl(
                                              "/assets/events/ef3d3fe33_HBMTOU-FINAL (1).pdf",
                                            )}
                                            target="_blank"
                                            className="text-[#F07B3C] hover:underline mx-1"
                                          >
                                            Terms of Use
                                          </a>{" "}
                                          and{" "}
                                          <a
                                            href={resolveAssetUrl(
                                              "/assets/events/af6ef7603_HBMPrivacyPolicyFINAL.pdf",
                                            )}
                                            target="_blank"
                                            className="text-[#F07B3C] hover:underline mx-1"
                                          >
                                            Privacy Policy
                                          </a>
                                          .
                                        </>
                                      ),
                                      he: (
                                        <>
                                          אני מאשר/ת שקראתי והסכמתי ל
                                          <a
                                            href={resolveAssetUrl(
                                              "/assets/events/ef3d3fe33_HBMTOU-FINAL (1).pdf",
                                            )}
                                            target="_blank"
                                            className="text-[#F07B3C] hover:underline mx-1"
                                          >
                                            תנאי השימוש
                                          </a>{" "}
                                          ול
                                          <a
                                            href={resolveAssetUrl(
                                              "/assets/events/af6ef7603_HBMPrivacyPolicyFINAL.pdf",
                                            )}
                                            target="_blank"
                                            className="text-[#F07B3C] hover:underline mx-1"
                                          >
                                            מדיניות הפרטיות
                                          </a>
                                          .
                                        </>
                                      ),
                                    },
                                    effectiveLang,
                                  )}
                                </span>
                              </label>
                            )}

                            {regFields.marketing.show && (
                              <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  className="mt-1 w-4 h-4 shrink-0 rounded border-white/40 bg-white/5 text-[#F07B3C] focus:ring-[#F07B3C]"
                                  checked={formState.marketingOptIn}
                                  onChange={(e) =>
                                    setFormState({
                                      ...formState,
                                      marketingOptIn: e.target.checked,
                                    })
                                  }
                                />
                                <span className="text-[10px] text-white/50 leading-tight">
                                  {t(
                                    {
                                      en: "Keep me updated with community news and events via email and SMS.",
                                      he: "אשמח לקבל עדכונים על אירועי הקהילה וחדשות ב-SMS ובמייל.",
                                    },
                                    effectiveLang,
                                  )}
                                </span>
                              </label>
                            )}
                          </div>
                        )}

                        {registerFieldError && (
                          <div
                            role="alert"
                            className="rounded-xl border border-red-400/50 bg-red-950/40 px-4 py-3 text-left text-sm text-red-100"
                          >
                            <p className="font-semibold">{registerFieldError.message}</p>
                            {registerFieldError.hint ? (
                              <p className="mt-1 text-xs text-red-100/85">
                                {registerFieldError.hint}
                              </p>
                            ) : null}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={submitStatus === "submitting"}
                          className="w-full py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-2 mt-6 hover:brightness-110 active:scale-95 transition-all text-lg border border-white/20"
                          style={{
                            background:
                              "linear-gradient(135deg, #6160AB 0%, #F07B3C 100%)",
                          }}
                        >
                          {submitStatus === "submitting"
                            ? t(
                                { en: "Reserving...", he: "שריינו לי..." },
                                effectiveLang,
                              )
                            : t(
                                {
                                  en: "Complete Registration",
                                  he: "השלם הרשמה",
                                },
                                effectiveLang,
                              )}
                        </button>
                      </>
                    )}
                  </form>
                )}
              </MagicCard>
            </motion.div>
          )}
        </div>
      </div>

      {/* 2. PROMO CARDS - Section 1 (3 Cards) */}
      {promoBubbles.length > 0 && (
        <div className="container mx-auto px-6 -mt-16 relative z-30">
          <div className="grid md:grid-cols-3 gap-8">
            {promoBubbles.map((bubble, idx) => (
              <div
                key={idx}
                className="bg-white p-12 rounded-[2rem] text-center shadow-xl shadow-gray-200/50 hover:scale-105 transition-all duration-300 border border-gray-100 flex flex-col items-center justify-center min-h-[280px]"
              >
                <div className="w-12 h-12 bg-[#6160AB]/5 rounded-2xl flex items-center justify-center mb-6 border border-[#6160AB]/10">
                  <Star className="w-6 h-6 text-[#6160AB]" />
                </div>
                <h3 className="text-2xl font-black text-hbm-dark mb-3 font-['Sora'] tracking-tight">
                  {t(bubble.title, effectiveLang)}
                </h3>
                <p className="text-hbm-gray text-base leading-relaxed font-['Sofia_Sans'] font-medium">
                  {t(bubble.desc, effectiveLang)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. WHAT AWAITS YOU - Section 2 (Centered Layout) */}
      <section className="py-32 bg-[#FAF9F5]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-20">
            <h4 className="text-[12px] font-black text-[#F07B3C] uppercase tracking-[0.5em] mb-6">
              {t({ en: "THE EXPERIENCE", he: "החוויה" }, effectiveLang)}
            </h4>
            <h2 className="text-5xl md:text-7xl font-black text-hbm-dark tracking-tighter mb-8 leading-[0.9]">
              {t(
                {
                  en: "What awaits you at the event?",
                  he: "מה מחכה לכם באירוע?",
                },
                effectiveLang,
              )}
            </h2>
            {whatToExpect.boldTitle && (
              <p className="text-2xl md:text-3xl font-bold text-[#6160AB] font-['Sora'] mt-4">
                {t(whatToExpect.boldTitle, effectiveLang)}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {(whatToExpect.points || []).map((point, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                <div className="w-16 h-16 rounded-full bg-[#6160AB]/5 flex items-center justify-center font-black text-[#6160AB] text-xl border border-[#6160AB]/10 mb-8 group-hover:bg-[#6160AB] group-hover:text-white transition-all duration-500 shadow-sm">
                  {idx + 1}
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-black text-hbm-dark mb-4 font-['Sora'] tracking-tight">
                    {t(point.title, effectiveLang)}
                  </h3>
                  <p className="text-hbm-gray text-lg font-['Sofia_Sans'] leading-relaxed font-medium px-4">
                    {t(point.desc, effectiveLang)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PARTNERSHIP - Section 3 (Premium Card) */}
      {showPartnership && (
        <div className="container mx-auto px-6 py-20 pb-32">
          <div className="max-w-5xl mx-auto bg-white rounded-[3rem] p-16 md:p-24 text-center shadow-2xl shadow-[#6160AB]/5 border border-white relative overflow-hidden group">
            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#6160AB]/5 rounded-full blur-3xl group-hover:bg-[#F07B3C]/5 transition-colors duration-1000" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#F07B3C]/5 rounded-full blur-3xl group-hover:bg-[#6160AB]/5 transition-colors duration-1000" />

            <div className="relative z-10">
              <h4 className="text-[12px] font-black text-[#F07B3C] uppercase tracking-[0.5em] mb-10">
                {t({ en: "IN PARTNERSHIP WITH", he: "בשיתוף פעולה עם" }, effectiveLang)}
              </h4>
              <h3 className="text-4xl md:text-5xl font-black text-hbm-dark mb-8 tracking-tighter">
                {t(
                  partnership.title || {
                    en: "Our Community Partners",
                    he: "השותפים הקהילתיים שלנו",
                  },
                  effectiveLang,
                )}
              </h3>
              <p className="text-xl text-hbm-gray mb-12 max-w-2xl mx-auto font-['Sofia_Sans'] font-medium leading-relaxed">
                {t(
                  partnership.text || {
                    en: "We unite forces with the best communities to bring you the highest quality networking.",
                    he: "אנחנו מאחדים כוחות עם הקהילות הטובות ביותר כדי להביא לכם את הנטוורקינג האיכותי ביותר.",
                  },
                  effectiveLang,
                )}
              </p>

              {/* Partners Logos */}
              <div className="flex flex-wrap justify-center items-center gap-12 mb-16 px-4">
                {(event.partners || []).length > 0 ? (
                  event.partners.map((partner, pidx) => (
                    <div
                      key={pidx}
                      className="h-20 grayscale hover:grayscale-0 transition-all duration-500 flex items-center justify-center group/logo"
                    >
                      {partner.logo ? (
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="max-h-full object-contain filter drop-shadow hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-14 h-14 bg-gray-50 border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center text-gray-300 group-hover/logo:border-[#6160AB] group-hover/logo:text-[#6160AB] transition-colors">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            {partner.name}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  /* Dummy Logos Placeholder */
                  <div className="flex gap-12 grayscale opacity-30">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="h-2 w-16 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {partnership.link && (
                <a
                  href={partnership.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#6160AB] text-white px-10 py-5 rounded-2xl font-black text-lg hover:scale-[1.05] transition-all shadow-xl shadow-[#6160AB]/20"
                >
                  {t({ en: "Visit Partner Website", he: "לאתר השותף" }, effectiveLang)}
                  <ArrowRight className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. IMPORTANT DETAILS – label + heading + optional free text */}
      {(freeText || imageBubbles.length > 0 || (event.importantDetailsHeading && (event.importantDetailsHeading.en || event.importantDetailsHeading.he))) && (
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <h4 className="text-[12px] font-black text-[#F07B3C] uppercase tracking-[0.5em] mb-6">
            {t(
              event.importantDetailsSectionLabel || { en: "IMPORTANT DETAILS", he: "פרטים נוספים" },
              effectiveLang,
            )}
          </h4>
          <h3 className="text-4xl md:text-5xl font-black text-hbm-dark mb-10 tracking-tighter">
            {t(
              event.importantDetailsHeading || {
                en: "Good to know before you come",
                he: "חשוב לדעת לפני שמגיעים",
              },
              effectiveLang,
            )}
          </h3>
          {freeText && (
            <p className="text-xl md:text-2xl text-hbm-gray font-medium leading-relaxed font-['Sofia_Sans'] max-w-4xl mx-auto">
              {t(freeText, effectiveLang)}
            </p>
          )}
        </div>
      )}

      {/* 6. IMAGE BUBBLES - Section 5 (3 Image Bubbles) */}
      {imageBubbles.length > 0 && (
        <div className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {imageBubbles.map((bubble, idx) => (
              <BubbleContainer
                key={idx}
                bgColor="white"
                fullHeight={false}
                className="!p-0 border-none overflow-hidden hover:scale-105 transition-transform duration-500 shadow-xl group"
              >
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={resolveAsset(bubble.image)}
                    alt={t(bubble.title, effectiveLang)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-6 text-center bg-white border-t border-gray-50">
                  <h3 className="text-lg font-bold text-hbm-dark font-['Sora']">
                    {t(bubble.title, effectiveLang)}
                  </h3>
                  {bubble.desc && (t(bubble.desc, effectiveLang) || "").trim() && (
                    <p className="mt-2 text-sm text-hbm-gray font-['Sofia_Sans'] leading-relaxed">
                      {t(bubble.desc, effectiveLang)}
                    </p>
                  )}
                </div>
              </BubbleContainer>
            ))}
          </div>
        </div>
      )}

      {/* 7. LOCATION & FAQ - Sections 6 & 7 */}
      <div className="bg-[#FAF9F5] py-20">
        <div className="max-w-5xl mx-auto px-6">
          {/* Map Embed */}
          <div className="mb-24">
            <div className="text-center mb-8">
              <h4 className="text-[10px] font-black text-[#F07B3C] uppercase tracking-[0.4em] mb-3">
                {t({ en: "Finding Us", he: "איך מגיעים" }, effectiveLang)}
              </h4>
              {(() => {
                const address = event.locationParams?.addressText || "Dolev 4, Raanana";
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                return (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="event-maps-link inline-flex items-center gap-2 text-2xl md:text-3xl font-black tracking-tighter underline underline-offset-4 transition-colors"
                  >
                    <MapPin className="w-6 h-6 shrink-0" />
                    {address}
                  </a>
                );
              })()}
            </div>
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-white h-[450px] relative group">
              <iframe
                src={(() => {
                  const url =
                    event.locationParams?.googleMapsEmbedUrl ||
                    '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3376.1397762227984!2d34.883918923593654!3d32.20046407390997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d39533fcfa2f7%3A0xa1c863c1f34dd66e!2z15PXldec15EgNCwg16jXoteg16DXlA!5e0!3m2!1siw!2sil!4v1771946116433!5m2!1siw!2sil" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
                  if (!url) return "";
                  if (url.includes("<iframe")) {
                    const match = url.match(/src=["']([^"']+)["']/);
                    return match ? match[1] : "";
                  }
                  return url;
                })()}
                className="w-full h-full"
                loading="lazy"
                allowFullScreen
                title="Event Location"
              ></iframe>
            </div>
          </div>

          {/* Host Note – ציטוט + שם המחבר, ללא עיטורים */}
          {event.hostNote?.message && (
            <div className="max-w-3xl mx-auto mb-24">
              <BubbleContainer
                bgColor="white"
                fullHeight={false}
                className="p-12 !rounded-[3rem] border border-white shadow-xl"
              >
                <p className="text-2xl font-medium text-[#6160AB] leading-relaxed mb-6 text-center whitespace-pre-line">
                  {event.hostNote.message}
                </p>
                <div className="text-center">
                  <div className="font-black text-hbm-dark text-sm uppercase tracking-[0.2em]">
                    {event.hostNote.author || "The HBM Team"}
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    {t({ en: "Marketing Manager at The HBM", he: "מנהל שיווק ב-The HBM" }, effectiveLang)}
                  </div>
                </div>
              </BubbleContainer>
            </div>
          )}

          {/* FAQs */}
          {event.faqs && event.faqs.length > 0 && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
                  Support
                </h4>
                <h2 className="text-4xl font-black text-hbm-dark tracking-tighter">
                  Common Questions
                </h2>
              </div>
              <div className="space-y-4" dir={effectiveLang === "he" ? "rtl" : "ltr"}>
                {event.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="bg-white/60 backdrop-blur-sm rounded-[2rem] overflow-hidden border border-white hover:border-[#6160AB]/20 transition-all hover:shadow-lg"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-8 flex justify-between items-center text-left hover:bg-white transition-colors"
                    >
                      <span
                        className={`font-extrabold tracking-tight transition-colors ${activeFaq === idx ? "text-[#6160AB]" : "text-hbm-dark"}`}
                      >
                        {typeof faq.question === "object" && faq.question !== null
                        ? t(faq.question, effectiveLang)
                        : faq.question}
                      </span>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeFaq === idx ? "bg-[#6160AB] text-white rotate-180" : "bg-gray-100 text-gray-400"}`}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </button>
                    <AnimatePresence>
                      {activeFaq === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <div className="p-8 pt-0 text-hbm-gray font-medium leading-relaxed border-t border-gray-100/30">
                            {typeof faq.answer === "object" && faq.answer !== null
                              ? t(faq.answer, effectiveLang)
                              : faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NextEventHero;
