import React, { useState, useEffect, useRef } from 'react';
import { Save, Users, Quote, Image as ImageIcon, Plus, Trash2, Edit3, X, Lock, Unlock, Star, Smartphone, BookOpen, Video, Youtube, Upload } from 'lucide-react';

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

    const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [siteRes, howRes, knowRes] = await Promise.all([
                    fetch(`${base}/api/site-content`).then(r => r.json()),
                    fetch(`${base}/api/cms/how-it-works`).then(r => r.json()),
                    fetch(`${base}/api/cms/knowledge-base`).then(r => r.json())
                ]);
                setContent(siteRes);
                setHowItWorks(howRes);
                setKnowledgeBase(knowRes);
            } catch (err) {
                console.error("Error fetching content", err);
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
                                onClick={() => addItem('team', { name: 'New Member', role: 'Role', bio: '', imageUrl: '', nickname: '', linkedin: '' })} 
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-all ${content.locks?.team ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black shadow-md'}`}
                            >
                                <Plus className="w-3 h-3" /> Add Member
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(content.team || []).map((member, idx) => (
                                <div key={member.id} className={`p-6 border rounded-2xl relative group transition-all ${content.locks?.team ? 'bg-gray-50/50 opacity-90' : 'bg-gray-50'}`}>
                                    <button 
                                        disabled={content.locks?.team}
                                        onClick={() => removeItem('team', idx)} 
                                        className={`absolute top-4 right-4 p-2 transition-all ${content.locks?.team ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600'}`}
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                    <div className="space-y-4">
                                        <div><label className="text-[10px] font-black uppercase text-gray-400">Name</label><input type="text" disabled={content.locks?.team} value={member.name} onChange={e => handleArrayChange('team', idx, 'name', e.target.value)} className="w-full bg-white p-3 rounded-lg border font-bold text-sm disabled:bg-gray-50 disabled:text-gray-500" /></div>
                                        <div><label className="text-[10px] font-black uppercase text-gray-400">Role / Title</label><input type="text" disabled={content.locks?.team} value={member.role} onChange={e => handleArrayChange('team', idx, 'role', e.target.value)} className="w-full bg-white p-3 rounded-lg border font-bold text-sm disabled:bg-gray-50 disabled:text-gray-500" /></div>
                                        <div><label className="text-[10px] font-black uppercase text-gray-400">Bio</label><textarea disabled={content.locks?.team} value={member.bio} onChange={e => handleArrayChange('team', idx, 'bio', e.target.value)} rows="3" className="w-full bg-white p-3 rounded-lg border font-bold text-sm resize-none disabled:bg-gray-50 disabled:text-gray-500"></textarea></div>
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
                                    <button 
                                        disabled={content.locks?.testimonials}
                                        onClick={() => removeItem('testimonials', idx)} 
                                        className={`p-2 transition-all ${content.locks?.testimonials ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600'}`}
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
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
                                    <button 
                                        disabled={content.locks?.partners}
                                        onClick={() => removeItem('partners', idx)} 
                                        className={`absolute top-4 right-4 p-2 transition-all ${content.locks?.partners ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600'}`}
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
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
                            {((activeHowItWorksMode === 'video' ? howItWorks?.videoSteps : howItWorks?.physicalSteps) || []).map((step, idx) => (
                                <div key={idx} className={`p-8 border rounded-[2rem] relative group transition-all ${howItWorks.isLocked ? 'bg-gray-50/50 opacity-90' : 'bg-white shadow-sm hover:shadow-md'}`}>
                                    <div className="flex gap-6">
                                        <div className="w-32 aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden shrink-0 border relative group/img">
                                            {step.image ? (
                                                <img src={step.image} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Smartphone /></div>
                                            )}
                                            {!howItWorks.isLocked && (
                                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                    <Upload className="text-white w-6 h-6" />
                                                    <input type="file" className="hidden" onChange={e => handleCmsImageUpload(e, 'how-it-works', activeHowItWorksMode, idx)} />
                                                </label>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mb-2">{idx + 1}</div>
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
                            {((activeKnowledgeTab === 'books' ? knowledgeBase?.books : knowledgeBase?.videos) || []).map((item, idx) => (
                                <div key={item.id} className={`p-6 border rounded-2xl relative transition-all ${knowledgeBase.isLocked ? 'bg-gray-50/50' : 'bg-white shadow-sm'}`}>
                                    <button 
                                        disabled={knowledgeBase.isLocked}
                                        onClick={() => {
                                            if(!window.confirm('Delete item?')) return;
                                            const newKb = {...knowledgeBase};
                                            if (activeKnowledgeTab === 'books') newKb.books.splice(idx, 1);
                                            else newKb.videos.splice(idx, 1);
                                            setKnowledgeBase(newKb);
                                        }}
                                        className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
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
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Title</label>
                                            <input 
                                                disabled={knowledgeBase.isLocked}
                                                value={item.title} 
                                                onChange={e => {
                                                    const newKb = {...knowledgeBase};
                                                    if (activeKnowledgeTab === 'books') newKb.books[idx].title = e.target.value;
                                                    else newKb.videos[idx].title = e.target.value;
                                                    setKnowledgeBase(newKb);
                                                }}
                                                className="w-full bg-gray-50 p-3 rounded-lg border-none font-bold text-sm" 
                                            />
                                        </div>
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
