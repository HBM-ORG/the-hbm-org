import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Search, X, BookOpen, Youtube, ExternalLink, Star, ChevronRight, PlayCircle, Library, Sparkles, Quote, ArrowUpRight } from 'lucide-react'
import { knowledgeData, knowledgeCategories } from '../data/knowledgeConfig'
import { useBookData } from '../hooks/useBookData'
import EyebrowBadge from '../components/EyebrowBadge'

// --- Components ---

const KnowledgeCard = React.memo(({ item, onClick }) => {
  // Pass manualCoverUrl (from item.coverUrl) to hook
  const { cover, rating, isLoading } = useBookData(item.title, item.author, item.type, item.coverUrl)

  // Image Error Handling (Silver Bullet for 403/404/Dead Links)
  const [imageError, setImageError] = React.useState(false);

  // STRICT FILTER: If not loading and (no cover OR image error), do NOT render.
  if (!isLoading && (!cover || imageError)) return null;

  return (
    <motion.div
      layoutId={`card-${item.id}`}
      onClick={() => onClick(item)}
      className="group relative cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "50px" }}
      whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
    >
      {/* 3D Tilt Container */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg bg-white/50 backdrop-blur-sm border border-white/40 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-hbm-purple/20 group-hover:-rotate-1 group-hover:scale-[1.02]">
        
        {/* Cover Image */}
        {isLoading ? (
          <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
             <BookOpen className="text-gray-300 w-12 h-12" />
          </div>
        ) : (
          <img 
            src={cover} 
            alt={item.title} 
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 p-5 w-full text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
           <div className="flex gap-2 mb-2">
             <span className="text-[10px] font-bold tracking-widest text-hbm-purple-light uppercase bg-black/40 backdrop-blur px-2 py-1 rounded-md border border-white/10">
               {item.category}
             </span>
             {item.type === 'FIGURE' && (
                <span className="text-[10px] font-bold tracking-widest text-blue-200 uppercase bg-blue-900/40 backdrop-blur px-2 py-1 rounded-md border border-blue-500/30">
                  Figure
                </span>
             )}
           </div>
           
           <h3 className="text-lg font-bold leading-tight mb-1 line-clamp-2 text-shadow-sm">{item.title}</h3>
           <p className="text-sm opacity-90 font-medium text-gray-200 line-clamp-1">{item.author}</p>
           
           {/* Rating Badge - Only for Books */}
           {!isLoading && rating && item.type !== 'FIGURE' && (
             <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
               <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-600 text-gray-600'}`} />
                  ))}
               </div>
               <span className="text-xs font-bold ml-1">{rating}</span>
             </div>
           )}
        </div>
      </div>
    </motion.div>
  )
})

const LibraryDrawer = ({ item, onClose }) => {
  if (!item) return null
  // Pass manualCoverUrl here too
  const { cover, description, rating, pageCount, infoLink } = useBookData(item.title, item.author, item.type, item.coverUrl)
  
  // Direct Book Access
  // Use explicit fullBookUrl if available, otherwise search Archive.org
  const bookUrl = item.fullBookUrl || `https://archive.org/search.php?query=${encodeURIComponent(item.title + ' ' + item.author)}`;

  // Scroll Progress Logic
  const [scrollProgress, setScrollProgress] = useState(0)
  const drawerRef = React.useRef(null)

  const handleScroll = () => {
    if (drawerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = drawerRef.current
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100
      setScrollProgress(progress)
    }
  }

  // Scroll to Essence
  const scrollToInsights = () => {
    document.getElementById('insights-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
      />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
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

         {/* Close Button */}
         <button onClick={onClose} className="fixed top-6 right-6 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors z-50 backdrop-blur-md">
            <X size={24} />
         </button>

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
                     <img src={cover} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                     <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-hbm-purple/10 text-hbm-purple text-xs font-bold tracking-wide uppercase">
                          {item.category}
                        </span>
                        {item.type === 'FIGURE' && <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase">Figure</span>}
                     </div>

                     <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-2 text-gray-900 tracking-tight">{item.title}</h2>
                     <p className="text-xl text-gray-600 font-medium mb-6">{item.type === 'FIGURE' ? item.author : `by ${item.author}`}</p>
                     
                     {/* Stats Row */}
                     <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                        {rating && item.type !== 'FIGURE' && (
                           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
                             <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                             <span className="font-bold text-gray-800">{rating}</span>
                           </div>
                        )}
                        {pageCount && item.type !== 'FIGURE' && (
                           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <BookOpen className="w-4 h-4" />
                              <span>{pageCount} pages</span>
                           </div>
                        )}
                     </div>

                     {/* Quick Actions */}
                     <div className="flex flex-wrap gap-3">
                        {/* 'View Insights' Removed as per request */}
                        <a href={bookUrl} target="_blank" rel="noopener noreferrer"
                           className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-hbm-dark text-white border border-transparent px-8 py-4 rounded-xl font-bold text-lg hover:bg-black hover:scale-[1.02] shadow-xl shadow-black/10 transition-all"
                        >
                           <span>Read Full Book</span>
                           <ArrowUpRight size={20} />
                        </a>
                     </div>
                  </div>
               </div>

               {/* NEW: Value-First Content Structure */}
               <div id="insights-section" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  
                  {/* 1. One-Sentence Essence */}
                  {item.essence && (
                    <div className="relative p-10 rounded-2xl bg-white border border-hbm-purple/10 shadow-xl shadow-hbm-purple/5 overflow-hidden">
                       <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-hbm-purple/5 to-transparent rounded-bl-full" />
                       <Quote className="absolute top-8 left-8 text-hbm-purple/20 w-12 h-12" />
                       <p className="relative z-10 text-2xl md:text-3xl font-serif italic text-hbm-dark text-center leading-relaxed">
                          "{item.essence}"
                       </p>
                    </div>
                  )}

                  {/* 2. Key Takeaways */}
                  {item.takeaways && item.takeaways.length > 0 && (
                    <div>
                       <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-hbm-dark uppercase tracking-wider">
                          <Sparkles className="text-yellow-500 fill-yellow-500" size={18} />
                          3 Key Takeaways
                       </h3>
                       <div className="grid gap-4">
                          {item.takeaways.map((takeaway, i) => (
                             <div key={i} className="flex gap-4 p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-hbm-purple/10 flex items-center justify-center text-hbm-purple font-bold text-sm">
                                  {i + 1}
                                </div>
                                <p className="text-gray-700 font-medium leading-relaxed text-lg">{takeaway}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* 3. Deep Dive Summary (New) */}
                  {/* 3. Deep Dive Summary (New) */}
                  {/* 3. Deep Dive Summary (New) */}
                  {(() => {
                     const summary = item.fullSummary 
                        ? item.fullSummary 
                        : (description && description.length > 100 ? description : (item.description && item.description.length > 100 ? item.description : null));
                     
                     if (!summary) return null;

                     return (
                        <div>
                           <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 uppercase tracking-wider">
                              <BookOpen size={18} className="text-hbm-purple" />
                              Deep Dive Summary
                           </h3>
                           <div className="prose prose-lg prose-gray max-w-none bg-white p-8 rounded-2xl border border-gray-100 shadow-sm leading-8">
                              <p className="whitespace-pre-line">{summary.replace(/<[^>]*>?/gm, '')}</p>
                           </div>
                        </div>
                     );
                  })()}

                   {/* 4. Golden Quote (New) */}
                   {item.goldenQuote && (
                     <div className="my-10 p-10 bg-hbm-dark text-white rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        <Quote className="absolute top-6 left-6 text-white/20 w-16 h-16 transform -scale-x-100" />
                        <blockquote className="relative z-10 text-center font-serif text-2xl md:text-3xl italic leading-relaxed">
                           "{item.goldenQuote}"
                        </blockquote>
                        <div className="relative z-10 text-center mt-6 text-white/60 font-sans text-sm font-bold uppercase tracking-widest">
                           — {item.author}
                        </div>
                     </div>
                  )}

                  {/* 5. The HBM Perspective */}
                  {item.hbmPerspective && (
                    <div className="p-8 rounded-xl bg-gradient-to-r from-hbm-purple/10 to-transparent border-l-4 border-hbm-purple">
                       <h3 className="text-sm font-bold text-hbm-purple uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Library size={16} />
                          The HBM Perspective
                       </h3>
                       <p className="text-hbm-dark font-medium text-lg leading-relaxed italic">
                          "{item.hbmPerspective}"
                       </p>
                    </div>
                  )}

               </div>
            </div>
         </div>
      </motion.div>
    </>
  )
}

export default function Knowledge() {
  const [selectedBook, setSelectedBook] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredData = knowledgeData.filter(item => {
    if (!item || !item.title || !item.author) return false;
    const matchesSearch = (item.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          (item.author?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (selectedBook) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [selectedBook])

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-hbm-dark pb-20 selection:bg-hbm-purple selection:text-white">
      
      {/* Visual Alignment Header (Matches Who We Are) */}
      <section className="bg-hbm-cream pt-20 pb-16 border-b border-gray-200/50">
          <div className="max-w-4xl mx-auto text-center px-6">
            <div className="mb-6">
              <EyebrowBadge text="KNOWLEDGE" />
            </div>
            <h1 className="text-4xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] bg-clip-text text-transparent" style={{letterSpacing:'-2px'}}>
               HBM Recommended Books
            </h1>
            <p className="text-xl text-hbm-gray max-w-2xl mx-auto">
               A carefully curated collection of timeless wisdom for the modern mind. From personal development and entrepreneurship to psychology and philosophy.
            </p>
          </div>
      </section>

      {/* Sticky Search Bar (No categories as per request) */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 mb-12 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center">
           
           {/* Search */}
           <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-hbm-purple transition-colors" />
               <input 
                type="text" 
                placeholder="Search the library..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-hbm-purple/20 focus:border-hbm-purple/30 text-sm font-bold transition-all shadow-sm group-hover:shadow-md"
              />
           </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        {filteredData.length > 0 ? (
           <motion.div 
             layout
             className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-10"
           >
             <AnimatePresence mode='popLayout'>
               {filteredData.map((item, index) => (
                   <KnowledgeCard key={item.id} item={item} onClick={setSelectedBook} />
               ))}
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
               <h3 className="text-2xl font-black text-hbm-dark mb-2">Keep Exploring</h3>
               <p className="text-gray-500 font-medium">We couldn't find any books matching your search. Try a different term.</p>
           </motion.div>
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {selectedBook && (
          <LibraryDrawer 
             key="drawer" 
             item={selectedBook} 
             onClose={() => setSelectedBook(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  )
}
