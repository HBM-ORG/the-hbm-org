import React, { useState, useEffect } from 'react';
import { Settings, Save, Upload, X, MapPin, Calendar, Image as ImageIcon, Video, Sun, Droplets, Eye, ArrowLeft, Trash2, GripVertical, Sparkles } from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import NextEventHero from '../Events/NextEventHero';

// This component wraps the public NextEventHero but injects "Edit Mode" props
const VisualEventEditor = ({ event, onUpdate, onSave, onClose, uploading, onUpload, stats, registrations }) => {
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('logistics'); // logistics, visuals, gallery, partners

    // Listen for keyboard shortcut (Cmd+S)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                onSave(e);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onSave]);

    // Generic Upload Handler
    const handleFileUpload = async (e, fieldPath, subfolder = null) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Safety Check for Folder Name
        const folderName = event.folderName || `event-${event.id}-${Date.now()}`;
        
        const newPaths = [];
        
        for (const file of files) {
            const formData = new FormData();
            formData.append('folderName', folderName);
            if (subfolder) formData.append('subfolder', subfolder);
            formData.append('asset', file);

            try {
                const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
                const res = await fetch(`${base}/api/upload-asset`, { method: 'POST', body: formData });
                if (!res.ok) throw new Error(`Server responded with ${res.status}`);
                const data = await res.json();
                
                if (data.success) {
                    const finalPath = data.path ? `/assets/events/${folderName}/${data.path}` : `/assets/events/${folderName}/${data.filename}`;
                    newPaths.push(finalPath);
                    
                    if (fieldPath === 'heroMedia') {
                        // Dynamically determine if it's a video or image based on extension
                        const isVideo = /\.(mp4|mov|webm)$/i.test(finalPath);
                        if (isVideo) {
                            onUpdate('heroVideo', finalPath);
                            onUpdate('heroImage', ''); // Clear image
                            onUpdate('image', ''); 
                        } else {
                            onUpdate('heroImage', finalPath);
                            onUpdate('image', finalPath); // Set image for thumbnail
                            onUpdate('heroVideo', ''); // Clear video
                        }
                    } else if (fieldPath !== 'gallery') {
                        onUpdate(fieldPath, finalPath);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }


        if (fieldPath === 'gallery' && newPaths.length > 0) {
            onUpdate('gallery', [...(event.gallery || []), ...newPaths]);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-100 z-50 flex overflow-hidden font-sans">
            
            {/* MAIN PREVIEW AREA (Large) */}
            <div className="flex-1 relative h-full bg-white shadow-2xl z-10 flex flex-col">
                
                {/* Visual Edit Toolbar (Floating) */}
                <div className="absolute top-6 left-6 z-50 flex gap-2">
                    <button onClick={onClose} className="bg-white/90 backdrop-blur text-gray-800 p-3 rounded-full shadow-lg hover:bg-white transition-all border border-gray-200 group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 text-sm font-bold text-gray-500">
                        <Eye className="w-4 h-4" /> Preview Mode
                    </div>
                </div>

                {/* THE ACTUAL COMPONENT - RENDERED IN EDIT MODE */}
                <div className="flex-1 overflow-y-auto scrollbar-hide relative bg-black">
                    <NextEventHero 
                        event={event} 
                        lang="en" // Force EN for editing
                        isEditable={true} 
                        onUpdate={onUpdate}
                        onUpload={handleFileUpload}
                        visuals={event.visuals || { brightness: 100, blur: 0 }}
                    />
                    
                    {/* Overlay for Hero Upload (if not handled inside component) */}
                    <div className="absolute top-8 right-8 z-40 group flex flex-col gap-2 items-end">
                         <label className="cursor-pointer bg-white/90 hover:bg-white text-gray-900 px-6 py-3 rounded-2xl backdrop-blur-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all border border-white shadow-2xl hover:scale-105 active:scale-95 group">
                             <ImageIcon className="w-4 h-4 text-[#F07B3C] group-hover:rotate-12 transition-transform" /> Change Media (Image/Video)
                             <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'heroMedia')} />
                         </label>
                    </div>
                </div>

            </div>

            {/* SETTINGS DRAWER (Side Panel) */}
            <div className={`w-[400px] bg-white/80 backdrop-blur-3xl border-l border-white/20 shadow-2xl transition-all duration-500 flex flex-col h-full ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full absolute right-0 h-full'}`}>
                
                {/* Drawer Header */}
                <div className="p-6 border-b border-gray-200/50 flex justify-between items-center bg-white/40">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Settings</h2>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                
                {/* Visual Tabs */}
                <div className="px-6 pt-6">
                    <div className="flex bg-gray-100/50 p-1 rounded-xl mb-2 border border-gray-200/50">
                        {['logistics', 'content', 'visuals', 'gallery', 'partners'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'}`}
                            >
                                {activeTab === tab && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white shadow-sm ring-1 ring-black/5 rounded-xl z-0"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{tab}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide pb-32">

                    {activeTab === 'logistics' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                             {/* Status Toggle */}
                             <div className="bg-gray-100/50 p-4 rounded-2xl border border-gray-200/50 flex items-center justify-between">
                                 <div>
                                     <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Event Status</h4>
                                     <p className="text-sm font-bold capitalize">{event.status || 'draft'}</p>
                                 </div>
                                 <button 
                                     onClick={() => onUpdate('status', event.status === 'published' ? 'draft' : 'published')}
                                     className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${event.status === 'published' ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-amber-400 text-white shadow-lg shadow-amber-200'}`}
                                 >
                                     Make {event.status === 'published' ? 'Draft' : 'Public'}
                                 </button>
                             </div>

                             {/* Date & Location Inputs */}
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-purple-600 transition-colors">
                                    <Calendar className="w-4 h-4" /> Date & Time
                                </label>
                                <input 
                                    type="datetime-local" 
                                    value={event.date} 
                                    onChange={(e) => onUpdate('date', e.target.value)}
                                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm focus:bg-white"
                                />
                            </div>
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-pink-600 transition-colors">
                                    <MapPin className="w-4 h-4" /> Location Name
                                </label>
                                <input 
                                    type="text" 
                                    value={event.location} 
                                    onChange={(e) => onUpdate('location', e.target.value)}
                                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-sm focus:bg-white"
                                />
                            </div>
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-amber-600 transition-colors">
                                    <MapPin className="w-4 h-4" /> Map Header Text
                                </label>
                                <input 
                                    type="text" 
                                    value={event.locationParams?.addressText || ''} 
                                    onChange={(e) => onUpdate('locationParams', { ...(event.locationParams || {}), addressText: e.target.value })}
                                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm focus:bg-white"
                                    placeholder="e.g., Hidden Location in Tel Aviv"
                                />
                            </div>
                             {/* Maps URL */}
                             <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-blue-600 transition-colors">
                                    <MapPin className="w-4 h-4" /> Google Maps Embed
                                </label>
                                <textarea 
                                    value={event.locationParams?.googleMapsEmbedUrl || ''}
                                    onChange={(e) => {
                                        const newParams = { ...(event.locationParams || {}), googleMapsEmbedUrl: e.target.value };
                                        onUpdate('locationParams', newParams);
                                    }}
                                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-[10px] font-mono h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm focus:bg-white text-gray-500"
                                    placeholder="<iframe src=...>"
                                />
                            </div>
                        </div>
                    )}
                    {activeTab === 'content' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
                            {/* 1. PROMO CARDS */}
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F07B3C] border-b pb-2">Promo Cards (Top 3)</h4>
                                {(event.promoBubbles || []).slice(0, 3).map((promo, idx) => (
                                    <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black text-gray-400">Card #{idx + 1}</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Title (EN/HE)</label>
                                                <input value={promo.title?.en} onChange={(e) => {
                                                    const newPromos = [...event.promoBubbles];
                                                    newPromos[idx] = { ...newPromos[idx], title: { ...newPromos[idx].title, en: e.target.value } };
                                                    onUpdate('promoBubbles', newPromos);
                                                }} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs mb-2" placeholder="EN Title" />
                                                <input value={promo.title?.he} dir="rtl" onChange={(e) => {
                                                    const newPromos = [...event.promoBubbles];
                                                    newPromos[idx] = { ...newPromos[idx], title: { ...newPromos[idx].title, he: e.target.value } };
                                                    onUpdate('promoBubbles', newPromos);
                                                }} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-right" placeholder="כותרת בעברית" />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Description (EN/HE)</label>
                                                <textarea value={promo.desc?.en} onChange={(e) => {
                                                    const newPromos = [...event.promoBubbles];
                                                    newPromos[idx] = { ...newPromos[idx], desc: { ...newPromos[idx].desc, en: e.target.value } };
                                                    onUpdate('promoBubbles', newPromos);
                                                }} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs mb-2 resize-none" rows="2" placeholder="EN Desc" />
                                                <textarea value={promo.desc?.he} dir="rtl" onChange={(e) => {
                                                    const newPromos = [...event.promoBubbles];
                                                    newPromos[idx] = { ...newPromos[idx], desc: { ...newPromos[idx].desc, he: e.target.value } };
                                                    onUpdate('promoBubbles', newPromos);
                                                }} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-right resize-none" rows="2" placeholder="תיאור בעברית" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 2. WHAT AWAITS YOU (Section Details) */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6160AB] border-b pb-2">Experience Highlights (Center)</h4>
                                <div>
                                    <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Bold Introduction (EN/HE)</label>
                                    <input value={event.whatToExpect?.boldTitle?.en} onChange={(e) => {
                                        onUpdate('whatToExpect', { ...event.whatToExpect, boldTitle: { ...event.whatToExpect.boldTitle, en: e.target.value } });
                                    }} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs mb-2" placeholder="EN Intro" />
                                    <input value={event.whatToExpect?.boldTitle?.he} dir="rtl" onChange={(e) => {
                                        onUpdate('whatToExpect', { ...event.whatToExpect, boldTitle: { ...event.whatToExpect.boldTitle, he: e.target.value } });
                                    }} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-right" placeholder="פתיח בעברית" />
                                </div>
                                
                                <div className="space-y-4 pt-4">
                                    {(event.whatToExpect?.points || []).map((point, idx) => (
                                        <div key={idx} className="bg-[#6160AB]/5 border border-[#6160AB]/10 rounded-2xl p-5 space-y-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-black text-[#6160AB]">Point #{idx + 1}</span>
                                            </div>
                                            <input value={point.title?.en} onChange={(e) => {
                                                const newPoints = [...event.whatToExpect.points];
                                                newPoints[idx] = { ...newPoints[idx], title: { ...newPoints[idx].title, en: e.target.value } };
                                                onUpdate('whatToExpect.points', newPoints);
                                            }} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs" placeholder="EN Point Title" />
                                            <textarea value={point.desc?.en} onChange={(e) => {
                                                const newPoints = [...event.whatToExpect.points];
                                                newPoints[idx] = { ...newPoints[idx], desc: { ...newPoints[idx].desc, en: e.target.value } };
                                                onUpdate('whatToExpect.points', newPoints);
                                            }} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs resize-none" rows="2" placeholder="EN Point Desc" />
                                            <input value={point.title?.he} dir="rtl" onChange={(e) => {
                                                const newPoints = [...event.whatToExpect.points];
                                                newPoints[idx] = { ...newPoints[idx], title: { ...newPoints[idx].title, he: e.target.value } };
                                                onUpdate('whatToExpect.points', newPoints);
                                            }} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-right" placeholder="כותרת בעברית" />
                                            <textarea value={point.desc?.he} dir="rtl" onChange={(e) => {
                                                const newPoints = [...event.whatToExpect.points];
                                                newPoints[idx] = { ...newPoints[idx], desc: { ...newPoints[idx].desc, he: e.target.value } };
                                                onUpdate('whatToExpect.points', newPoints);
                                            }} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-right resize-none" rows="2" placeholder="תיאור בעברית" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 3. FREE TEXT */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Bottom Free Text</h4>
                                <textarea 
                                    value={event.freeText?.en || (typeof event.freeText === 'string' ? event.freeText : '')} 
                                    onChange={(e) => {
                                        const newValue = typeof event.freeText === 'object' ? { ...event.freeText, en: e.target.value } : { en: e.target.value, he: '' };
                                        onUpdate('freeText', newValue);
                                    }}
                                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm"
                                    placeholder="Additional English details..."
                                />
                                <textarea 
                                    value={event.freeText?.he || ''} 
                                    dir="rtl"
                                    onChange={(e) => {
                                        const newValue = typeof event.freeText === 'object' ? { ...event.freeText, he: e.target.value } : { en: '', he: e.target.value };
                                        onUpdate('freeText', newValue);
                                    }}
                                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm text-right"
                                    placeholder="פרטים נוספים בעברית..."
                                />
                            </div>

                            {/* Original Host Note */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Host Note</h4>
                                <div className="group">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Message</label>
                                    <textarea 
                                        value={event.hostNote?.message || ''} 
                                        onChange={(e) => onUpdate('hostNote', { ...(event.hostNote || {}), message: e.target.value })}
                                        className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm focus:bg-white"
                                        placeholder="Welcome message from host..."
                                    />
                                </div>
                                <div className="group">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Author Name</label>
                                    <input 
                                        type="text"
                                        value={event.hostNote?.author || ''} 
                                        onChange={(e) => onUpdate('hostNote', { ...(event.hostNote || {}), author: e.target.value })}
                                        className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm focus:bg-white"
                                        placeholder="Name of the host"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'visuals' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                             {/* VISUAL SLIDERS */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                        <Sun className="w-4 h-4" /> Brightness
                                    </label>
                                    <span className="text-[10px] font-mono bg-gray-100 px-2 rounded text-gray-500">{event.visuals?.brightness || 100}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="20" max="150" 
                                    value={event.visuals?.brightness || 100}
                                    onChange={(e) => onUpdate('visuals', { ...event.visuals, brightness: parseInt(e.target.value) })}
                                    className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                                />
                            </div>
                            
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                        <Droplets className="w-4 h-4" /> Blur Strength
                                    </label>
                                    <span className="text-[10px] font-mono bg-gray-100 px-2 rounded text-gray-500">{event.visuals?.blur || 0}px</span>
                                </div>
                                <input 
                                    type="range"
                                    min="0" max="20" 
                                    value={event.visuals?.blur || 0}
                                    onChange={(e) => onUpdate('visuals', { ...event.visuals, blur: parseInt(e.target.value) })} 
                                    className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                                />
                            </div>

                            {/* NEW: Video Scale Slider */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                        <Video className="w-4 h-4" /> Video Scale
                                    </label>
                                    <span className="text-[10px] font-mono bg-gray-100 px-2 rounded text-gray-500">{event.visuals?.videoScale || 1.0}x</span>
                                </div>
                                <input 
                                    type="range"
                                    min="1.0" max="2.5" step="0.1"
                                    value={event.visuals?.videoScale || 1.0}
                                    onChange={(e) => onUpdate('visuals', { ...event.visuals, videoScale: parseFloat(e.target.value) })} 
                                    className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                                />
                            </div>

                            {/* NEW: Overlay Opacity Slider */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                        <Settings className="w-4 h-4" /> Overlay Opacity
                                    </label>
                                    <span className="text-[10px] font-mono bg-gray-100 px-2 rounded text-gray-500">{event.visuals?.overlayOpacity ?? 40}%</span>
                                </div>
                                <input 
                                    type="range"
                                    min="0" max="90" step="5"
                                    value={event.visuals?.overlayOpacity ?? 40}
                                    onChange={(e) => onUpdate('visuals', { ...event.visuals, overlayOpacity: parseInt(e.target.value) })} 
                                    className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                                <h4 className="text-blue-800 font-bold text-sm mb-1 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" /> Gallery Manager
                                </h4>
                                <p className="text-xs text-blue-600">Drag images to reorder. Upload new ones below.</p>
                            </div>

                            <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer mb-6 group">
                                <Upload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold uppercase tracking-widest">Upload Media (Photos/Videos)</span>
                                <input type="file" multiple className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'gallery', 'gallery')} />
                            </label>

                            {/* REORDERABLE GALLERY GRID */}
                            <Reorder.Group 
                                axis="y" 
                                values={event.gallery || []} 
                                onReorder={(newOrder) => onUpdate('gallery', newOrder)}
                                className="grid grid-cols-3 gap-2"
                                as="div"
                            >
                                {(event.gallery || []).map((img, idx) => (
                                    <Reorder.Item 
                                        key={img} 
                                        value={img}
                                        className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-move shadow-sm"
                                        whileDrag={{ scale: 1.1, zIndex: 10, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
                                    >
                                        <div className="w-full h-full bg-black flex items-center justify-center">
                                            {/\.(mp4|mov|webm)$/i.test(img) ? (
                                                <Video className="w-8 h-8 text-white opacity-40" />
                                            ) : (
                                                <img 
                                                    src={img.startsWith('http') || img.startsWith('/assets') ? img : `/assets/events/${event.folderName || 'general'}/${img}`} 
                                                    className="w-full h-full object-cover pointer-events-none" 
                                                    alt="" 
                                                />
                                            )}
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent drag start
                                                const newGallery = event.gallery.filter((_, i) => i !== idx);
                                                onUpdate('gallery', newGallery);
                                            }}
                                            className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                        <div className="absolute top-1 left-1 px-2 py-0.5 bg-black/50 text-white text-[10px] rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            #{idx + 1}
                                        </div>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                            
                             {(!event.gallery || event.gallery.length === 0) && (
                                <div className="text-center py-10 text-gray-400 text-xs italic">
                                    No images in gallery yet.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'partners' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8 pb-32">
                            {/* PARTNERSHIP BLOCK SETTINGS */}
                            <div className="bg-gray-50 border border-gray-100 p-6 rounded-3xl space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                                    <h4 className="text-sm font-black uppercase text-gray-700">Partnership Block</h4>
                                    <button 
                                        onClick={() => onUpdate('showPartnership', !event.showPartnership)}
                                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${event.showPartnership ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-gray-200 text-gray-400'}`}
                                    >
                                        {event.showPartnership ? 'ACTIVE' : 'OFF'}
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Section Title (EN/HE)</label>
                                        <input value={event.partnership?.title?.en} onChange={(e) => onUpdate('partnership', { ...event.partnership, title: { ...event.partnership.title, en: e.target.value } })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs mb-2" placeholder="EN Title" />
                                        <input value={event.partnership?.title?.he} dir="rtl" onChange={(e) => onUpdate('partnership', { ...event.partnership, title: { ...event.partnership.title, he: e.target.value } })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-right" placeholder="כותרת בעברית" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Description Text (EN/HE)</label>
                                        <textarea value={event.partnership?.text?.en} onChange={(e) => onUpdate('partnership', { ...event.partnership, text: { ...event.partnership.text, en: e.target.value } })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs mb-2 h-24 resize-none" placeholder="EN Description" />
                                        <textarea value={event.partnership?.text?.he} dir="rtl" onChange={(e) => onUpdate('partnership', { ...event.partnership, text: { ...event.partnership.text, he: e.target.value } })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-right h-24 resize-none" placeholder="תיאור בעברית" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Redirect Link (Website)</label>
                                        <input value={event.partnership?.link} onChange={(e) => onUpdate('partnership', { ...event.partnership, link: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs" placeholder="https://..." />
                                    </div>
                                </div>
                            </div>

                            {/* PARTNERS LOGO LIST */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Logo Stream</h4>
                                    <button onClick={() => {
                                        const newPartners = [...(event.partners || []), { name: 'New Partner', logo: '', link: '' }];
                                        onUpdate('partners', newPartners);
                                    }} className="bg-[#6160AB] text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-lg shadow-[#6160AB]/20 flex items-center gap-1">+ Add Logo</button>
                                </div>
                                
                                {(event.partners || []).map((partner, idx) => (
                                    <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-center shadow-sm">
                                        <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 relative group overflow-hidden flex-shrink-0 flex items-center justify-center">
                                             {partner.logo ? (
                                                 <img src={partner.logo} className="w-full h-full object-contain p-2" alt="" />
                                             ) : (
                                                 <Sparkles className="w-6 h-6 text-gray-200" />
                                             )}
                                             <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                                 <Upload className="w-5 h-5 text-white" />
                                                 <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, `partners.${idx}.logo`, 'partners')} />
                                             </label>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input 
                                                value={partner.name} 
                                                onChange={(e) => {
                                                    const newPartners = [...event.partners];
                                                    newPartners[idx].name = e.target.value;
                                                    onUpdate('partners', newPartners);
                                                }}
                                                className="w-full bg-transparent font-black text-xs border-b border-transparent focus:border-[#6160AB] outline-none" 
                                                placeholder="Partner Name"
                                            />
                                            <input 
                                                value={partner.link}
                                                onChange={(e) => {
                                                    const newPartners = [...event.partners];
                                                    newPartners[idx].link = e.target.value;
                                                    onUpdate('partners', newPartners);
                                                }}
                                                className="w-full bg-transparent text-[10px] text-gray-400 border-b border-transparent focus:border-[#6160AB] outline-none font-mono" 
                                                placeholder="Link (optional)"
                                            />
                                        </div>
                                        <button onClick={() => {
                                            const newPartners = event.partners.filter((_, i) => i !== idx);
                                            onUpdate('partners', newPartners);
                                        }} className="text-gray-200 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}

                                {(event.partners || []).length === 0 && (
                                    <div className="text-center py-12 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                                        <Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No independent logos added yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Save Action */}
                <div className="p-6 border-t border-gray-200 bg-white/60 backdrop-blur-xl absolute bottom-0 w-full">
                    <button 
                        onClick={onSave}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group hover:bg-black"
                    >
                        <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Save Changes
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-3 font-mono flex items-center justify-center gap-1 opacity-50">
                        <span className="border border-gray-300 rounded px-1">Cmd</span>
                        +
                        <span className="border border-gray-300 rounded px-1">S</span>
                        to Save
                    </p>
                </div>

            </div>
        </div>
    );
};

export default VisualEventEditor;
