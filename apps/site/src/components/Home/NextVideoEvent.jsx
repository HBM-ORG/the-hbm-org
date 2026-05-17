import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, Video } from 'lucide-react';
import { useI18n, t } from '../../i18n/context';
import VideoEventModal from './VideoEventModal';
import { videoEventStartUtcIso } from '../../../../../lib/video-event-schedule.js';

const DEFAULT_VIDEO_THUMBNAIL = '/assets/events/1_YouTube.png';

const NextVideoEvent = ({ config }) => {
  const { lang } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState(config?.image || DEFAULT_VIDEO_THUMBNAIL);

  // Sync when config.image changes
  React.useEffect(() => {
    setImgSrc(config?.image || DEFAULT_VIDEO_THUMBNAIL);
  }, [config?.image]);

  // If unpublished or no usable title, don't show
  if (
    !config
    || config.published === false
    || !(config.title?.en || config.title?.he)
  ) {
    return null;
  }

  const startUtcIso = videoEventStartUtcIso(config);

  return (
    <>
      <div id="register-video" className="max-w-5xl mx-auto px-6 mb-20 scroll-mt-24">
          <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] p-4 shadow-xl shadow-red-900/5 hover:shadow-2xl hover:shadow-red-900/10 transition-all border border-gray-100 flex flex-col md:flex-row gap-8 items-center group cursor-pointer"
              onClick={() => setIsModalOpen(true)}
          >
              {/* Image Section — fallback to 1_YouTube.png on error or when no image */}
              <div className="w-full md:w-1/2 h-64 md:h-80 relative overflow-hidden rounded-[1.5rem]">
                  <img 
                      src={imgSrc} 
                      alt={t(config.title, lang)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={() => setImgSrc(DEFAULT_VIDEO_THUMBNAIL)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                  
                  {/* Date Badge Overlay */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                      <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">NEXT</span>
                      <span className="block text-lg font-black text-gray-900 font-['Sora'] leading-none">VIDEO</span>
                  </div>
              </div>

              {/* Content Section */}
              <div className="w-full md:w-1/2 flex flex-col items-start pr-6 py-4">
                  
                  {/* Eyebrow */}
                  <div className="flex items-center gap-2 mb-4">
                      <span className="w-2 h-2 rounded-full bg-[#ff3939]/80 shadow-[0_0_10px_#ff3939]"></span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          {t({en: 'NEXT VIDEO CONNECTION', he: 'מפגש הוידאו הבא'}, lang)}
                      </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 font-['Sora'] leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#6160AB] group-hover:to-[#F07B3C] transition-all">
                      {t(config.title, lang)}
                  </h2>

                  {/* Details */}
                  <div className="flex flex-wrap gap-6 text-gray-500 font-medium mb-8 font-['Sofia_Sans']">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <Calendar className="w-5 h-5 text-[#6160AB]" />
                          <span>{new Date(startUtcIso).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })} at {config.time}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <MapPin className="w-5 h-5 text-[#F07B3C]" />
                          <span>{config.location}</span>
                      </div>
                  </div>

                  {/* Button */}
                  <button className="bg-[#1a1a1a] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 group/btn hover:bg-black transition-colors shadow-lg shadow-black/20 w-full md:w-auto justify-center">
                      {t({en: 'Register Now', he: 'הרשמה למפגש'}, lang)}
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform text-[#F07B3C]" />
                  </button>
              </div>
          </motion.div>
      </div>

      <VideoEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        config={config} 
      />
    </>
  );
};

export default NextVideoEvent;
