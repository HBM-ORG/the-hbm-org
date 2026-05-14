import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle, ChevronDown, MonitorPlay, MapPin } from 'lucide-react';
import { useI18n, t } from '../../i18n/context';
import { hbmAnalytics } from '../../utils/analytics';
import CountdownTimer from '../Events/CountdownTimer';
import CalendarDropdown from '../Events/CalendarDropdown';
import { MagicCard } from '../ui/MagicCard';
import { getApiBase } from '../../utils/api';
import { getCtaFormFieldsForVideo } from '../../../../../lib/cta-form-fields.js';
import { registerApiFailureUi } from '../../../../../lib/register-api-error.js';
import { PUBLIC_BRAND } from '../../config/public-brand.js';

const VideoEventModal = ({ isOpen, onClose, config }) => {
    const { lang } = useI18n();
    const [submitStatus, setSubmitStatus] = useState('idle');
    const [registerFieldError, setRegisterFieldError] = useState(null);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        phone: '',
        source: '',
        termsAccepted: false,
        marketingOptIn: false,
    });

    const regFields = getCtaFormFieldsForVideo(config || {});

    const clearRegisterFieldError = (field) => {
        setRegisterFieldError((prev) => (prev?.field === field ? null : prev));
    };

    const fieldRingClass = (field) =>
        registerFieldError?.field === field
            ? 'ring-2 ring-red-400 ring-offset-0 ring-offset-transparent'
            : '';

    const handleRegister = async (e) => {
        e.preventDefault();
        setSubmitStatus('submitting');
        setRegisterFieldError(null);

        try {
            const res = await fetch(`${getApiBase()}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formState.name,
                    email: formState.email,
                    phone: formState.phone,
                    source: formState.source,
                    eventId: 'video-event',
                    eventName: config?.title?.en || config?.title,
                    language: lang,
                    regSource: 'video_event_modal',
                    termsAccepted: formState.termsAccepted === true,
                })
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                hbmAnalytics.recordRegComplete('video-event', config.title.en || config.title, formState.source);
                setSubmitStatus('success');
            } else {
                const ui = registerApiFailureUi(data, t, lang);
                setRegisterFieldError({
                    field: ui.field,
                    message: ui.message,
                    hint: ui.hint,
                });
                setSubmitStatus('idle');
            }
        } catch (err) {
            console.error(err);
            setRegisterFieldError({
                field: null,
                message: t({en: 'Connection error. Is the server running?', he: 'שגיאת חיבור. האם השרת פועל?'}, lang),
            });
            setSubmitStatus('idle');
        }
    };

    if (!isOpen || !config) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" dir={lang === 'he' ? 'rtl' : 'ltr'}>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md"
                    >
                        {/* Close Button */}
                        <button 
                            onClick={onClose}
                            className="absolute -top-12 right-0 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <MagicCard className="p-8 text-center rounded-[40px] shadow-2xl border-white/20 bg-black/40 backdrop-blur-xl group/card !overflow-visible" gradientColor="#6160AB">
                            
                            {/* Header details */}
                            <div className="flex flex-col items-center gap-1 mb-6">
                                <h3 className="text-xl font-bold text-white tracking-wide drop-shadow-md">
                                     {new Date(config.date).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </h3>
                                <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {config.location}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-white/50" />
                                    <span>{config.time}</span>
                                </div>
                            </div>

                            {/* Countdown Timer */}
                            <div className="flex justify-center items-center mb-8 scale-90">
                                <CountdownTimer targetDate={`${config.date.split('T')[0]}T${config.time}:00`} minimal={true} />
                            </div>

                            {/* Registration Form / Action */}
                            {!isRegisterOpen ? (
                                <button onClick={() => {
                                    setIsRegisterOpen(true);
                                    hbmAnalytics.recordRegStart('video-event', config.title.en || config.title);
                                }}
                                    className="w-full py-4 rounded-2xl font-bold text-white text-lg shadow-xl shadow-[#6160AB]/30 border border-white/10 flex items-center justify-center gap-3 group transition-all hover:scale-[1.02] active:scale-95 bg-white/5 hover:bg-white/10 backdrop-blur-md">
                                    {t({ en: 'Reserve My Spot', he: 'שריין מקום' }, lang)}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <form onSubmit={handleRegister} className="space-y-4">
                                {submitStatus === 'success' ? (
                                        <div className="text-center py-4 flex flex-col items-center">
                                            <div className="w-16 h-16 bg-[#39ff14]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <CheckCircle className="w-8 h-8 text-[#39ff14]" />
                                            </div>
                                            <h3 className="text-white font-bold text-2xl mb-1">
                                                {t({en: "You're In!", he: "אתם בפנים!"}, lang)}
                                            </h3>
                                            <p className="text-white/60 text-sm mb-6">
                                                {t({en: "Check your email for details.", he: "בדקו את המייל לפרטי ההתחברות."}, lang)}
                                            </p>

                                            <CalendarDropdown 
                                                eventData={{
                                                    title: t(config.title, lang),
                                                    description: t(config.description, lang),
                                                    location: config.location || 'Video Call',
                                                    startTime: new Date(`${config.date.split('T')[0]}T${config.time}`),
                                                    endTime: new Date(new Date(`${config.date.split('T')[0]}T${config.time}`).getTime() + 60 * 60 * 1000)
                                                }}
                                            />

                                            <button 
                                                type="button" 
                                                onClick={onClose}
                                                className="mt-8 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                                            >
                                                {t({en: "Close", he: "סגור"}, lang)}
                                            </button>
                                        </div>
                                ) : (
                                    <>
                                        {(regFields.name.show || regFields.phone.show) && (
                                            <div className={regFields.name.show && regFields.phone.show ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : ''}>
                                                {regFields.name.show && (
                                                    <input type="text" placeholder={t({en: "Full Name", he: "שם מלא"}, lang)} required={regFields.name.required} className={`w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F07B3C] focus:bg-black/50 transition-all text-sm backdrop-blur-sm ${fieldRingClass('name')}`}
                                                        value={formState.name} onChange={(e) => { clearRegisterFieldError('name'); setFormState({...formState, name: e.target.value}); }} />
                                                )}
                                                {regFields.phone.show && (
                                                    <input type="tel" placeholder={t({en: "Phone Number", he: "מספר טלפון"}, lang)} required={regFields.phone.required} className={`w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F07B3C] focus:bg-black/50 transition-all text-sm backdrop-blur-sm ${fieldRingClass('phone')}`}
                                                        value={formState.phone} onChange={(e) => { clearRegisterFieldError('phone'); setFormState({...formState, phone: e.target.value}); }} />
                                                )}
                                            </div>
                                        )}

                                        {regFields.email.show && (
                                            <input type="email" placeholder={t({en: "Email Address", he: "כתובת אימייל"}, lang)} required={regFields.email.required} className={`w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F07B3C] focus:bg-black/50 transition-all text-sm backdrop-blur-sm ${fieldRingClass('email')}`}
                                                value={formState.email} onChange={(e) => { clearRegisterFieldError('email'); setFormState({...formState, email: e.target.value}); }} />
                                        )}

                                        {regFields.source.show && (
                                        <div className="relative">
                                            <select 
                                                className={`w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F07B3C] focus:bg-black/50 transition-all text-sm backdrop-blur-sm appearance-none ${fieldRingClass('source')}`}
                                                value={formState.source} 
                                                onChange={(e) => { clearRegisterFieldError('source'); setFormState({...formState, source: e.target.value}); }}
                                                required={regFields.source.required}
                                            >
                                                <option value="" disabled className="text-gray-500">
                                                    {t({en: "How did you hear about us?", he: "איך שמעת עלינו?"}, lang)}
                                                </option>
                                                <option value="social" className="text-black">{t({en: "Social Networks", he: "רשתות חברתיות"}, lang)}</option>
                                                <option value="whatsapp" className="text-black">{t({en: "WhatsApp Group", he: "קבוצת וואטסאפ"}, lang)}</option>
                                                <option value="friend" className="text-black">{t({en: "Friend / Word of Mouth", he: "חבר / מפה לאוזן"}, lang)}</option>
                                                <option value="staff" className="text-black">{t({en: "HBM Staff", he: "צוות HBM"}, lang)}</option>
                                                <option value="other" className="text-black">{t({en: "Other", he: "אחר"}, lang)}</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                                        </div>
                                        )}

                                        {(regFields.terms.show || regFields.marketing.show) && (
                                        <div className={`space-y-3 pt-2 text-left px-1 rounded-lg ${fieldRingClass('terms')}`}>
                                            {regFields.terms.show && (
                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <input type="checkbox" required={regFields.terms.required} className="mt-1 w-4 h-4 shrink-0 rounded border-white/40 bg-white/5 text-[#F07B3C] focus:ring-[#F07B3C]" checked={formState.termsAccepted} onChange={(e) => { clearRegisterFieldError('terms'); setFormState({ ...formState, termsAccepted: e.target.checked }); }} />
                                                <span className="text-[10px] text-white/70 leading-tight">
                                                    {t({
                                                        en: <>I approve that I have read and agree to the <a href="/assets/events/ef3d3fe33_HBMTOU-FINAL (1).pdf" target="_blank" className="text-[#F07B3C] hover:underline mx-1">Terms of Use</a> and <a href="/assets/events/af6ef7603_HBMPrivacyPolicyFINAL.pdf" target="_blank" className="text-[#F07B3C] hover:underline mx-1">Privacy Policy</a>.</>,
                                                        he: <>אני מאשר/ת שקראתי והסכמתי ל<a href="/assets/events/ef3d3fe33_HBMTOU-FINAL (1).pdf" target="_blank" className="text-[#F07B3C] hover:underline mx-1">תנאי השימוש</a> ול<a href="/assets/events/af6ef7603_HBMPrivacyPolicyFINAL.pdf" target="_blank" className="text-[#F07B3C] hover:underline mx-1">מדיניות הפרטיות</a>.</>
                                                    }, lang)}
                                                </span>
                                            </label>
                                            )}

                                            {regFields.marketing.show && (
                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <input type="checkbox" className="mt-1 w-4 h-4 shrink-0 rounded border-white/40 bg-white/5 text-[#F07B3C] focus:ring-[#F07B3C]" checked={formState.marketingOptIn} onChange={(e) => setFormState({ ...formState, marketingOptIn: e.target.checked })} />
                                                <span className="text-[10px] text-white/50 leading-tight">
                                                    {t(
                                                        PUBLIC_BRAND.syncSmsAttributeToBrevo
                                                            ? {
                                                                en: "I am interested in receiving updates and marketing content from HBM via email and SMS.",
                                                                he: "אני מעוניין/ת לקבל עדכונים ותוכן שיווקי מ-HBM באמצעות דוא\"ל ו-SMS.",
                                                              }
                                                            : {
                                                                en: "I am interested in receiving updates and marketing content from HBM by email.",
                                                                he: "אני מעוניין/ת לקבל עדכונים ותוכן שיווקי מ-HBM באמצעות דוא\"ל.",
                                                              },
                                                        lang,
                                                    )}
                                                </span>
                                            </label>
                                            )}
                                        </div>
                                        )}

                                        {registerFieldError && (
                                        <div role="alert" className="rounded-xl border border-red-400/50 bg-red-950/40 px-4 py-3 text-left text-sm text-red-100">
                                            <p className="font-semibold">{registerFieldError.message}</p>
                                            {registerFieldError.hint ? (
                                                <p className="mt-1 text-xs text-red-100/85">{registerFieldError.hint}</p>
                                            ) : null}
                                        </div>
                                        )}

                                        <button type="submit" disabled={submitStatus === 'submitting'}
                                            className="w-full py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-2 mt-6 hover:brightness-110 active:scale-95 transition-all text-lg border border-white/20"
                                            style={{ background: 'linear-gradient(135deg, #6160AB 0%, #F07B3C 100%)' }}>
                                            {submitStatus === 'submitting' ? 
                                                t({en: 'Reserving...', he: 'שומר מקום...'}, lang) : 
                                                t({en: 'Complete Registration', he: 'סיום הרשמה'}, lang)
                                            }
                                        </button>
                                    </>
                                )}
                            </form>
                            )}
                        </MagicCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default VideoEventModal;
