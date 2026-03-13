import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Search,
  X,
  BookOpen,
  Youtube,
  ExternalLink,
  Star,
  ChevronRight,
  PlayCircle,
  Library,
  Sparkles,
  Quote,
  ArrowUpRight,
} from "lucide-react";
import { knowledgeData, knowledgeCategories } from "../data/knowledgeConfig";
import { useBookData } from "../hooks/useBookData";
import EyebrowBadge from "../components/EyebrowBadge";
import NextPageBridge from "../components/NextPageBridge";
import SEO from "../components/SEO";
import { useI18n, t } from "../i18n/context";
import { getApiBase } from "../utils/api";

// --- Components ---

const VideoCard = React.memo(({ item, index }) => {
  const getEmbedUrl = (url) => {
    try {
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11
        ? `https://www.youtube.com/embed/${match[2]}`
        : null;
    } catch {
      return null;
    }
  };

  const embedUrl = getEmbedUrl(item.youtubeUrl);
  const isLarge = index % 5 === 0; // Bento logic: every 5th video is large

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group relative bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 transition-all duration-700 flex flex-col ${isLarge ? "md:col-span-2 md:row-span-2" : ""}`}
      style={{ "--accent": item.accentColor || "#6160AB" }}
    >
      <div
        className={`relative overflow-hidden bg-black/5 ${isLarge ? "aspect-[16/10]" : "aspect-video"}`}
      >
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={item.title}
            className="w-full h-full border-none opacity-90 group-hover:opacity-100 transition-opacity"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <Youtube className="w-12 h-12 mb-2 opacity-20" />
          </div>
        )}

        {item.category && item.category !== "Interview" && item.category !== "Interviews" && (
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className="text-[9px] font-black tracking-widest text-white uppercase bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/20">
              {item.category}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 flex flex-col flex-shrink-0">
        <h3
          className={`font-black text-hbm-dark mb-1.5 tracking-tight leading-tight group-hover:text-[var(--accent)] transition-colors ${isLarge ? "text-xl md:text-3xl" : "text-base md:text-lg"}`}
        >
          {item.title}
        </h3>
        <p
          className={`text-gray-600 font-medium leading-relaxed overflow-visible whitespace-normal ${isLarge ? "text-sm md:text-base" : "text-xs md:text-sm"}`}
          style={{ WebkitLineClamp: "unset", display: "block" }}
        >
          {item.description}
        </p>
      </div>
    </motion.div>
  );
});

const KnowledgeCard = React.memo(({ item, onClick, index }) => {
  const { cover, rating, isLoading } = useBookData(
    item.title,
    item.author,
    item.type,
    item.coverUrl,
    { includeAi: false },
  );
  const [imageError, setImageError] = React.useState(false);

  const hasValidCover = cover && !imageError;

  const isFeatured = item.featured || index === 0; // First item or explicitly featured

  return (
    <motion.div
      layoutId={`card-${item.id}`}
      onClick={() => onClick(item)}
      className={`group relative cursor-pointer ${isFeatured ? "md:col-span-2 md:row-span-2" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "50px" }}
      whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
    >
      <div
        className={`relative rounded-2xl overflow-hidden shadow-lg bg-white/50 backdrop-blur-sm border border-white/40 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-hbm-purple/20 group-hover:-rotate-1 group-hover:scale-[1.02] ${isFeatured ? "aspect-[2/3] md:aspect-auto h-full" : "aspect-[2/3]"}`}
      >
        {isLoading ? (
          <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
            <BookOpen className="text-gray-300 w-12 h-12" />
          </div>
        ) : hasValidCover ? (
          <img
            src={cover}
            alt={item.title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-hbm-dark flex flex-col items-center justify-center p-6 text-center transition-transform duration-700 group-hover:scale-110">
            <BookOpen className="text-white/10 w-24 h-24 mb-4" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

        <div className="absolute bottom-0 left-0 p-6 w-full text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex gap-2 mb-3">
            <span className="text-[10px] font-bold tracking-widest text-[#FDFBF7] uppercase bg-hbm-purple/80 backdrop-blur px-2 py-1 rounded-md border border-white/10">
              {item.category}
            </span>
          </div>

          <h3
            className={`${isFeatured ? "text-lg md:text-3xl" : "text-base md:text-lg"} font-black leading-tight mb-1 text-shadow-sm`}
          >
            {item.title}
          </h3>
          <p className="text-[10px] md:text-sm opacity-90 font-bold text-gray-200 uppercase tracking-wider">
            {item.author}
          </p>

          {!isLoading && rating && item.type !== "FIGURE" && (
            <div className="flex items-center gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-600 text-gray-600"}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold ml-1">{rating}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

const LibraryDrawer = ({ item, onClose }) => {
  if (!item) return null;
  // Pass manualCoverUrl here too
  const {
    cover,
    description: fetchedDescription,
    rating,
    pageCount,
    infoLink,
  } = useBookData(item.title, item.author, item.type, item.coverUrl, {
    includeAi: false,
  });

  // Direct Book Access
  // Use explicit fullBookUrl if available, otherwise search Archive.org
  const bookUrl =
    item.fullBookUrl ||
    `https://archive.org/search.php?query=${encodeURIComponent(item.title + " " + item.author)}`;

  // Book Schema for SEO
  const bookSchema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: item.title,
    author: {
      "@type": "Person",
      name: item.author,
    },
    description: item.essence || item.description || fetchedDescription,
    image: cover,
    genre: item.category,
    numberOfPages: pageCount,
  };

  // Scroll Progress Logic
  const [scrollProgress, setScrollProgress] = useState(0);
  const drawerRef = React.useRef(null);

  const handleScroll = () => {
    if (drawerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = drawerRef.current;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(progress);
    }
  };

  // Scroll to Essence
  const scrollToInsights = () => {
    document
      .getElementById("insights-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <SEO
        title={`${item.title} by ${item.author} | HBM Growth Library`}
        description={item.essence || item.description || fetchedDescription}
        image={cover}
        schema={bookSchema}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
        className="fixed top-0 right-0 h-full w-full md:max-w-2xl bg-white/95 backdrop-blur-2xl shadow-2xl z-[70] overflow-hidden border-l border-white/50 flex flex-col"
      >
        {/* Reading Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 z-50 bg-gray-100">
          <motion.div
            className="h-full bg-gradient-to-r from-hbm-purple to-pink-500"
            style={{ width: `${scrollProgress}%` }}
            initial={{ width: 0 }}
          />
        </div>

        {/* Close (X) — rendered in portal so always viewport top-right, visible on mobile */}
        {typeof document !== "undefined" &&
          createPortal(
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="fixed w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-gray-900 hover:bg-black text-white shadow-xl border-2 border-white/30 transition-colors"
              style={{
                top: "max(0.75rem, env(safe-area-inset-top, 0px))",
                right: "max(0.75rem, env(safe-area-inset-right, 0px))",
                zIndex: 9999,
              }}
              aria-label="Close"
            >
              <X size={22} strokeWidth={2.5} />
            </button>,
            document.body,
          )}

        {/* Scrollable Content Container */}
        <div
          ref={drawerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
        >
          <div className="p-6 pt-20 md:p-12 md:pt-24 bg-gradient-to-br from-white via-gray-50 to-gray-100/50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-8 mb-10 items-start">
              <div className="w-40 md:w-48 shrink-0 aspect-[2/3] rounded-xl shadow-2xl overflow-hidden relative rotate-1 border-4 border-white transform hover:rotate-0 transition-transform duration-500">
                {cover ? (
                  <img
                    src={cover}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-hbm-dark flex flex-col items-center justify-center p-4 text-center">
                    <BookOpen className="text-white/20 w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.category && item.category !== "Interview" && item.category !== "Interviews" && (
                    <span className="inline-block px-3 py-1 rounded-full bg-hbm-purple/10 text-hbm-purple text-xs font-bold tracking-wide uppercase">
                      {item.category}
                    </span>
                  )}
                  {item.type === "FIGURE" && (
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase">
                      Figure
                    </span>
                  )}
                </div>

                <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-2 text-gray-900 tracking-tight">
                  {item.title}
                </h2>
                <p className="text-xl text-gray-600 font-medium mb-6">
                  {item.type === "FIGURE" ? item.author : `by ${item.author}`}
                </p>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                  {rating && item.type !== "FIGURE" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-gray-800">{rating}</span>
                    </div>
                  )}
                  {pageCount && item.type !== "FIGURE" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <BookOpen className="w-4 h-4" />
                      <span>{pageCount} pages</span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  {/* 'View Insights' Removed as per request */}
                  <a
                    href={bookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-hbm-dark text-white border border-transparent px-8 py-4 rounded-xl font-bold text-lg hover:bg-black hover:scale-[1.02] shadow-xl shadow-black/10 transition-all"
                  >
                    <span>Read Full Book</span>
                    <ArrowUpRight size={20} />
                  </a>
                </div>
              </div>
            </div>

            {/* NEW: Value-First Content Structure */}
            <div
              id="insights-section"
              className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              {/* 1. Author Wisdom Quote */}
              {item.authorQuote && (
                <div className="relative p-10 rounded-2xl bg-white border border-purple-100 shadow-xl shadow-purple-500/5 overflow-hidden">
                  <Quote className="absolute top-8 left-8 text-purple-200 w-12 h-12" />
                  <p className="relative z-10 text-2xl md:text-3xl font-serif italic text-gray-800 text-center leading-relaxed">
                    "{item.authorQuote}"
                  </p>
                  <div className="text-center mt-4 text-purple-400 font-bold uppercase tracking-widest text-[10px]">
                    Author Wisdom
                  </div>
                </div>
              )}

              {/* 2. 3 Key Insights */}
              {item.threeKeySentences && item.threeKeySentences.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-hbm-dark uppercase tracking-wider">
                    <Sparkles
                      className="text-yellow-500 fill-yellow-500"
                      size={18}
                    />
                    Core insights
                  </h3>
                  <div className="grid gap-4">
                    {item.threeKeySentences.map((sentence, i) => (
                      <div
                        key={i}
                        className="flex gap-4 p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="shrink-0 w-8 h-8 rounded-full bg-hbm-purple/10 flex items-center justify-center text-hbm-purple font-bold text-sm">
                          {i + 1}
                        </div>
                        <p className="text-gray-700 font-medium leading-relaxed text-lg">
                          {sentence}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Deep Dive Summary (New) */}
              {(() => {
                const summary =
                  item.fullSummary ||
                  fetchedDescription ||
                  item.description ||
                  item.essence;
                if (!summary || summary.length < 10) return null;

                return (
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 uppercase tracking-wider">
                      <BookOpen size={18} className="text-hbm-purple" />
                      Deep Dive Summary
                    </h3>
                    <div className="space-y-6">
                      <h3 className="text-xl font-black text-hbm-dark uppercase tracking-widest border-b-2 border-hbm-dark w-fit pb-1">
                        Master Summary
                      </h3>
                      <div className="prose prose-xl prose-gray max-w-none bg-[#FCFAF7] p-10 rounded-2xl border border-gray-200 shadow-inner leading-relaxed font-serif text-gray-800 italic">
                        <p className="whitespace-pre-line leading-10 text-xl md:text-2xl">
                          {summary.replace(/<[^>]*>?/gm, "")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 4. Closing Power Quote */}
              {item.finalQuote && (
                <div className="my-10 p-10 bg-hbm-dark text-white rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  <Quote className="absolute top-6 left-6 text-white/20 w-16 h-16 transform -scale-x-100" />
                  <blockquote className="relative z-10 text-center font-serif text-2xl md:text-3xl italic leading-relaxed">
                    "{item.finalQuote}"
                  </blockquote>
                  <div className="relative z-10 text-center mt-6 text-white/40 font-sans text-sm font-bold uppercase tracking-widest">
                    — Closing Thought
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default function Knowledge() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("books"); // 'books' | 'videos'
  const [cmsData, setCmsData] = useState(null);

  const books = useMemo(() => cmsData?.books || knowledgeData, [cmsData]);
  const videos = useMemo(() => cmsData?.videos || [], [cmsData]);

  // Load CMS Data (single API base; fallback to static config if backend unavailable)
  useEffect(() => {
    fetch(`${getApiBase()}/api/cms/knowledge-base`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && (Array.isArray(data.books) || Array.isArray(data.videos))) {
          setCmsData(data);
        } else {
          setCmsData({
            books: [],
            videos: [],
          });
        }
      })
      .catch(() =>
        setCmsData({
          books: [],
          videos: [],
        }),
      );
  }, []);

  // Sync state with URL params
  useEffect(() => {
    if (id) {
      const book = books.find((b) => b.id === id || String(b.id) === id);
      if (book) {
        setSelectedBook(book);
        setActiveTab("books");
      } else {
        const video = videos.find((v) => v.id === id || String(v.id) === id);
        if (video) {
          setActiveTab("videos");
        }
      }
    } else {
      setSelectedBook(null);
    }
  }, [id, books, videos]);

  const handleSelectBook = (book) => {
    if (book) {
      const slug = book.title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
      navigate(`/knowledge/${book.id}/${slug}`);
    } else {
      navigate("/knowledge");
    }
  };

  const handleCloseDrawer = () => {
    navigate("/knowledge");
  };

  const filteredData = (
    activeTab === "books" ? books || [] : videos || []
  ).filter((item) => {
    if (!item || !item.title) return false;
    const searchLow = searchQuery.toLowerCase();
    const titleMatch = (item.title?.toLowerCase() || "").includes(searchLow);
    const authorMatch = (item.author?.toLowerCase() || "").includes(searchLow);
    const descMatch = (item.description?.toLowerCase() || "").includes(
      searchLow,
    );

    return titleMatch || authorMatch || descMatch;
  });

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (selectedBook) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedBook]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-hbm-dark pb-20 selection:bg-hbm-purple selection:text-white">
      <SEO
        title={
          selectedBook
            ? `${selectedBook.title} | ${t({ en: "Knowledge", he: "בסיס הידע" }, lang)}`
            : t(
                {
                  en: "The Growth Library | Wisdom & Insights",
                  he: "בסיס הידע | תובנות וחוכמה",
                },
                lang,
              )
        }
        description={
          selectedBook
            ? selectedBook.fullSummary ||
              selectedBook.description ||
              selectedBook.essence
            : t(
                {
                  en: "Explore our collection of curated books and videos for personal growth and human connection.",
                  he: "גלו את אוסף הספרים והסרטונים שלנו לצמיחה אישית וחיבור אנושי.",
                },
                lang,
              )
        }
        image={selectedBook?.coverImage}
        schema={
          selectedBook
            ? {
                "@context": "https://schema.org",
                "@type": "Book",
                name: selectedBook.title,
                author: { "@type": "Person", name: selectedBook.author },
                description:
                  selectedBook.fullSummary ||
                  selectedBook.description ||
                  selectedBook.essence,
                image: selectedBook.coverImage,
              }
            : undefined
        }
      />

      {/* Visual Alignment Header – מובייל: צמוד למעלה כמו דסקטופ */}
      <section className="bg-hbm-cream pt-4 pb-2 md:pt-12 md:pb-6 border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-6">
          <div className="mb-2 md:mb-6">
            <EyebrowBadge text="KNOWLEDGE" />
          </div>
          <h1
            className="text-2xl font-bold mb-2 md:text-7xl md:mb-4 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] bg-clip-text text-transparent"
            style={{ letterSpacing: "-2px" }}
          >
            The Growth Library
          </h1>
          <p className="hidden md:block text-xl text-hbm-gray max-w-2xl mx-auto">
            A carefully curated collection of timeless wisdom for the modern
            mind. From personal development and entrepreneurship to psychology
            and philosophy.
          </p>
        </div>
      </section>

      {/* Sticky Tab Bar – צמוד ללמעלה */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 mb-4 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 md:py-3 flex flex-col md:flex-row items-center justify-center gap-6">
          {/* Tab Switcher */}
          <div className="flex bg-gray-100/50 p-1 rounded-2xl border border-gray-200/50">
            <button
              onClick={() => setActiveTab("books")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === "books" ? "bg-white text-[#6160AB] shadow-md" : "text-gray-400 hover:text-gray-600"}`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Books</span>
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === "videos" ? "bg-white text-[#F07B3C] shadow-md" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Youtube className="w-4 h-4" />
              <span>Videos</span>
            </button>
          </div>

          {/* Search Removed by User Request */}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6">
        {filteredData.length > 0 ? (
          <motion.div
            layout
            className={`grid gap-4 md:gap-6 grid-flow-dense ${activeTab === "books" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}
          >
            <AnimatePresence mode="popLayout">
              {filteredData.map((item, idx) =>
                activeTab === "books" ? (
                  <KnowledgeCard
                    key={item.id}
                    item={item}
                    onClick={handleSelectBook}
                    index={idx}
                  />
                ) : (
                  <VideoCard key={item.id} item={item} index={idx} />
                ),
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Stylish Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-black text-hbm-dark mb-2">
              Keep Exploring
            </h3>
            <p className="text-gray-500 font-medium">
              We couldn't find any {activeTab} matching your search. Try a
              different term.
            </p>
          </motion.div>
        )}
      </div>

      {/* CTA: About Us (above Be a Part / Newsletter) */}
      <NextPageBridge
        to="/about"
        eyebrow={{ en: "Who we are", he: "מי אנחנו" }}
        title={{ en: "Meet the team", he: "הכירו את הצוות" }}
        description={{
          en: "The people and the vision behind The HBM.",
          he: "האנשים והחזון מאחורי ה-HBM.",
        }}
        buttonText={{ en: "About Us", he: "עלינו" }}
      />

      {/* Drawer */}
      <AnimatePresence>
        {selectedBook && (
          <LibraryDrawer
            key="drawer"
            item={selectedBook}
            onClose={handleCloseDrawer}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
