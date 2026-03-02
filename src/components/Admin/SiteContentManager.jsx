import React, { useState, useEffect, useRef } from 'react';
import { Save, Users, Quote, Image as ImageIcon, Plus, Trash2, Edit3, X, Lock, Unlock, Star, Smartphone, BookOpen, Video, Youtube, Upload, Sparkles, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { siteContent } from '../../data/content';
import knowledgeBaseFallback from '../../data/knowledgeBaseConfig.json';
import { getApiBase } from '../../utils/api';

const PhoneMockup = ({ children, className = "" }) => (
    <div className={`relative mx-auto rounded-[2.5rem] border-[6px] border-gray-900 bg-gray-900 shadow-2xl overflow-hidden ${className}`} style={{ aspectRatio: '9/19.5', width: '160px' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-xl z-20"></div>
        <div className="w-full h-full bg-white relative z-10 overflow-hidden">
            {children}
        </div>
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-800/20 rounded-full z-20"></div>
    </div>
);

const SiteContentManager = () => {
    const [content, setContent] = useState({ team: [], testimonials: [], partners: [], locks: { team: false, testimonials: false, partners: false } });
    const [howItWorks, setHowItWorks] = useState({ videoSteps: [], physicalSteps: [], isLocked: false });
    const [knowledgeBase, setKnowledgeBase] = useState({ books: [], videos: [], isLocked: false });
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('');
    const [activeSection, setActiveSection] = useState('team');
    const [activeHowItWorksMode, setActiveHowItWorksMode] = useState('video');
    const [activeKnowledgeTab, setActiveKnowledgeTab] = useState('books');
    const fileInputRef = useRef(null);

    const base = getApiBase();

    // Fallback from static content when backend is offline so Site Content Manager always shows existing data
    const getFallbackContent = () => {
        const team = (siteContent?.about?.team?.members || []).map((m, i) => ({
            id: m.name?.replace(/\s+/g, '-').toLowerCase() || `member-${i}`,
            name: m.name,
            role: typeof m.role === 'object' ? m.role?.en : m.role,
            nickname: typeof m.nickname === 'object' ? m.nickname?.en : m.nickname,
            imageUrl: m.image,
            image: m.image,
            linkedin: m.linkedin,
            bio: typeof m.bio === 'object' ? m.bio?.en : m.bio,
            funFact: typeof m.funFact === 'object' ? (m.funFact?.en || m.funFact?.he || '') : (m.funFact || ''),
        }));
        return {
            team,
            testimonials: [],
            partners: [],
            locks: { team: false, testimonials: false, partners: false },
        };
    };
    const getFallbackHowItWorks = () => ({
        videoSteps: siteContent?.home?.howItWorks?.videoSteps || [],
        physicalSteps: siteContent?.home?.howItWorks?.physicalSteps || [],
        isLocked: false,
    });
    const getFallbackKnowledgeBase = () => ({
        books: knowledgeBaseFallback?.books ?? [],
        videos: knowledgeBaseFallback?.videos ?? [],
        isLocked: knowledgeBaseFallback?.isLocked ?? false,
    });

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [siteSettled, howSettled, knowSettled] = await Promise.allSettled([
                    fetch(`${base}/api/site-content`).then(r => r.json()),
                    fetch(`${base}/api/cms/how-it-works`).then(r => r.json()),
                    fetch(`${base}/api/cms/knowledge-base`).then(r => r.json()),
                ]);
                const siteRes = siteSettled.status === 'fulfilled' && siteSettled.value && !siteSettled.value.error
                    ? siteSettled.value
                    : getFallbackContent();
                const howRes = howSettled.status === 'fulfilled' && howSettled.value && (Array.isArray(howSettled.value.videoSteps) || Array.isArray(howSettled.value.physicalSteps))
                    ? howSettled.value
                    : getFallbackHowItWorks();
                const knowRes = knowSettled.status === 'fulfilled' && knowSettled.value && (Array.isArray(knowSettled.value.books) || Array.isArray(knowSettled.value.videos))
                    ? knowSettled.value
                    : getFallbackKnowledgeBase();
                setContent(prev => ({ ...prev, ...siteRes, locks: siteRes.locks ?? prev.locks }));
                setHowItWorks(prev => ({ ...prev, ...howRes, videoSteps: howRes.videoSteps ?? prev.videoSteps, physicalSteps: howRes.physicalSteps ?? prev.physicalSteps }));
                setKnowledgeBase(prev => ({ ...prev, ...knowRes, books: knowRes.books ?? prev.books, videos: knowRes.videos ?? prev.videos }));
            } catch (err) {
                console.error("Error fetching content", err);
                setContent(getFallbackContent());
                setHowItWorks(getFallbackHowItWorks());
                setKnowledgeBase(getFallbackKnowledgeBase());
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const saveChanges = async () => {
        setSaveStatus('Saving...');
        try {
            let res;
            if (activeSection === 'how-it-works') {
                res = await fetch(`${base}/api/cms/how-it-works`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(howItWorks)
                });
            } else if (activeSection === 'knowledge') {
                res = await fetch(`${base}/api/cms/knowledge-base`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(knowledgeBase)
                });
            } else {
                res = await fetch(`${base}/api/site-content`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(content)
                });
            }
            
            const data = await res.json();
            if (data.success) {
                setSaveStatus('Saved successfully!');
                setTimeout(() => setSaveStatus(''), 3000);
            }
        } catch (err) {
            console.error('Error saving', err);
            setSaveStatus('Error saving');
        }
    };

    const handleArrayChange = (section, index, field, value) => {
        const newArray = [...(content[section] || [])];
        newArray[index] = { ...newArray[index], [field]: value };
        setContent({ ...content, [section]: newArray });
    };

    const addItem = (section, template) => {
        setContent({ ...content, [section]: [...(content[section] || []), { ...template, id: Date.now().toString() }] });
    };

    const removeItem = (section, index) => {
        if (content.locks?.[section]) {
            alert("This section is locked. Please unlock it first.");
            return;
        }
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        const newArray = [...(content[section] || [])];
        newArray.splice(index, 1);
        setContent({ ...content, [section]: newArray });
    };

    const moveItem = (section, index, direction) => {
        if (content.locks?.[section]) return;
        const newArray = [...(content[section] || [])];
        if (direction === 'up' && index > 0) {
            [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
        } else if (direction === 'down' && index < newArray.length - 1) {
            [newArray[index + 1], newArray[index]] = [newArray[index], newArray[index + 1]];
        }
        setContent({ ...content, [section]: newArray });
    };

    const moveHowItWorksItem = (mode, index, direction) => {
        if (howItWorks.isLocked) return;
        const newHow = { ...howItWorks };
        const key = mode === 'video' ? 'videoSteps' : 'physicalSteps';
        const arr = newHow[key];
        if (direction === 'up' && index > 0) {
            [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
        } else if (direction === 'down' && index < arr.length - 1) {
            [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
        }
        setHowItWorks(newHow);
    };

    const moveKnowledgeItem = (tab, index, direction) => {
        if (knowledgeBase.isLocked) return;
        const newKb = { ...knowledgeBase };
        const arr = tab === 'books' ? newKb.books : newKb.videos;
        if (direction === 'up' && index > 0) {
            [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
        } else if (direction === 'down' && index < arr.length - 1) {
            [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
        }
        setKnowledgeBase(newKb);
    };

    const toggleLock = (section) => {
        if (section === 'how-it-works') {
            setHowItWorks(prev => ({ ...prev, isLocked: !prev.isLocked }));
            return;
        }
        if (section === 'knowledge') {
            setKnowledgeBase(prev => ({ ...prev, isLocked: !prev.isLocked }));
            return;
        }
        const newLocks = { ...(content.locks || { team: false, testimonials: false, partners: false }) };
        newLocks[section] = !newLocks[section];
        setContent({ ...content, locks: newLocks });
    };

    const handleCmsImageUpload = async (e, section, mode, index) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${base}/api/upload-cms-image`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                if (section === 'how-it-works') {
                    const newHow = { ...howItWorks };
                    const stepsKey = mode === 'video' ? 'videoSteps' : 'physicalSteps';
                    newHow[stepsKey][index].image = data.url;
                    setHowItWorks(newHow);
                } else if (section === 'knowledge') {
                    const newKnow = { ...knowledgeBase };
                    newKnow.books[index].coverUrl = data.url;
                    setKnowledgeBase(newKnow);
                }
            }
        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    const [magicFetching, setMagicFetching] = useState(null); // 'books-0' | 'videos-1' | null

    const magicFetchBook = async (idx) => {
        const book = knowledgeBase.books[idx];
        if (!book?.title) return alert("Please enter a title first");
        const key = `books-${idx}`;
        setMagicFetching(key);
        try {
            const url = `${base}/api/ai/fetch-book`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: book.title.trim(), author: (book.author || '').trim() })
            });
            const raw = await res.text();
            let data;
            try { data = JSON.parse(raw); } catch (_) {
                throw new Error(res.ok ? "Invalid response from server" : `Server ${res.status}: ${raw.slice(0, 120)}`);
            }
            if (data.error) throw new Error(data.error);
            if (!res.ok) throw new Error(`Server ${res.status}: ${data.error || raw.slice(0, 80)}`);

            const newKb = { ...knowledgeBase };
            const existing = newKb.books[idx] || {};
            newKb.books[idx] = {
                ...existing,
                ...data,
                // Keep existing cover if API didn't return one
                coverUrl: data.coverUrl != null && data.coverUrl !== '' ? data.coverUrl : (existing.coverUrl || ''),
                threeKeySentences: Array.isArray(data.threeKeySentences) ? data.threeKeySentences : (existing.threeKeySentences || ['', '', ''])
            };
            setKnowledgeBase(newKb);
            if (data._aiSuccess === false && !data.description?.trim()) {
                console.warn("Magic Fetch: No description/AI data. Add GEMINI_API_KEY to .env and restart the server.");
            }
        } catch (err) {
            const msg = err.message || "Network error";
            const hint = (import.meta.env.DEV && (msg.includes("Failed") || msg.includes("Network") || msg.includes("fetch")))
                ? "\n\nRun: npm run dev (both Vite + admin server). After changing .env, restart (Ctrl+C then npm run dev again)."
                : "";
            alert("Magic Fetch failed: " + msg + hint);
        } finally {
            setMagicFetching(null);
        }
    };

    const magicFetchVideo = async (idx) => {
        const video = knowledgeBase.videos[idx];
        if (!video?.youtubeUrl) return alert("Please enter a YouTube URL first");
        const key = `videos-${idx}`;
        setMagicFetching(key);
        try {
            const res = await fetch(`${base}/api/ai/fetch-video`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ youtubeUrl: video.youtubeUrl })
            });
            const raw = await res.text();
            let data;
            try { data = JSON.parse(raw); } catch (_) { throw new Error("Invalid response from server"); }
            if (data.error) throw new Error(data.error);

            const newKb = { ...knowledgeBase };
            newKb.videos[idx] = { ...newKb.videos[idx], ...data };
            setKnowledgeBase(newKb);
        } catch (err) {
            console.error("Magic Fetch Error:", err);
            alert("Magic Fetch failed: " + (err.message || "Network error"));
        } finally {
            setMagicFetching(null);
        }
    };

    if (loading) return <div className="p-8 font-bold text-gray-400">Loading Content Engine...</div>;

    return (
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden animate-in fade-in duration-500 border p-8">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Site Content Manager</h2>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Manage global site dynamic structures</p>
                </div>
                <div className="flex items-center gap-4">
                    {saveStatus && <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{saveStatus}</span>}
                    <button 
                        onClick={saveChanges}
                        className="bg-purple-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 transition flex items-center gap-2 shadow-lg shadow-purple-200"
                    >
                        <Save className="w-4 h-4" /> Save Content
                    </button>
                </div>
            </div>

            <div className="flex gap-4 mb-8">
                <button 
                    onClick={() => setActiveSection('team')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'team' ? 'bg-purple-100 text-purple-700' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                    <Users className="w-4 h-4" /> Meet The Team
                </button>
                <button 
                    onClick={() => setActiveSection('testimonials')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'testimonials' ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                    <Quote className="w-4 h-4" /> Real Impact
                </button>
                <button 
                    onClick={() => setActiveSection('partners')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'partners' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                    <ImageIcon className="w-4 h-4" /> Trusted Partners
                </button>
                <div className="w-px h-8 bg-gray-200 self-center mx-2"></div>
                <button 
                    onClick={() => setActiveSection('how-it-works')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'how-it-works' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                    <Smartphone className="w-4 h-4" /> How It Works
                </button>
                <button 
                    onClick={() => setActiveSection('knowledge')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'knowledge' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                    <BookOpen className="w-4 h-4" /> Knowledge Base
                </button>
            </div>

            <div className="space-y-6">
                {activeSection === 'team' && (
                    <div className="animate-in fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-gray-800">Team Members</h3>
                                <button 
                                    onClick={() => toggleLock('team')}
                                    className={`p-1.5 rounded-lg transition-all ${content.locks?.team ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    {content.locks?.team ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                </button>
                            </div>
                            <button 
                                disabled={content.locks?.team}
                                onClick={() => addItem('team', { name: 'New Member', role: 'Role', bio: '', funFact: '', imageUrl: '', nickname: '', linkedin: '' })} 
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-all ${content.locks?.team ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black shadow-md'}`}
                            >
                                <Plus className="w-3 h-3" /> Add Member
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(content.team || []).map((member, idx) => (
                                <div key={member.id} className={`p-6 border rounded-2xl relative group transition-all ${content.locks?.team ? 'bg-gray-50/50 opacity-90' : 'bg-gray-50'}`}>
                                    <div className={`absolute top-4 right-4 flex items-center gap-1 transition-all ${content.locks?.team ? 'text-gray-300 pointer-events-none' : 'text-gray-400'}`}>
                                        <button onClick={() => moveItem('team', idx, 'up')} className="hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-400" disabled={idx === 0}><ChevronUp className="w-4 h-4" /></button>
                                        <button onClick={() => moveItem('team', idx, 'down')} className="hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-400" disabled={idx === content.team.length - 1}><ChevronDown className="w-4 h-4" /></button>
                                        <button onClick={() => removeItem('team', idx)} className="text-red-400 hover:text-red-600 ml-2"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                    <div className="space-y-4">
                                        <div><label className="text-[10px] font-black uppercase text-gray-400">Name</label><input type="text" disabled={content.locks?.team} value={member.name} onChange={e => handleArrayChange('team', idx, 'name', e.target.value)} className="w-full bg-white p-3 rounded-lg border font-bold text-sm disabled:bg-gray-50 disabled:text-gray-500" /></div>
                                        <div><label className="text-[10px] font-black uppercase text-gray-400">Role / Title</label><input type="text" disabled={content.locks?.team} value={member.role} onChange={e => handleArrayChange('team', idx, 'role', e.target.value)} className="w-full bg-white p-3 rounded-lg border font-bold text-sm disabled:bg-gray-50 disabled:text-gray-500" /></div>
                                        <div><label className="text-[10px] font-black uppercase text-gray-400">Bio</label><textarea disabled={content.locks?.team} value={member.bio ?? ''} onChange={e => handleArrayChange('team', idx, 'bio', e.target.value)} rows="3" className="w-full bg-white p-3 rounded-lg border font-bold text-sm resize-none disabled:bg-gray-50 disabled:text-gray-500" placeholder="Short bio (EN or bilingual)"></textarea></div>
                                        <div><label className="text-[10px] font-black uppercase text-gray-400">Fun fact(s)</label><textarea disabled={content.locks?.team} value={member.funFact ?? ''} onChange={e => handleArrayChange('team', idx, 'funFact', e.target.value)} rows="2" className="w-full bg-white p-3 rounded-lg border font-bold text-sm resize-none disabled:bg-gray-50 disabled:text-gray-500" placeholder="One line, or multiple facts separated by new lines"></textarea></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="text-[10px] font-black uppercase text-gray-400">Nickname</label><input type="text" disabled={content.locks?.team} value={member.nickname || ''} onChange={e => handleArrayChange('team', idx, 'nickname', e.target.value)} className="w-full bg-white p-3 rounded-lg border font-bold text-sm disabled:bg-gray-50 disabled:text-gray-500" /></div>
                                            <div><label className="text-[10px] font-black uppercase text-gray-400">LinkedIn URL</label><input type="text" disabled={content.locks?.team} value={member.linkedin || ''} onChange={e => handleArrayChange('team', idx, 'linkedin', e.target.value)} className="w-full bg-white p-3 rounded-lg border font-bold text-sm text-blue-600 disabled:bg-gray-50 disabled:text-gray-400" /></div>
                                        </div>
                                        <div><label className="text-[10px] font-black uppercase text-gray-400">Image URL</label><input type="text" disabled={content.locks?.team} value={member.imageUrl} onChange={e => handleArrayChange('team', idx, 'imageUrl', e.target.value)} className="w-full bg-white p-3 rounded-lg border font-bold text-sm text-blue-600 disabled:bg-gray-50 disabled:text-gray-400" placeholder="/assets/team/..."/></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'testimonials' && (
                    <div className="animate-in fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-gray-800">Testimonials (Real Impact)</h3>
                                <button 
                                    onClick={() => toggleLock('testimonials')}
                                    className={`p-1.5 rounded-lg transition-all ${content.locks?.testimonials ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    {content.locks?.testimonials ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                </button>
                            </div>
                            <button 
                                disabled={content.locks?.testimonials}
                                onClick={() => addItem('testimonials', { quote: '', author: 'Name', role: 'Context', stars: 5, companyLogo: '' })} 
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-all ${content.locks?.testimonials ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black shadow-md'}`}
                            >
                                <Plus className="w-3 h-3" /> Add Quote
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {(content.testimonials || []).map((item, idx) => (
                                <div key={item.id} className={`p-6 border rounded-2xl relative group flex gap-6 items-start transition-all ${content.locks?.testimonials ? 'bg-gray-50/50 opacity-90' : 'bg-gray-50'}`}>
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <Quote className="w-8 h-8 text-amber-200" />
                                        <div className="flex gap-0.5 text-amber-400">
                                            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                        </div>
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <div><label className="text-[10px] font-black uppercase text-gray-400">Quote</label><textarea disabled={content.locks?.testimonials} value={item.quote} onChange={e => handleArrayChange('testimonials', idx, 'quote', e.target.value)} rows="3" className="w-full bg-white p-4 rounded-xl border font-black text-sm text-hbm-dark leading-relaxed resize-none disabled:bg-gray-50 disabled:text-gray-500 italic"></textarea></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="text-[10px] font-black uppercase text-gray-400">Author Name</label><input type="text" disabled={content.locks?.testimonials} value={item.author} onChange={e => handleArrayChange('testimonials', idx, 'author', e.target.value)} className="w-full bg-white p-3 rounded-lg border font-black text-sm disabled:bg-gray-50 disabled:text-gray-500" /></div>
                                            <div><label className="text-[10px] font-black uppercase text-gray-400">Role / Context</label><input type="text" disabled={content.locks?.testimonials} value={item.role} onChange={e => handleArrayChange('testimonials', idx, 'role', e.target.value)} className="w-full bg-white p-3 rounded-lg border font-black text-[10px] uppercase tracking-widest text-hbm-orange disabled:bg-gray-50 disabled:text-gray-500" /></div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-400">Company Logo URL (Small icon on right)</label>
                                            <div className="flex gap-4 items-center">
                                                <input type="text" disabled={content.locks?.testimonials} value={item.companyLogo || ''} onChange={e => handleArrayChange('testimonials', idx, 'companyLogo', e.target.value)} className="flex-1 bg-white p-3 rounded-lg border font-bold text-xs text-blue-600 disabled:bg-gray-50" placeholder="/assets/..." />
                                                {item.companyLogo && <img src={item.companyLogo} className="h-6 object-contain grayscale opacity-50" alt="Preview" />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`absolute top-4 right-4 flex items-center gap-1 transition-all ${content.locks?.testimonials ? 'text-gray-300 pointer-events-none' : 'text-gray-400'}`}>
                                        <button onClick={() => moveItem('testimonials', idx, 'up')} className="hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-400" disabled={idx === 0}><ChevronUp className="w-4 h-4" /></button>
                                        <button onClick={() => moveItem('testimonials', idx, 'down')} className="hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-400" disabled={idx === content.testimonials.length - 1}><ChevronDown className="w-4 h-4" /></button>
                                        <button onClick={() => removeItem('testimonials', idx)} className="text-red-400 hover:text-red-600 ml-2"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'partners' && (
                   // ... existing partners UI ...
                   <div className="animate-in fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-gray-800">Trusted Partners</h3>
                                <button 
                                    onClick={() => toggleLock('partners')}
                                    className={`p-1.5 rounded-lg transition-all ${content.locks?.partners ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    {content.locks?.partners ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                </button>
                            </div>
                            <button 
                                disabled={content.locks?.partners}
                                onClick={() => addItem('partners', { name: 'Partner Name', logoUrl: '' })} 
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-all ${content.locks?.partners ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black shadow-md'}`}
                            >
                                <Plus className="w-3 h-3" /> Add Partner
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {(content.partners || []).map((partner, idx) => (
                                <div key={partner.id} className={`p-6 border rounded-2xl relative group transition-all ${content.locks?.partners ? 'bg-gray-50/50 opacity-90' : 'bg-gray-50'}`}>
                                    <div className={`absolute top-4 right-4 flex items-center gap-1 transition-all ${content.locks?.partners ? 'text-gray-300 pointer-events-none' : 'text-gray-400'}`}>
                                        <button onClick={() => moveItem('partners', idx, 'up')} className="hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-400" disabled={idx === 0}><ChevronUp className="w-4 h-4" /></button>
                                        <button onClick={() => moveItem('partners', idx, 'down')} className="hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-400" disabled={idx === content.partners.length - 1}><ChevronDown className="w-4 h-4" /></button>
                                        <button onClick={() => removeItem('partners', idx)} className="text-red-400 hover:text-red-600 ml-2"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                    <div className="space-y-4 mt-4">
                                        <div><label className="text-[10px] font-black uppercase text-gray-400">Partner Name</label><input type="text" disabled={content.locks?.partners} value={partner.name} onChange={e => handleArrayChange('partners', idx, 'name', e.target.value)} className="w-full bg-white p-3 rounded-lg border font-bold text-sm disabled:bg-gray-50 disabled:text-gray-500" /></div>
                                        <div><label className="text-[10px] font-black uppercase text-gray-400">Logo Image URL</label><input type="text" disabled={content.locks?.partners} value={partner.logoUrl} onChange={e => handleArrayChange('partners', idx, 'logoUrl', e.target.value)} className="w-full bg-white p-3 rounded-lg border font-bold text-xs text-blue-600 disabled:bg-gray-50 disabled:text-gray-400" placeholder="/assets/..."/></div>
                                        {partner.logoUrl && (
                                            <div className="h-16 flex items-center justify-center p-2 bg-white rounded-lg border">
                                                <img src={partner.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'how-it-works' && (
                    <div className="animate-in fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <h3 className="text-xl font-black text-gray-800">How It Works Protocol</h3>
                                <button 
                                    onClick={() => toggleLock('how-it-works')}
                                    className={`p-2 rounded-xl transition-all ${howItWorks.isLocked ? 'bg-red-50 text-red-500 shadow-inner' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    {howItWorks.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                                </button>
                                <div className="flex bg-gray-100 p-1 rounded-xl ml-4">
                                    <button 
                                        onClick={() => setActiveHowItWorksMode('video')}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeHowItWorksMode === 'video' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                                    >
                                        Video
                                    </button>
                                    <button 
                                        onClick={() => setActiveHowItWorksMode('physical')}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeHowItWorksMode === 'physical' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                                    >
                                        Physical
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {((activeHowItWorksMode === 'video' ? howItWorks?.videoSteps : howItWorks?.physicalSteps) || []).map((step, idx, arr) => (
                                <div key={idx} className={`p-8 border rounded-[2rem] relative group transition-all ${howItWorks.isLocked ? 'bg-gray-50/50 opacity-90' : 'bg-white shadow-sm hover:shadow-md'}`}>
                                    <div className={`absolute top-4 right-4 flex items-center gap-1 transition-all z-10 ${howItWorks.isLocked ? 'text-gray-300 pointer-events-none' : 'text-gray-400'}`}>
                                        <button onClick={() => moveHowItWorksItem(activeHowItWorksMode, idx, 'up')} className="hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-400" disabled={idx === 0}><ChevronUp className="w-4 h-4" /></button>
                                        <button onClick={() => moveHowItWorksItem(activeHowItWorksMode, idx, 'down')} className="hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-400" disabled={idx === arr.length - 1}><ChevronDown className="w-4 h-4" /></button>
                                    </div>
                                    <div className="flex gap-8 items-start">
                                        <div className="shrink-0 flex flex-col items-center gap-3">
                                            <div className="bg-gray-900 text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg mb-2">
                                                {idx + 1}
                                            </div>
                                            <PhoneMockup className="group-hover:scale-[1.02] transition-transform duration-500">
                                                {step.image ? (
                                                    <img src={step.image} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-200 p-4 text-center">
                                                        <Smartphone className="w-8 h-8 mb-2 opacity-20" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Screen Content</span>
                                                    </div>
                                                )}
                                                {!howItWorks.isLocked && (
                                                    <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-30">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Upload className="text-white w-6 h-6 animate-bounce" />
                                                            <span className="text-white text-[10px] font-black uppercase tracking-tighter">Upload UI</span>
                                                        </div>
                                                        <input type="file" className="hidden" onChange={e => handleCmsImageUpload(e, 'how-it-works', activeHowItWorksMode, idx)} />
                                                    </label>
                                                )}
                                            </PhoneMockup>
                                            
                                            {activeHowItWorksMode === 'video' && (
                                                <button 
                                                    onClick={() => removeItem('how-it-works-video', idx)}
                                                    className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-4 pt-10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Title (HE)</label>
                                                        <input 
                                                            dir="rtl"
                                                            disabled={howItWorks.isLocked}
                                                            value={step.title.he} 
                                                            onChange={e => {
                                                                const newHow = {...howItWorks};
                                                                const key = activeHowItWorksMode === 'video' ? 'videoSteps' : 'physicalSteps';
                                                                newHow[key][idx].title.he = e.target.value;
                                                                setHowItWorks(newHow);
                                                            }}
                                                            className="w-full bg-gray-50 p-3 rounded-lg border-none font-bold text-sm text-right" 
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Title (EN)</label>
                                                        <input 
                                                            disabled={howItWorks.isLocked}
                                                            value={step.title.en} 
                                                            onChange={e => {
                                                                const newHow = {...howItWorks};
                                                                const key = activeHowItWorksMode === 'video' ? 'videoSteps' : 'physicalSteps';
                                                                newHow[key][idx].title.en = e.target.value;
                                                                setHowItWorks(newHow);
                                                            }}
                                                            className="w-full bg-gray-50 p-3 rounded-lg border-none font-bold text-sm" 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Description (HE)</label>
                                                        <textarea 
                                                            dir="rtl"
                                                            disabled={howItWorks.isLocked}
                                                            value={step.desc.he} 
                                                            onChange={e => {
                                                                const newHow = {...howItWorks};
                                                                const key = activeHowItWorksMode === 'video' ? 'videoSteps' : 'physicalSteps';
                                                                newHow[key][idx].desc.he = e.target.value;
                                                                setHowItWorks(newHow);
                                                            }}
                                                            rows="4"
                                                            className="w-full bg-gray-50 p-3 rounded-lg border-none font-bold text-xs text-right leading-relaxed h-24" 
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Description (EN)</label>
                                                        <textarea 
                                                            disabled={howItWorks.isLocked}
                                                            value={step.desc.en} 
                                                            onChange={e => {
                                                                const newHow = {...howItWorks};
                                                                const key = activeHowItWorksMode === 'video' ? 'videoSteps' : 'physicalSteps';
                                                                newHow[key][idx].desc.en = e.target.value;
                                                                setHowItWorks(newHow);
                                                            }}
                                                            rows="4"
                                                            className="w-full bg-gray-50 p-3 rounded-lg border-none font-bold text-xs leading-relaxed h-24" 
                                                        />
                                                    </div>
                                                </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'knowledge' && (
                    <div className="animate-in fade-in">
                         <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <h3 className="text-xl font-black text-gray-800">Knowledge Intelligence</h3>
                                <button 
                                    onClick={() => toggleLock('knowledge')}
                                    className={`p-2 rounded-xl transition-all ${knowledgeBase.isLocked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}
                                >
                                    {knowledgeBase.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                                </button>
                                <div className="flex bg-gray-100 p-1 rounded-xl ml-4">
                                    <button 
                                        onClick={() => setActiveKnowledgeTab('books')}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeKnowledgeTab === 'books' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                                    >
                                        Books
                                    </button>
                                    <button 
                                        onClick={() => setActiveKnowledgeTab('videos')}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeKnowledgeTab === 'videos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                                    >
                                        Videos
                                    </button>
                                </div>
                            </div>
                            <button 
                                disabled={knowledgeBase.isLocked}
                                onClick={() => {
                                    if (activeKnowledgeTab === 'books') {
                                        setKnowledgeBase(p => ({...p, books: [...p.books, { id: Date.now(), title: 'New Book', author: '', description: '', coverUrl: '', category: 'General' }]}));
                                    } else {
                                        setKnowledgeBase(p => ({...p, videos: [...p.videos, { id: Date.now(), title: 'New Video', author: '', youtubeUrl: '', category: 'Interview' }]}));
                                    }
                                }}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${knowledgeBase.isLocked ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:bg-black'}`}
                            >
                                <Plus className="w-4 h-4" /> Add {activeKnowledgeTab === 'books' ? 'Book' : 'Video'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {((activeKnowledgeTab === 'books' ? knowledgeBase?.books : knowledgeBase?.videos) || []).map((item, idx, arr) => (
                                <div key={item.id} className={`p-6 border rounded-2xl relative transition-all ${knowledgeBase.isLocked ? 'bg-gray-50/50' : 'bg-white shadow-sm'}`}>
                                    <div className={`absolute top-4 right-4 flex items-center gap-1 transition-all z-10 ${knowledgeBase.isLocked ? 'text-gray-300 pointer-events-none' : 'text-gray-400'}`}>
                                        <button onClick={() => moveKnowledgeItem(activeKnowledgeTab, idx, 'up')} className="hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-400" disabled={idx === 0}><ChevronUp className="w-4 h-4" /></button>
                                        <button onClick={() => moveKnowledgeItem(activeKnowledgeTab, idx, 'down')} className="hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-400" disabled={idx === arr.length - 1}><ChevronDown className="w-4 h-4" /></button>
                                        <button 
                                            onClick={() => {
                                                if(!window.confirm('Delete item?')) return;
                                                const newKb = {...knowledgeBase};
                                                if (activeKnowledgeTab === 'books') newKb.books.splice(idx, 1);
                                                else newKb.videos.splice(idx, 1);
                                                setKnowledgeBase(newKb);
                                            }}
                                            className="text-red-400 hover:text-red-600 ml-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {activeKnowledgeTab === 'books' && (
                                            <div className="w-20 aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden border mb-2 relative group/book">
                                                {item.coverUrl ? <img src={item.coverUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen /></div>}
                                                {!knowledgeBase.isLocked && (
                                                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/book:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                        <Upload className="text-white w-4 h-4" />
                                                        <input type="file" className="hidden" onChange={e => handleCmsImageUpload(e, 'knowledge', 'books', idx)} />
                                                    </label>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex justify-between items-end mb-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400">Title</label>
                                            <button 
                                                onClick={() => activeKnowledgeTab === 'books' ? magicFetchBook(idx) : magicFetchVideo(idx)} 
                                                disabled={knowledgeBase.isLocked || magicFetching != null}
                                                className="bg-purple-600 text-white rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-purple-700 shadow-sm transition-all disabled:opacity-50"
                                            >
                                                {magicFetching === `${activeKnowledgeTab}-${idx}` ? (
                                                    <><RefreshCw className="w-3 h-3 animate-spin" /> Fetching…</>
                                                ) : (
                                                    <><Sparkles className="w-3 h-3" /> Magic Fetch</>
                                                )}
                                            </button>
                                        </div>
                                        <input 
                                            disabled={knowledgeBase.isLocked}
                                            value={item.title || ''} 
                                            onChange={e => {
                                                const newKb = {...knowledgeBase};
                                                if (activeKnowledgeTab === 'books') newKb.books[idx].title = e.target.value;
                                                else newKb.videos[idx].title = e.target.value;
                                                setKnowledgeBase(newKb);
                                            }}
                                            className="w-full bg-gray-50 p-3 rounded-lg border-none font-bold text-sm" 
                                        />
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">{activeKnowledgeTab === 'books' ? 'Author' : 'YouTube URL'}</label>
                                            <input 
                                                disabled={knowledgeBase.isLocked}
                                                value={activeKnowledgeTab === 'books' ? item.author : item.youtubeUrl} 
                                                onChange={e => {
                                                    const newKb = {...knowledgeBase};
                                                    if (activeKnowledgeTab === 'books') newKb.books[idx].author = e.target.value;
                                                    else newKb.videos[idx].youtubeUrl = e.target.value;
                                                    setKnowledgeBase(newKb);
                                                }}
                                                className="w-full bg-gray-50 p-3 rounded-lg border-none font-bold text-xs" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Description</label>
                                            <textarea 
                                                disabled={knowledgeBase.isLocked}
                                                value={item.description || ''} 
                                                onChange={e => {
                                                    const newKb = {...knowledgeBase};
                                                    if (activeKnowledgeTab === 'books') newKb.books[idx].description = e.target.value;
                                                    else newKb.videos[idx].description = e.target.value;
                                                    setKnowledgeBase(newKb);
                                                }}
                                                className="w-full bg-gray-50 p-3 rounded-lg border-none font-medium text-xs h-20" 
                                            />
                                        </div>

                                        {activeKnowledgeTab === 'books' && (
                                            <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-purple-600 mb-1 block">Author Wisdom Quote</label>
                                                    <textarea 
                                                        disabled={knowledgeBase.isLocked}
                                                        value={item.authorQuote || ''} 
                                                        placeholder="A profound quote by the author..."
                                                        onChange={e => {
                                                            const newKb = {...knowledgeBase};
                                                            newKb.books[idx].authorQuote = e.target.value;
                                                            setKnowledgeBase(newKb);
                                                        }}
                                                        className="w-full bg-purple-50 p-3 rounded-lg border-none font-medium italic text-xs h-16" 
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-purple-600 mb-1 block">3 Key Insights (Sentences)</label>
                                                    <div className="space-y-2">
                                                        {[0, 1, 2].map(i => (
                                                            <input 
                                                                key={i}
                                                                disabled={knowledgeBase.isLocked}
                                                                value={(item.threeKeySentences && item.threeKeySentences[i]) || ''}
                                                                placeholder={`Key insight ${i + 1}...`}
                                                                onChange={e => {
                                                                    const newKb = {...knowledgeBase};
                                                                    if (!newKb.books[idx].threeKeySentences) newKb.books[idx].threeKeySentences = ['', '', ''];
                                                                    newKb.books[idx].threeKeySentences[i] = e.target.value;
                                                                    setKnowledgeBase(newKb);
                                                                }}
                                                                className="w-full bg-gray-50 p-2 rounded-lg border-none font-medium text-xs"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-purple-600 mb-1 block">Master Summary (Short)</label>
                                                    <textarea 
                                                        disabled={knowledgeBase.isLocked}
                                                        value={item.shortSummary || ''} 
                                                        placeholder="A high-impact summary..."
                                                        onChange={e => {
                                                            const newKb = {...knowledgeBase};
                                                            newKb.books[idx].shortSummary = e.target.value;
                                                            setKnowledgeBase(newKb);
                                                        }}
                                                        className="w-full bg-gray-50 p-3 rounded-lg border-none font-medium text-xs h-20" 
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-purple-600 mb-1 block">Full Deep-Dive Summary</label>
                                                    <textarea 
                                                        disabled={knowledgeBase.isLocked}
                                                        value={item.fullSummary || ''} 
                                                        placeholder="A detailed exploration..."
                                                        onChange={e => {
                                                            const newKb = {...knowledgeBase};
                                                            newKb.books[idx].fullSummary = e.target.value;
                                                            setKnowledgeBase(newKb);
                                                        }}
                                                        className="w-full bg-gray-50 p-3 rounded-lg border-none font-medium text-xs h-40" 
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-purple-600 mb-1 block">Closing Power Quote</label>
                                                    <textarea 
                                                        disabled={knowledgeBase.isLocked}
                                                        value={item.finalQuote || ''} 
                                                        placeholder="Final life-changing quote..."
                                                        onChange={e => {
                                                            const newKb = {...knowledgeBase};
                                                            newKb.books[idx].finalQuote = e.target.value;
                                                            setKnowledgeBase(newKb);
                                                        }}
                                                        className="w-full bg-purple-50 p-3 rounded-lg border-none font-medium italic text-xs h-16" 
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {activeKnowledgeTab === 'videos' && (
                                            <div className="space-y-3 pt-4 border-t border-gray-100 mt-4">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 block">Accent Color</label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: item.accentColor || '#6160AB' }}></div>
                                                        <input 
                                                            type="text" 
                                                            disabled={knowledgeBase.isLocked}
                                                            value={item.accentColor || '#6160AB'} 
                                                            onChange={e => {
                                                                const newKb = {...knowledgeBase};
                                                                newKb.videos[idx].accentColor = e.target.value;
                                                                setKnowledgeBase(newKb);
                                                            }}
                                                            className="text-[10px] font-mono border-none bg-transparent w-16"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiteContentManager;
