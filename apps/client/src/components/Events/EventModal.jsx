import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n, t } from "../../i18n/context";
import { getEventDateParts } from "../../utils/eventUtils";

const isVideoUrl = (url) => /\.(mp4|webm|mov|MP4|WEBM|MOV)$/i.test(url || "");

const EventModal = ({ event, isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [failedImageUrls, setFailedImageUrls] = useState(new Set());
  const { lang } = useI18n();

  // Only items from Media Gallery (non-empty strings); never use imageCount or placeholders
  const gallery = (event?.gallery || []).filter(
    (item) => typeof item === "string" && item.trim(),
  );

  const resolveSrc = (item) => {
    if (typeof item !== "string" || !item.trim()) return "";
    return item.startsWith("http") || item.startsWith("/assets")
      ? item
      : `/assets/events/${event?.folderName || "general"}/${item}`;
  };

  // On site: show only image items that load (no video in Event Gallery; video belongs in Hero Cinema)
  const displayGallery = gallery.filter(
    (item) =>
      !failedImageUrls.has(resolveSrc(item)) &&
      !isVideoUrl(resolveSrc(item)),
  );

  useEffect(() => {
    if (isOpen) setFailedImageUrls(new Set());
  }, [isOpen, event]);

  useEffect(() => {
    if (isOpen) setSelectedImage(0);
  }, [isOpen, event]);
  useEffect(() => {
    if (displayGallery.length > 0 && selectedImage >= displayGallery.length) {
      setSelectedImage(Math.max(0, displayGallery.length - 1));
    }
  }, [displayGallery.length, selectedImage]);

  if (!event) return null;

  // Derive date parts and full date string (month name + day + year)
  const { month, day, year } = getEventDateParts(event.date);
  const eventDateObj = new Date(event.date);
  const fullDateStr = Number.isNaN(eventDateObj.getTime())
    ? `${month} ${day}, ${year}`
    : eventDateObj.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

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

          {/* Modal – more top inset on mobile so bubble doesn't go off screen and X is visible */}
          <motion.div
            className="fixed inset-x-3 top-[max(3.5rem,env(safe-area-inset-top,0.875rem))] bottom-3 sm:inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl sm:rounded-3xl shadow-2xl z-50 overflow-hidden max-w-full"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Content – prevent horizontal overflow on mobile; close button is sticky so X always visible when scrolling */}
            <div className="h-full overflow-y-auto overflow-x-hidden">
              {/* Sticky bar with close button – always visible on scroll */}
              <div className="sticky top-0 left-0 right-0 z-20 flex justify-end p-3 sm:p-4 bg-white/95 backdrop-blur-sm border-b border-gray-100/80 shrink-0">
                <button
                  onClick={onClose}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all border border-gray-100"
                  aria-label={t({ en: "Close", he: "סגור" }, lang)}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </button>
              </div>
              <div className="max-w-6xl mx-auto w-full min-w-0 px-4 py-4 sm:py-6 sm:p-6 md:p-8 lg:p-12">
                {/* Header – date above title; title & description aligned left with location */}
                <div className="mb-6 sm:mb-8 min-w-0">
                  <div className="flex flex-col gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="bg-[#6160AB]/10 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 w-fit">
                      <p className="text-lg sm:text-xl font-bold text-gray-900 capitalize">
                        {fullDateStr}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 font-['Sora'] break-words">
                        {t(event.title, lang)}
                      </h2>
                      <p className="text-base sm:text-xl text-gray-600 font-['Sofia_Sans'] break-words">
                        {t(event.description, lang)}
                      </p>
                    </div>
                  </div>

                  {/* Meta – only location, same left alignment as title */}
                  {event.location && (
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-600 min-w-0">
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#6160AB]/5 rounded-full border border-[#6160AB]/20">
                        <MapPin className="w-5 h-5 text-[#6160AB]" />
                        <span className="font-medium font-['Sofia_Sans']">
                          {event.location}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Gallery – show all images from admin; hide only those that fail to load */}
                {displayGallery.length > 0 && displayGallery[selectedImage] && (
                  <div className="mb-6 sm:mb-8 min-w-0 w-full">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 font-['Sora']">
                      {t({ en: "Event Gallery", he: "גלריית האירוע" }, lang)}
                    </h3>

                    {/* Main image or video – large area, full image visible (no crop), responsive */}
                    <motion.div
                      className="relative min-h-[40vh] sm:min-h-[55vh] md:min-h-[65vh] max-h-[85vh] w-full max-w-full rounded-2xl sm:rounded-3xl overflow-hidden mb-4 sm:mb-6 shadow-2xl bg-gray-100 flex items-center justify-center"
                      layoutId={`image-${selectedImage}`}
                    >
                      {(() => {
                        const item = displayGallery[selectedImage];
                        const src = resolveSrc(item);
                        if (isVideoUrl(src)) {
                          return (
                            <video
                              src={src}
                              controls
                              playsInline
                              className="w-full h-full max-h-[85vh] object-contain"
                              onError={(e) => {
                                const target = e?.currentTarget;
                                if (target?.src) setFailedImageUrls((prev) => new Set(prev).add(target.src));
                              }}
                            />
                          );
                        }
                        return (
                          <img
                            src={src}
                            alt={`${t(event.title, lang)} - Image ${selectedImage + 1}`}
                            className="w-full h-full max-h-[85vh] object-contain"
                            onError={(e) => {
                              const target = e?.currentTarget;
                              if (target?.src) setFailedImageUrls((prev) => new Set(prev).add(target.src));
                            }}
                          />
                        );
                      })()}

                      {/* Navigation dots */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {displayGallery.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`h-3 rounded-full transition-all ${
                              index === selectedImage
                                ? "bg-white w-8"
                                : "bg-white/50 hover:bg-white/80 w-3"
                            }`}
                          />
                        ))}
                      </div>
                    </motion.div>

                    {/* Thumbnail grid – image, video, or placeholder if failed (e.g. HEIC); responsive, no overflow */}
                    <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4 w-full min-w-0">
                      {displayGallery.map((img, index) => {
                        const src = resolveSrc(img);
                        const isVideo = isVideoUrl(src);
                        return (
                          <motion.button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`relative aspect-square rounded-2xl overflow-hidden bg-gray-100 ${
                              index === selectedImage
                                ? "ring-4 ring-[#6160AB] scale-105"
                                : "ring-2 ring-gray-200 hover:ring-[#6160AB]/50"
                            } transition-all`}
                            whileHover={{
                              scale: index === selectedImage ? 1.05 : 1.1,
                            }}
                          >
                            {isVideo ? (
                              <video
                                src={src}
                                muted
                                playsInline
                                loop
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e?.currentTarget;
                                  if (target?.src) setFailedImageUrls((prev) => new Set(prev).add(target.src));
                                }}
                              />
                            ) : (
                              <img
                                src={src}
                                alt={`${t(event.title, lang)} ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e?.currentTarget;
                                  if (target?.src) setFailedImageUrls((prev) => new Set(prev).add(target.src));
                                }}
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* No Meeting Message (e.g. if we skip a month) */}
                {event.isSkipped && (
                  <div className="text-center p-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl">
                    <p className="text-2xl text-gray-600 font-['Sofia_Sans']">
                      {t(
                        {
                          en: "This month we took a pause to reflect and recharge.",
                          he: "החודש הזה לקחנו הפסקה להרהר ולהיטען מחדש.",
                        },
                        lang,
                      )}
                    </p>
                  </div>
                )}

                {/* Registration CTA (for future events) */}
                {isUpcoming && event.registrationLink && (
                  <div className="text-center p-12 bg-gradient-to-br from-[#6160AB]/10 to-[#F07B3C]/10 rounded-3xl border-2 border-[#6160AB]/20">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4 font-['Sora']">
                      {t(
                        { en: "Ready to Join Us?", he: "מוכנים להצטרף אלינו?" },
                        lang,
                      )}
                    </h3>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-['Sofia_Sans']">
                      {t(
                        {
                          en: "Register now and be part of meaningful conversations that last a lifetime.",
                          he: "הירשמו עכשיו והיו חלק משיחות משמעותיות שנשארות לכל החיים.",
                        },
                        lang,
                      )}
                    </p>
                    <Link
                      to={event.registrationLink}
                      className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] text-white rounded-full font-semibold text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all font-['Sora']"
                    >
                      {t(
                        { en: "Register for This Event", he: "הרשמה לאירוע" },
                        lang,
                      )}
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
