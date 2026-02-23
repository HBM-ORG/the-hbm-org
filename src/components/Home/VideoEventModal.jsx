import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle, ChevronDown, MonitorPlay, MapPin } from 'lucide-react';
import { useI18n, t } from '../../i18n/context';
import { hbmAnalytics } from '../../utils/analytics';
import CountdownTimer from '../Events/CountdownTimer';
import { MagicCard } from '../ui/MagicCard';

const VideoEventModal = ({ isOpen, onClose, config }) => {
    const { lang } = useI18n();
    const [submitStatus, setSubmitStatus] = useState('idle');
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [formState, setFormState] = useState({ name: '', email: '', phone: '', source: '' });

    if (!isOpen || !config) return null;

    const handleRegister = async (e) => {
        e.preventDefault();
        setSubmitStatus('submitting');
        
        try {
            const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
            const res = await fetch(`${base}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formState,
                    eventId: 'video-event',
                    eventName: config.title.en || config.title,
                    language: lang
                })
            });
            
            if (res.ok) {
                hbmAnalytics.recordRegComplete('video-event', config.title.en || config.title, formState.source);
                setSubmitStatus('success');
            } else {
                alert(t({en: 'Registration failed. Please try again.', he: 'ההרשמה נכשלה. אנא נסה שוב.'}, lang));
                setSubmitStatus('idle');
            }
        } catch (err) {
            console.error(err);
            alert(t({en: 'Connection error. Is the server running?', he: 'שגיאת חיבור. האם השרת פועל?'}, lang));
            setSubmitStatus('idle');
        }
    };

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

                        <MagicCard className="p-8 text-center rounded-[40px] shadow-2xl border-white/20 bg-black/40 backdrop-blur-xl group/card" gradientColor="#6160AB">
                            
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
                                    <div className="text-center py-4">
                                        <div className="w-16 h-16 bg-[#39ff14]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <CheckCircle className="w-8 h-8 text-[#39ff14]" />
                                        </div>
                                        <h3 className="text-white font-bold text-xl mb-1">
                                            {t({en: "You're In!", he: "אתם בפנים!"}, lang)}
                                        </h3>
                                        <p className="text-white/60 text-sm mb-4">
                                            {t({en: "Check your email for details.", he: "בדקו את המייל לפרטי ההתחברות."}, lang)}
                                        </p>
                                        <button 
                                            type="button" 
                                            onClick={onClose}
                                            className="w-full py-4 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
                                        >
                                            {t({en: "Close", he: "סגור"}, lang)}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {config.registrationFields?.name !== false && (
                                            <input type="text" placeholder={t({en: "Full Name", he: "שם מלא"}, lang)} required className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F07B3C] focus:bg-black/50 transition-all text-sm backdrop-blur-sm"
                                                value={formState.name} onChange={(e) => setFormState({...formState, name: e.target.value})} />
                                        )}
                                        
                                        {config.registrationFields?.email !== false && (
                                            <input type="email" placeholder={t({en: "Email Address", he: "כתובת אימייל"}, lang)} required className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F07B3C] focus:bg-black/50 transition-all text-sm backdrop-blur-sm"
                                                value={formState.email} onChange={(e) => setFormState({...formState, email: e.target.value})} />
                                        )}
                                        
                                        {config.registrationFields?.phone !== false && (
                                            <input type="tel" placeholder={t({en: "Phone Number", he: "מספר טלפון"}, lang)} required className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F07B3C] focus:bg-black/50 transition-all text-sm backdrop-blur-sm"
                                                value={formState.phone} onChange={(e) => setFormState({...formState, phone: e.target.value})} />
                                        )}
                                        
                                        {/* Source Dropdown */}
                                        <div className="relative">
                                            <select 
                                                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F07B3C] focus:bg-black/50 transition-all text-sm backdrop-blur-sm appearance-none"
                                                value={formState.source} 
                                                onChange={(e) => setFormState({...formState, source: e.target.value})}
                                                required
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

                                        {/* Legal Checkboxes */}
                                        <div className="space-y-3 pt-2 text-left px-1">
                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <div className="relative flex items-center pt-0.5">
                                                    <input type="checkbox" required className="peer sr-only" />
                                                    <div className="w-4 h-4 border border-white/40 rounded bg-white/5 peer-checked:bg-[#F07B3C] peer-checked:border-[#F07B3C] transition-all"></div>
                                                    <CheckCircle className="w-3 h-3 text-white absolute top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                </div>
                                                <span className="text-[10px] text-white/70 leading-tight">
                                                    {t({
                                                        en: <>I approve that I have read and agree to the <a href="/assets/events/ef3d3fe33_HBMTOU-FINAL (1).pdf" target="_blank" className="text-[#F07B3C] hover:underline mx-1">Terms of Use</a> and <a href="/assets/events/af6ef7603_HBMPrivacyPolicyFINAL.pdf" target="_blank" className="text-[#F07B3C] hover:underline mx-1">Privacy Policy</a>.</>,
                                                        he: <>אני מאשר/ת שקראתי והסכמתי ל<a href="/assets/events/ef3d3fe33_HBMTOU-FINAL (1).pdf" target="_blank" className="text-[#F07B3C] hover:underline mx-1">תנאי השימוש</a> ול<a href="/assets/events/af6ef7603_HBMPrivacyPolicyFINAL.pdf" target="_blank" className="text-[#F07B3C] hover:underline mx-1">מדיניות הפרטיות</a>.</>
                                                    }, lang)}
                                                </span>
                                            </label>

                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <div className="relative flex items-center pt-0.5">
                                                    <input type="checkbox" className="peer sr-only" />
                                                    <div className="w-4 h-4 border border-white/40 rounded bg-white/5 peer-checked:bg-[#F07B3C] peer-checked:border-[#F07B3C] transition-all"></div>
                                                    <CheckCircle className="w-3 h-3 text-white absolute top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                </div>
                                                <span className="text-[10px] text-white/50 leading-tight">
                                                    {t({
                                                        en: "I am interested in receiving updates and marketing content from HBM via email and SMS.",
                                                        he: "אני מעוניין/ת לקבל עדכונים ותוכן שיווקי מ-HBM באמצעות דוא\"ל ו-SMS."
                                                    }, lang)}
                                                </span>
                                            </label>
                                        </div>

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
