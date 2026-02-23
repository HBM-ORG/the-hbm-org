import React, { useState, useEffect } from 'react';
import { Save, Users, Quote, Image as ImageIcon, Plus, Trash2, Edit3, X, Lock, Unlock, Star } from 'lucide-react';

const SiteContentManager = () => {
    const [content, setContent] = useState({ team: [], testimonials: [], partners: [], locks: { team: false, testimonials: false, partners: false } });
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('');
    const [activeSection, setActiveSection] = useState('team');

    useEffect(() => {
        const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
        fetch(`${base}/api/site-content`)
            .then(res => res.json())
            .then(data => {
                setContent(data);
                setLoading(false);
            })
            .catch(err => console.error("Error fetching site content", err));
    }, []);

    const saveChanges = async () => {
        setSaveStatus('Saving...');
        try {
            const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
            const res = await fetch(`${base}/api/site-content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            });
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
        const newLocks = { ...(content.locks || { team: false, testimonials: false, partners: false }) };
        newLocks[section] = !newLocks[section];
        setContent({ ...content, locks: newLocks });
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
            </div>
        </div>
    );
};

export default SiteContentManager;
