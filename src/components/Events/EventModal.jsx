import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n, t } from '../../i18n/context';
import { getEventDateParts } from '../../utils/eventUtils';

const EventModal = ({ event, isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const { lang } = useI18n();
  
  // Reset selected image when modal opens or event changes
  useEffect(() => {
    if (isOpen) setSelectedImage(0);
  }, [isOpen, event]);

  if (!event) return null;

  // Derive date parts
  const { month, day, year } = getEventDateParts(event.date);

  // Determine if event is upcoming (for registration vs gallery)
  // Simple check: if date is today or future
  const eventDate = new Date(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isUpcoming = eventDate >= today;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>

            {/* Content */}
            <div className="h-full overflow-y-auto">
              <div className="max-w-6xl mx-auto p-8 md:p-12">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="bg-[#6160AB]/10 rounded-2xl px-6 py-4 flex-shrink-0">
                      <p className="text-sm font-semibold text-[#6160AB] uppercase tracking-wide">{month}</p>
                      <p className="text-4xl font-bold text-gray-900">{day}</p>
                      <p className="text-sm text-gray-600">{year}</p>
                    </div>

                    <div className="flex-1">
                      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 font-['Sora']">
                        {t(event.title, lang)}
                      </h2>
                      <p className="text-xl text-gray-600 font-['Sofia_Sans']">{t(event.description, lang)}</p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F07B3C]/10 to-[#F07B3C]/5 rounded-full border border-[#F07B3C]/20">
                      <Users className="w-5 h-5 text-[#F07B3C]" />
                      <span className="font-medium font-['Sofia_Sans']">{event.type}</span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#6160AB]/5 rounded-full border border-[#6160AB]/20">
                        <MapPin className="w-5 h-5 text-[#6160AB]" />
                        <span className="font-medium font-['Sofia_Sans']">{event.location}</span>
                      </div>
                    )}

                    {event.participants > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#73C154]/5 rounded-full border border-[#73C154]/20">
                        <Users className="w-5 h-5 text-[#73C154]" />
                        <span className="font-medium font-['Sofia_Sans']">{event.participants} Participants</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery (for past events) */}
                {event.gallery && event.gallery.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 font-['Sora']">
                      {t({ en: 'Event Gallery', he: 'גלריית האירוע' }, lang)}
                    </h3>

                    {/* Main image */}
                    <motion.div
                      className="relative h-96 rounded-3xl overflow-hidden mb-6 shadow-2xl"
                      layoutId={`image-${selectedImage}`}
                    >
                      <img
                        src={event.gallery[selectedImage]}
                        alt={`${t(event.title, lang)} - Image ${selectedImage + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Navigation dots */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {event.gallery.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`h-3 rounded-full transition-all ${
                              index === selectedImage
                                ? 'bg-white w-8'
                                : 'bg-white/50 hover:bg-white/80 w-3'
                            }`}
                          />
                        ))}
                      </div>
                    </motion.div>

                    {/* Thumbnail grid */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {event.gallery.map((img, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`relative aspect-square rounded-2xl overflow-hidden ${
                            index === selectedImage
                              ? 'ring-4 ring-[#6160AB] scale-105'
                              : 'ring-2 ring-gray-200 hover:ring-[#6160AB]/50'
                          } transition-all`}
                          whileHover={{ scale: index === selectedImage ? 1.05 : 1.1 }}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Meeting Message (e.g. if we skip a month) */}
                {event.isSkipped && (
                  <div className="text-center p-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl">
                    <p className="text-2xl text-gray-600 font-['Sofia_Sans']">
                      {t({ 
                        en: 'This month we took a pause to reflect and recharge.', 
                        he: 'החודש הזה לקחנו הפסקה להרהר ולהיטען מחדש.' 
                      }, lang)}
                    </p>
                  </div>
                )}

                {/* Registration CTA (for future events) */}
                {isUpcoming && event.registrationLink && (
                  <div className="text-center p-12 bg-gradient-to-br from-[#6160AB]/10 to-[#F07B3C]/10 rounded-3xl border-2 border-[#6160AB]/20">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4 font-['Sora']">
                      {t({ en: 'Ready to Join Us?', he: 'מוכנים להצטרף אלינו?' }, lang)}
                    </h3>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-['Sofia_Sans']">
                      {t({ 
                        en: 'Register now and be part of meaningful conversations that last a lifetime.', 
                        he: 'הירשמו עכשיו והיו חלק משיחות משמעותיות שנשארות לכל החיים.' 
                      }, lang)}
                    </p>
                    <Link
                      to={event.registrationLink}
                      className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] text-white rounded-full font-semibold text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all font-['Sora']"
                    >
                      {t({ en: 'Register for This Event', he: 'הרשמה לאירוע' }, lang)}
                      <ExternalLink className="w-6 h-6" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EventModal;
