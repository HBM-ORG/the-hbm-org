
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Apple, ChevronDown } from 'lucide-react';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../../utils/calendar';
import { useI18n, t } from '../../i18n/context';

const CalendarDropdown = ({ eventData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { lang } = useI18n();
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoogle = () => {
    window.open(generateGoogleCalendarUrl(eventData), '_blank');
    setIsOpen(false);
  };

  const handleApple = async () => {
    await downloadIcsFile(eventData);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block mt-4" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all font-bold text-sm outline-none focus:ring-2 focus:ring-[#F07B3C]/50"
      >
        <Calendar className="w-4 h-4" />
        {t({ en: 'Add to Calendar', he: 'הוספה ליומן' }, lang)}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-56 bg-black/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 py-2 z-[120] overflow-hidden"
          >
            <div className="px-4 py-2 border-b border-white/5 mb-1">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t({ en: 'Select provider', he: 'בחר יומן' }, lang)}</span>
            </div>
            <button
              onClick={handleGoogle}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors"
              dir={lang === 'he' ? 'rtl' : 'ltr'}
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-5 h-5" alt="Google" />
              </div>
              <span>Google Calendar</span>
            </button>
            <button
              onClick={handleApple}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors"
              dir={lang === 'he' ? 'rtl' : 'ltr'}
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Apple className="w-5 h-5 text-white" />
              </div>
              <span>Apple / Outlook</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarDropdown;
