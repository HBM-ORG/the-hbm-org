import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Calendar, MapPin, Users, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import EventModal from '../components/Events/EventModal';
import { events2025, events2026, nextEvent } from '../data/events';
import { useI18n, t } from '../i18n/context';

const Events = () => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { lang } = useI18n();

  const currentEvents = selectedYear === '2025' ? events2025 : events2026;

  const openEventModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-[#6160AB]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
          }}
        />

        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-[#F07B3C]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
          }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 font-['Sora']">
                        <p className="text-hbm-purple font-semibold text-sm uppercase tracking-widest mb-3">HBM Events - Past and Future</p>
              <span className="bg-gradient-to-r from-[#6160AB] to-[#F07B3C] bg-clip-text text-transparent">
                {t({ en: 'Events', he: 'אירועים' }, lang)}
              </span>
            </h1>
          </motion.div>

          {/* Year Toggle */}
          <motion.div
            className="flex justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <button
              onClick={() => setSelectedYear('2025')}
              className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 font-['Sora'] ${
                selectedYear === '2025'
                  ? 'bg-gradient-to-r from-[#6160AB] to-[#8b7fd9] text-white shadow-2xl scale-105'
                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-[#6160AB]'
              }`}
            >
              2025
            </button>
            <button
              onClick={() => setSelectedYear('2026')}
              className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 font-['Sora'] ${
                selectedYear === '2026'
                  ? 'bg-gradient-to-r from-[#6160AB] to-[#8b7fd9] text-white shadow-2xl scale-105'
                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-[#6160AB]'
              }`}
            >
              2026
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2026 Featured Registration Card */}
      {selectedYear === '2026' && (
        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Side */}
                <div className="relative h-80 md:h-auto">
                  <img
                    src={nextEvent.image}
                    alt={nextEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content Side */}
                <div className="p-12 flex flex-col justify-center">
                  <div className="mb-6">
                    <span className="text-[#F07B3C] text-sm font-bold uppercase tracking-wider">
                      {t(nextEvent.month, lang)}
                    </span>
                    <h2 className="text-5xl font-bold text-white mt-2 mb-4 font-['Sora']">
                      {t(nextEvent.title, lang)}
                    </h2>
                    <p className="text-gray-300 text-lg mb-6 font-['Sofia_Sans']">
                      {t(nextEvent.description, lang)}
                    </p>
                    <div className="flex items-center gap-2 text-gray-400 mb-8">
                       {nextEvent.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-sm font-semibold">
                          {tag}
                        </span>
                       ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      to={nextEvent.registrationLink}
                      className="px-8 py-4 bg-gradient-to-r from-[#F07B3C] to-[#ff9b6b] text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all font-['Sora']"
                    >
                      {t({ en: 'Register', he: 'הרשמה' }, lang)}
                    </Link>
                    <button className="px-8 py-4 border-2 border-white/20 text-white rounded-full font-semibold hover:bg-white/10 transition-all font-['Sora']">
                      {t({ en: 'Details', he: 'פרטים' }, lang)}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Events Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedYear}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {currentEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  onClick={() => openEventModal(event)}
                  lang={lang}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, index, onClick, lang }) => {
  return (
    <motion.div
      className="group relative cursor-pointer"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onClick={onClick}
      whileHover={{ y: -10 }}
    >
      <div className="relative h-full bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100 transition-all duration-300 group-hover:shadow-2xl group-hover:border-[#6160AB]">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <motion.img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Date badge */}
          <motion.div
            className="absolute top-4 left-4 bg-white rounded-2xl px-4 py-3 shadow-lg"
            whileHover={{ scale: 1.1 }}
          >
            <div className="text-center">
              <p className="text-xs font-semibold text-[#6160AB] uppercase tracking-wide">{event.month}</p>
              <p className="text-3xl font-bold text-gray-900 font-['Sora']">{event.day}</p>
            </div>
          </motion.div>

          {/* Face to Face badge */}
          <div className="absolute top-4 right-4 bg-gradient-to-r from-[#F07B3C] to-[#ff9b6b] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
            <Users className="w-4 h-4" />
            {event.type}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#6160AB] transition-colors font-['Sora']">
            {event.title}
          </h3>
          
          <p className="text-gray-600 mb-4 leading-relaxed font-['Sofia_Sans']">
            {event.description}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 font-['Sofia_Sans']">
            {event.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}
            
            {event.participants > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{event.participants}</span>
              </div>
            )}
          </div>

          {/* CTA - Always "View Gallery" */}
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-all font-['Sofia_Sans']">
              <ImageIcon className="w-5 h-5" />
              {t({ en: 'View Gallery', he: 'צפה בגלריה' }, lang)}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hover shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 pointer-events-none"
          initial={{ x: '-100%' }}
          whileHover={{
            x: '100%',
            transition: { duration: 0.8 }
          }}
        />
      </div>
    </motion.div>
  );
};

export default Events;
