import React, { useState, useEffect } from 'react';
import { Settings, Save, Upload, X, MapPin, Calendar, Clock, Image as ImageIcon, Video, Sun, Droplets, Type, Eye, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import NextEventHero from '../Events/NextEventHero';

// This component wraps the public NextEventHero but injects "Edit Mode" props
const VisualEventEditor = ({ event, onUpdate, onSave, onClose, uploading, onUpload, stats, registrations }) => {
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('logistics'); // logistics, visuals, gallery

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
                <div className="flex-1 overflow-y-auto scrollbar-hide relative">
                    <NextEventHero 
                        event={event} 
                        lang="en" // Force EN for editing
                        isEditable={true} 
                        onUpdate={onUpdate}
                        onUpload={onUpload}
                    />
                    
                    {/* Overlay for Hero Upload (if not handled inside component) */}
                    <div className="absolute top-8 right-8 z-40 group">
                         <label className="cursor-pointer bg-black/40 hover:bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur-md flex items-center gap-2 text-xs font-bold transition-all border border-white/20 hover:border-white/50 shadow-lg">
                             <Video className="w-4 h-4" /> Change Background
                             <input type="file" className="hidden" accept="video/*,image/*" onChange={(e) => onUpload(e, 'heroVideo')} />
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
                        {['logistics', 'visuals', 'gallery'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? 'bg-white shadow-sm text-black scale-100' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50 scale-95'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">

                    {activeTab === 'logistics' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Date Picker */}
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

                            {/* Location */}
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

                    {activeTab === 'visuals' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                             {/* Visual Sliders UI - Placeholder logic for now as requested */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                        <Sun className="w-4 h-4" /> Brightness / Dim
                                    </label>
                                    <span className="text-[10px] font-mono bg-gray-100 px-2 rounded text-gray-500">Default</span>
                                </div>
                                <input type="range" className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                        <Droplets className="w-4 h-4" /> Blur Strength
                                    </label>
                                    <span className="text-[10px] font-mono bg-gray-100 px-2 rounded text-gray-500">10px</span>
                                </div>
                                <input type="range" className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                                <h4 className="text-blue-800 font-bold text-sm mb-1 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" /> Gallery Manager
                                </h4>
                                <p className="text-xs text-blue-600">Drag to reorder functionality coming soon. Upload new photos below.</p>
                            </div>

                            <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer mb-6 group">
                                <Upload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold uppercase tracking-widest">Upload Photos</span>
                                <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => onUpload(e, 'gallery', 'gallery')} />
                            </label>

                            <div className="grid grid-cols-3 gap-2">
                                {/* Need galleryImages passed down or accessed via helper */}
                                {/* Placeholder for now */}
                                <div className="aspect-square bg-gray-100 rounded-lg animate-pulse"></div>
                                <div className="aspect-square bg-gray-100 rounded-lg animate-pulse"></div>
                                <div className="aspect-square bg-gray-100 rounded-lg animate-pulse"></div>
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
