import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, MapPin, ChevronDown, Edit3, Settings } from 'lucide-react';
import { useI18n, t } from '../../i18n/context';
import { MagicCard } from '../ui/MagicCard';
import BubbleContainer from '../BubbleContainer';
import CountdownTimer from './CountdownTimer';

const NextEventHero = ({ event }) => {
  const { lang } = useI18n();
  const [activeFaq, setActiveFaq] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [formState, setFormState] = useState({ name: '', email: '', phone: '' });
  const [submitStatus, setSubmitStatus] = useState('idle');

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
      setSubmitStatus('submitting');
      setTimeout(() => setSubmitStatus('success'), 1500);
  };

  return (
    <div className="min-h-screen bg-hbm-cream font-['Sora'] pb-20">
      
      {/* 1. HERO SECTION (Constrained Height) */}
      <div className="relative w-full flex flex-col items-center justify-center text-center overflow-hidden" style={{ minHeight: '600px', maxHeight: '80vh' }}>
        
        {/* Background Media */}
        <div className="absolute inset-0 z-0 h-full w-full">
            {event.heroStyle?.type === 'video' && event.heroVideo ? (
                <video src={event.heroVideo} autoPlay loop muted className="w-full h-full object-cover"
                    style={{ filter: `brightness(${event.heroStyle?.brightness || 60}%) blur(${event.heroStyle?.blur || 0}px)` }} />
            ) : (
                <img src={event.image || '/assets/default-hero.jpg'} alt="Event Background" className="w-full h-full object-cover"
                    style={{ filter: `brightness(${event.heroStyle?.brightness || 60}%) blur(${event.heroStyle?.blur || 0}px)` }} />
            )}
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-hbm-cream to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl px-6 w-full flex flex-col items-center h-full justify-center pt-20">
            
            {/* Pill Badge - Fixed Logic */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="px-5 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-white text-xs font-bold tracking-widest uppercase shadow-lg">
                    {isPast ? t({en: 'PAST EVENT', he: 'אירוע עבר'}, lang) : t({en: 'UPCOMING EXPERIENCE', he: 'החוויה הבאה'}, lang)}
                </div>
            </motion.div>

            {/* Title */}
            <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="text-6xl md:text-8xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl selection:bg-purple-500/30 relative group"
            >
                {isEditable ? (
                    <div 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => onUpdate('title', { ...event.title, [lang]: e.target.innerText })}
                        className="outline-none border-b-2 border-transparent hover:border-white/20 focus:border-purple-500 transition-colors cursor-text empty:before:content-['Title'] empty:before:text-white/30"
                    >
                        {t(event.title, lang)}
                    </div>
                ) : (
                    t(event.title, lang)
                )}
                
                {isEditable && <Edit3 className="w-6 h-6 text-white/20 absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}
            </motion.h1>
            
            <motion.p 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }} 
                className="text-xl md:text-2xl text-white/90 font-medium mb-12 max-w-2xl mx-auto drop-shadow-lg leading-relaxed relative group"
            >
                {isEditable ? (
                    <div 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => onUpdate('description', { ...event.description, [lang]: e.target.innerText })}
                        className="outline-none border-b-2 border-transparent hover:border-white/20 focus:border-purple-500 transition-colors cursor-text min-h-[1.5em]"
                    >
                        {t(event.description, lang)}
                    </div>
                ) : (
                    t(event.description, lang)
                )}
                 {isEditable && <Edit3 className="w-5 h-5 text-white/20 absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}
            </motion.p>
            
            {/* Countdown & Registration BUBBLE */}
            {!isPast && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full max-w-md mx-auto">
                    <MagicCard className="p-8 text-center rounded-[40px] shadow-2xl border-white/20 bg-black/40 backdrop-blur-xl relative group/card" gradientColor="#6160AB">
                        
                        {/* EDIT LINK OVERLAY */}
                        {isEditable && (
                            <div className="absolute top-4 right-4 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                <button className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 backdrop-blur-sm" title="Edit Card Style">
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Event Info (Minimal) - Integrated into Bubble */}
                        <div className="flex flex-col items-center gap-1 mb-6">
                            {isEditable ? (
                                <input 
                                    type="datetime-local" 
                                    value={event.date} 
                                    onChange={(e) => onUpdate('date', e.target.value)}
                                    className="bg-transparent text-white font-bold text-center border-b border-white/20 hover:border-white focus:outline-none focus:border-purple-500 w-full"
                                />
                            ) : (
                                <h3 className="text-xl font-bold text-white tracking-wide drop-shadow-md cursor-pointer hover:text-gray-200 transition-colors" title={isEditable ? "Click to Edit Date" : ""}>{event.date}</h3>
                            )}
                            
                            <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                                <span className="w-1 h-1 rounded-full bg-white/50" />
                                <span>20:00 - 23:00</span>
                            </div>
                        </div>

                        {/* Countdown Header */}
                        <div className="flex justify-center items-center mb-8 scale-90">
                            <CountdownTimer targetDate={event.date} minimal={true} />
                        </div>

                        {/* Registration Form / Action */}
                        {!isRegisterOpen ? (
                            <button onClick={() => setIsRegisterOpen(true)}
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
                                        <h3 className="text-white font-bold text-xl mb-1">You're In!</h3>
                                        <p className="text-white/60 text-sm mb-4">Check your email for details.</p>
                                        <button type="button" className="text-xs bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
                                            Add to Calendar
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <input type="text" placeholder="Full Name" required className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F07B3C] focus:bg-black/50 transition-all text-sm backdrop-blur-sm"
                                            value={formState.name} onChange={(e) => setFormState({...formState, name: e.target.value})} />
                                        <input type="email" placeholder="Email Address" required className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F07B3C] focus:bg-black/50 transition-all text-sm backdrop-blur-sm"
                                            value={formState.email} onChange={(e) => setFormState({...formState, email: e.target.value})} />
                                        <input type="tel" placeholder="Phone Number" required className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F07B3C] focus:bg-black/50 transition-all text-sm backdrop-blur-sm"
                                            value={formState.phone} onChange={(e) => setFormState({...formState, phone: e.target.value})} />
                                        
                                        {/* Source Dropdown */}
                                        <div className="relative">
                                            <select 
                                                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F07B3C] focus:bg-black/50 transition-all text-sm backdrop-blur-sm appearance-none"
                                                value={formState.source || ''} 
                                                onChange={(e) => setFormState({...formState, source: e.target.value})}
                                                required
                                            >
                                                <option value="" disabled className="text-gray-500">How did you hear about us?</option>
                                                <option value="social" className="text-black">Social Networks</option>
                                                <option value="whatsapp" className="text-black">WhatsApp Group</option>
                                                <option value="friend" className="text-black">Friend / Word of Mouth</option>
                                                <option value="staff" className="text-black">HBM Staff</option>
                                                <option value="other" className="text-black">Other</option>
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
                                                    I approve that I have read and agree to the 
                                                    <a href="/assets/events/ef3d3fe33_HBMTOU-FINAL (1).pdf" target="_blank" className="text-[#F07B3C] hover:underline mx-1">Terms of Use</a>
                                                    and
                                                    <a href="/assets/events/af6ef7603_HBMPrivacyPolicyFINAL.pdf" target="_blank" className="text-[#F07B3C] hover:underline mx-1">Privacy Policy</a>.
                                                </span>
                                            </label>

                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <div className="relative flex items-center pt-0.5">
                                                    <input type="checkbox" className="peer sr-only" />
                                                    <div className="w-4 h-4 border border-white/40 rounded bg-white/5 peer-checked:bg-[#F07B3C] peer-checked:border-[#F07B3C] transition-all"></div>
                                                    <CheckCircle className="w-3 h-3 text-white absolute top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                </div>
                                                <span className="text-[10px] text-white/50 leading-tight">
                                                    I am interested in receiving updates and marketing content from HBM via email and SMS.
                                                </span>
                                            </label>
                                        </div>

                                        <button type="submit" disabled={submitStatus === 'submitting'}
                                            className="w-full py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-2 mt-6 hover:brightness-110 active:scale-95 transition-all text-lg border border-white/20"
                                            style={{ background: 'linear-gradient(135deg, #6160AB 0%, #F07B3C 100%)' }}>
                                            {submitStatus === 'submitting' ? 'Reserving...' : 'Complete Registration'}
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

      {/* 3. DYNAMIC SECTIONS (Highlights, Map, Partners) */}
      <div className="bg-hbm-cream py-20 relative z-20 -mt-10">
          <BubbleContainer bgColor="white">
            <div className="max-w-5xl mx-auto px-6 pt-10">
                
                {/* Event Highlights */}
                {event.highlights && event.highlights.length > 0 && (
                     <div className="grid md:grid-cols-3 gap-8 mb-20">
                         {event.highlights.map((item, idx) => (
                             <div key={idx} className="bg-hbm-cream p-8 rounded-3xl text-center hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[#F07B3C]/20">
                                 <div className="w-12 h-12 bg-[#F07B3C]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#F07B3C]">
                                     <Star className="w-6 h-6" />
                                 </div>
                                 <h3 className="text-xl font-bold text-hbm-dark mb-2">{item.title}</h3>
                                 <p className="text-hbm-gray text-sm leading-relaxed">{item.description}</p>
                             </div>
                         ))}
                     </div>
                )}

                {/* Partners Section */}
                {event.partners && event.partners.length > 0 && (
                     <div className="mb-20 text-center">
                         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">In Partnership With</h3>
                         <div className="flex flex-wrap justify-center items-center gap-12 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                             {event.partners.map((partner, idx) => (
                                 <div key={idx} className="flex flex-col items-center gap-2 group">
                                    {partner.logo ? (
                                        <img src={partner.logo} alt={partner.name} className="h-16 object-contain" />
                                    ) : (
                                        <span className="text-xl font-bold text-gray-300 group-hover:text-gray-500">{partner.name}</span>
                                    )}
                                 </div>
                             ))}
                         </div>
                     </div>
                )}

                {/* Map Embed */}
                {event.locationParams?.googleMapsEmbedUrl && (
                     <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-200 h-96 mb-20 relative group">
                         <iframe 
                             src={event.locationParams.googleMapsEmbedUrl} 
                             className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
                             loading="lazy"
                             allowFullScreen
                         ></iframe>
                         <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2">
                             <MapPin className="w-3 h-3 text-[#F07B3C]"/> {event.location}
                         </div>
                     </div>
                )}

                {/* FAQs */}
                {event.faqs && event.faqs.length > 0 && (
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-hbm-dark mb-10">Common Questions</h2>
                        <div className="space-y-4">
                            {event.faqs.map((faq, idx) => (
                                <div key={idx} className="bg-hbm-cream rounded-2xl overflow-hidden border border-gray-100">
                                    <button 
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full p-6 flex justify-between items-center text-left hover:bg-white transition-colors"
                                    >
                                        <span className="font-bold text-hbm-dark">{faq.question}</span>
                                        <ChevronDown className={`w-5 h-5 text-hbm-gray transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {activeFaq === idx && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                <div className="p-6 pt-0 text-hbm-gray text-sm leading-relaxed border-t border-gray-200/50">
                                                    {faq.answer}
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
          </BubbleContainer>
      </div>

    </div>
  );
};

export default NextEventHero;
