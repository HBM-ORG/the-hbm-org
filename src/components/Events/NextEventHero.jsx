import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, MapPin, ChevronDown, Edit3, Settings, Star } from 'lucide-react';
import { useI18n, t } from '../../i18n/context';
import { MagicCard } from '../ui/MagicCard';
import BubbleContainer from '../BubbleContainer';
import CountdownTimer from './CountdownTimer';
import { hbmAnalytics } from '../../utils/analytics';

const NextEventHero = ({ event, isEditable = false, onUpdate = () => {}, onUpload = () => {}, visuals = {} }) => {
  const { lang } = useI18n();
  // ... existing state ...
  const [activeFaq, setActiveFaq] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [formState, setFormState] = useState({ name: '', email: '', phone: '' });
  const [submitStatus, setSubmitStatus] = useState('idle');

  // Visuals from props or defaults
  const brightness = visuals.brightness || 100;
  const blur = visuals.blur || 0;
  const videoScale = visuals.videoScale || 1.0;
  const overlayOpacity = visuals.overlayOpacity ?? 40;

  // ... rest of logic ...
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
      
      try {
          const res = await fetch('http://localhost:3001/api/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ...formState,
                  eventId: event.id,
                  eventName: event.title.en || event.title
              })
          });
          
          if (res.ok) {
              hbmAnalytics.recordRegComplete(event.id, event.title.en || event.title, formState.source);
              setSubmitStatus('success');
          } else {
              alert('Registration failed. Please try again.');
              setSubmitStatus('idle');
          }
      } catch (err) {
          console.error(err);
          alert('Connection error. Is the server running?');
          setSubmitStatus('idle');
      }
  };

  return (
    <div className="min-h-screen bg-hbm-cream font-['Sora'] pb-20">
      
      {/* 1. HERO SECTION (Constrained Height) */}
      <div className="relative w-full flex flex-col items-center justify-center text-center overflow-hidden" style={{ minHeight: '900px' }}>
        
        {/* Background Media */}
        <div className="absolute inset-0 z-0 h-full w-full bg-gray-900">
            {event.heroVideo ? (
                <video src={event.heroVideo} autoPlay loop muted className="w-full h-full object-cover transition-all duration-300"
                    style={{ filter: `brightness(${brightness}%) blur(${blur}px)`, transform: `scale(${videoScale})` }} />
            ) : (
                <img src={event.heroImage || '/assets/default-hero.jpg'} alt="Event Background" className="w-full h-full object-cover transition-all duration-300"
                    style={{ filter: `brightness(${brightness}%) blur(${blur}px)`, transform: `scale(${videoScale})` }} />
            )}
            <div className="absolute inset-0 bg-black transition-opacity duration-300" style={{ opacity: overlayOpacity / 100 }} />
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-hbm-cream via-hbm-cream/80 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-4xl px-6 w-full flex flex-col items-center h-full justify-center pt-40 pb-40">
            
            {/* Status Badges & Admin Controls */}
            <div className="absolute top-10 left-10 z-50 flex items-center gap-3">
                {event.status === 'draft' && (
                    <div className="bg-amber-400 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-200/50 flex items-center gap-2 animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full" /> Draft Mode
                    </div>
                )}
                {isEditable && (
                    <button 
                        onClick={() => onUpdate('openSettings', true)}
                        className="bg-white/90 backdrop-blur-xl text-gray-900 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-white hover:bg-[#6160AB] hover:text-white transition-all flex items-center gap-2 group"
                    >
                        <Settings className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" /> Visual Edit
                    </button>
                )}
            </div>

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
                            <button onClick={() => {
                                setIsRegisterOpen(true);
                                hbmAnalytics.recordRegStart(event.id, event.title.en || event.title);
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
                     <div className="mb-24 text-center">
                         <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10">In Partnership With</h3>
                         <div className="flex flex-wrap justify-center items-center gap-16 lg:gap-24 px-10">
                             {event.partners.map((partner, idx) => (
                                 <a 
                                    key={idx} 
                                    href={partner.website || partner.link || '#'} 
                                    target={(partner.website || partner.link) ? "_blank" : "_self"}
                                    rel="noopener noreferrer"
                                    className={`group transition-all duration-500 hover:scale-110 ${(partner.website || partner.link) ? 'cursor-pointer' : 'cursor-default'}`}
                                 >
                                    {partner.logo ? (
                                        <div className="relative">
                                            <img src={partner.logo} alt={partner.name} className="h-10 lg:h-12 object-contain filter grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-[#F07B3C] opacity-0 group-hover:opacity-100 transition-opacity">
                                                {partner.name}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-xl font-black text-gray-300 group-hover:text-[#6160AB] transition-colors tracking-tighter">{partner.name}</span>
                                    )}
                                 </a>
                             ))}
                         </div>
                     </div>
                )}

                {/* Map Embed */}
                {event.locationParams?.googleMapsEmbedUrl && (
                    <div className="mb-24">
                        {event.locationParams.addressText && (
                            <div className="text-center mb-8">
                                <h4 className="text-[10px] font-black text-[#F07B3C] uppercase tracking-[0.4em] mb-3">Finding Us</h4>
                                <h3 className="text-3xl font-black text-hbm-dark tracking-tighter">{event.locationParams.addressText}</h3>
                            </div>
                        )}
                        <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 h-96 relative group">
                         <iframe 
                             src={(() => {
                                 const url = event.locationParams.googleMapsEmbedUrl;
                                 if (!url) return '';
                                 if (url.includes('<iframe')) {
                                     const match = url.match(/src=["']([^"']+)["']/);
                                     return match ? match[1] : url;
                                 }
                                 return url;
                             })()} 
                             className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
                             loading="lazy"
                             allowFullScreen
                         ></iframe>
                         <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 pointer-events-none">
                             <MapPin className="w-3 h-3 text-[#F07B3C]"/> {event.location}
                         </div>
                     </div>
                    </div>
                )}

                {/* Host Note */}
                {event.hostNote?.message && (
                    <div className="max-w-3xl mx-auto mb-24 relative">
                        <div className="absolute -top-12 -left-4 text-9xl font-black text-[#F07B3C]/5 font-serif select-none">"</div>
                        <div className="bg-white/40 backdrop-blur-xl p-12 rounded-[3rem] border border-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Star className="w-24 h-24 text-[#6160AB]" />
                            </div>
                            <p className="text-2xl font-medium text-hbm-dark leading-relaxed mb-8 relative z-10">
                                {event.hostNote.message}
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden shadow-lg border-2 border-white">
                                    {event.hostNote.avatar ? <img src={event.hostNote.avatar} className="w-full h-full object-cover" /> : null}
                                </div>
                                <div>
                                    <div className="font-black text-hbm-dark text-sm uppercase tracking-wide">{event.hostNote.author}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Event Host</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gallery Grid */}
                {event.gallery && event.gallery.length > 0 && (
                     <div className="mb-24">
                         <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10 text-center">Event Moments</h3>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             {event.gallery.map((img, idx) => (
                                 <motion.div 
                                    key={idx}
                                    whileHover={{ scale: 1.02, rotation: idx % 2 === 0 ? 1 : -1 }}
                                    className={`relative aspect-square rounded-3xl overflow-hidden shadow-md transform transition-all duration-500 ${idx % 3 === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                                 >
                                     <img 
                                        src={img.startsWith('http') || img.startsWith('/assets') ? img : `/assets/events/${event.folderName || 'general'}/${img}`} 
                                        className="w-full h-full object-cover" 
                                        alt="" 
                                     />
                                     <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                 </motion.div>
                             ))}
                         </div>
                     </div>
                )}

                {/* FAQs */}
                {event.faqs && event.faqs.length > 0 && (
                    <div className="max-w-2xl mx-auto">
                         <div className="text-center mb-12">
                             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Support</h3>
                             <h2 className="text-4xl font-black text-hbm-dark tracking-tighter">Common Questions</h2>
                         </div>
                        <div className="space-y-4 text-right" dir={lang === 'he' ? 'rtl' : 'ltr'}>
                            {event.faqs.map((faq, idx) => (
                                <div key={idx} className="bg-white/40 backdrop-blur-sm rounded-[2rem] overflow-hidden border border-white hover:border-[#6160AB]/20 transition-all hover:shadow-lg">
                                    <button 
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full p-8 flex justify-between items-center text-left hover:bg-white transition-colors"
                                    >
                                        <span className="font-extrabold text-hbm-dark tracking-tight">{faq.question}</span>
                                        <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-all ${activeFaq === idx ? 'bg-[#6160AB] text-white rotate-180' : 'text-gray-400'}`}>
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {activeFaq === idx && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                <div className="p-8 pt-0 text-hbm-gray font-medium leading-relaxed border-t border-gray-100/50">
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
