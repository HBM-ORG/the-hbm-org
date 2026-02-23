import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Image as ImageIcon, ChevronRight, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import EventModal from '../components/Events/EventModal';
import { getNextEvent, getEventsByYear, getEventDateParts } from '../utils/eventUtils';
import { useEvents } from '../context/EventsContext';
import { useI18n, t } from '../i18n/context';
import EyebrowBadge from '../components/EyebrowBadge';

import FeaturedEventCard from '../components/Events/FeaturedEventCard';
import NextVideoEvent from '../components/Home/NextVideoEvent';

const Events = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { events } = useEvents();
  
  // 1. Get Automation Data
  const eventsByYear = useMemo(() => getEventsByYear(events), [events]);
  const nextEvent = useMemo(() => getNextEvent(events), [events]);
  
  // 2. Dynamic Year Handling
  const availableYears = Object.keys(eventsByYear).sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState(availableYears[0] || '2026');

  const currentEvents = eventsByYear[selectedYear] || [];
  
  const [videoEventConfig, setVideoEventConfig] = useState(null)

  useEffect(() => {
    // Static fallback config in case API fails
    const fallbackConfig = {
      title: { en: 'Next Video Connection Event', he: 'אירוע חיבור וידאו הבא' },
      date: '2026-03-24T18:00:00Z',
      description: { en: 'Join us for a global video connection session.', he: 'הצטרפו אלינו למפגש חיבור וידאו גלובלי.' },
      registrationUrl: '/events#register-video'
    };

    const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
    fetch(`${base}/api/video-event`)
      .then(res => res.json())
      .then(data => {
        if (data && data.title && (data.title.en || data.title.he)) {
          setVideoEventConfig(data);
        } else {
          setVideoEventConfig(fallbackConfig);
        }
      })
      .catch(err => {
        console.error("Video Event config fetch error:", err);
        setVideoEventConfig(fallbackConfig);
      });
  }, []);

  const openEventModal = (event) => {
    // If it's a future event, navigate to details page
    if (new Date(event.date) >= new Date()) {
        navigate(`/events/${event.id}`);
    } else {
        setSelectedEvent(event);
        setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      
      {/* 1. Header Section (Who We Are Style) */}
      <section className="bg-[#FAF9F5] pt-20 pb-16">
           <div className="max-w-4xl mx-auto text-center px-6">
               <div className="mb-6">
                   <EyebrowBadge text={t({en: 'EVENTS', he: 'אירועים'}, lang)} />
               </div>
               
               <h1 className="text-4xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#6160AB] to-[#F07B3C] leading-tight" style={{letterSpacing:'-2px'}}>
                   {t({en: 'Our Events', he: 'האירועים שלנו'}, lang)}
               </h1>
               
               <p className="text-xl text-gray-600 font-['Sofia_Sans'] leading-relaxed">
                   {t({
                       en: 'Join us for meaningful 8-minute conversations. From intimate dinners to large community events, every gathering is designed to spark real connection.',
                       he: 'הצטרפו אלינו לשיחות משמעותיות של 8 דקות. מארוחות אינטימיות ועד אירועים קהילתיים גדולים, כל מפגש נועד ליצור חיבור אמיתי.'
                   }, lang)}
               </p>
           </div>
      </section>

      {/* 2. Featured Next Event (Custom Card) */}
      {nextEvent && (
        <FeaturedEventCard event={nextEvent} />
      )}

      {/* Next Video Event (Dynamic via CMS) */}
      {videoEventConfig && (
        <div className="-mt-10">
            <NextVideoEvent config={videoEventConfig} />
        </div>
      )}

      {/* 3. Archive Events Grid */}
      <section className="pb-20 bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto px-6">
            
            <h2 className="text-2xl font-bold text-center mb-10 text-gray-400 uppercase tracking-widest font-['Sora']">
                {t({en: 'Past Events', he: 'אירועי עבר'}, lang)}
            </h2>

            {/* Dynamic Year Toggle */}
            <motion.div
                className="flex justify-center gap-4 mb-12 flex-wrap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {availableYears.map(year => (
                    <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 font-['Sora'] ${
                        selectedYear === year
                            ? 'bg-black text-white shadow-lg scale-105'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-black'
                        }`}
                    >
                        {year}
                    </button>
                ))}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedYear}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {currentEvents.length > 0 ? (
                    currentEvents.map((event, index) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        index={index}
                        onClick={() => openEventModal(event)}
                        lang={lang}
                      />
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 text-gray-400">
                        {t({en: 'No events found for this year.', he: 'לא נמצאו אירועים לשנה זו.'}, lang)}
                    </div>
                )}
              </motion.div>
            </AnimatePresence>
        </div>
      </section>

      {/* Event Modal (For Past Events / Galleries) */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

// Event Card Component (Standardized)
const EventCard = ({ event, index, onClick, lang }) => {
  const { month, day } = getEventDateParts(event.date);
  const isPast = new Date(event.date) < new Date();

  return (
    <motion.div
      className="group relative cursor-pointer"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onClick={onClick}
      whileHover={{ y: -10 }}
    >
      <div className="relative h-full bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
        
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <motion.img
            src={event.thumbnail || event.image}
            alt={t(event.title, lang)}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.7 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

          {/* Date Badge */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm text-center min-w-[60px]">
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{month}</span>
              <span className="block text-2xl font-bold text-gray-900 font-['Sora']">{day}</span>
          </div>


        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-['Sora'] group-hover:text-[#F07B3C] transition-colors line-clamp-1">
            {t(event.title, lang)}
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 font-['Sofia_Sans']">
            <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</div>
            {event.participants > 0 && (
                <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {event.participants}</div>
            )}
          </div>

          <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
              <ImageIcon className="w-4 h-4" />
              {isPast ? t({en: 'View Gallery', he: 'צפו בגלריה'}, lang) : t({en: 'View Details', he: 'פרטים נוספים'}, lang)}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Events;
