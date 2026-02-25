import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Zap, Clock, Smartphone, Monitor, Sparkles, Send, BarChart3,
    Settings, Save, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Search,
    Wand2, Activity, Users, MousePointer, Eye, RefreshCw, PlusCircle,
    Trash2, BellOff, Database, Layers, Radio, ChevronRight, ChevronDown,
    ToggleLeft, ToggleRight, Copy, Play, Pause, FlaskConical, Bell, Image as ImageIcon, Video, Calendar, X
} from 'lucide-react';

const API = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';

// ── Utility ─────────────────────────────────────────────────────────────────
const TAG_COLORS = {
    open: 'text-blue-600 bg-blue-50',
    click: 'text-orange-600 bg-orange-50',
    sent: 'text-green-600 bg-green-50',
    failed: 'text-red-600 bg-red-50',
};

const DEFAULT_FLOWS = [
    { id: 'newsletter', trigger: 'onNewsletterSignup', name: 'Newsletter Welcome', icon: Mail, desc: 'Sent when explicitly signing up for the newsletter' },
    { id: 'physical', trigger: 'onPhysicalRegistration', name: 'Physical Event Reg', icon: Calendar, desc: 'Sent when booking a spot for a real-world event' },
    { id: 'video', trigger: 'onVideoRegistration', name: 'Video Event Reg', icon: Video, desc: 'Sent when registering for an upcoming video session' },
    { id: 'journey', trigger: 'on8MinJourney', name: '8-Min Journey', icon: Zap, desc: 'Funnel or re-engagement for the general journey' }
];

// ── Sub-components ───────────────────────────────────────────────────────────

// ── Sub-components ───────────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, sub, color = 'purple' }) => {
    const colorMap = {
        purple: 'bg-purple-50 text-purple-600',
        blue: 'bg-blue-50 text-blue-600',
        orange: 'bg-orange-50 text-orange-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600'
    };
    return (
        <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm cursor-default"
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{String(value).toLocaleString()}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</div>
            {sub && <div className="text-[9px] text-gray-400 font-bold mt-1">{sub}</div>}
        </motion.div>
    );
};

const Toggle = ({ checked, onChange, label }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
        <div
            onClick={onChange}
            className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${checked ? 'bg-green-500' : 'bg-gray-200'}`}
        >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${checked ? 'left-5' : 'left-0.5'}`} />
        </div>
        {label && <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-700 transition-colors">{label}</span>}
    </label>
);

const SmtpBadge = ({ config }) => {
    const [status, setStatus] = useState('idle');
    const [msg, setMsg] = useState('');
    const [latency, setLatency] = useState(null);

    const check = useCallback(async () => {
        if (!config?.smtp?.host) { setStatus('unconfigured'); setMsg('Not configured'); return; }
        setStatus('checking');
        const t0 = Date.now();
        try {
            const r = await fetch(`${API}/api/smtp-check`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config.smtp)
            });
            const d = await r.json();
            setLatency(Date.now() - t0);
            setStatus(d.success ? 'ok' : 'error');
            setMsg(d.message || '');
        } catch (e) { setStatus('error'); setMsg('Connection refused'); }
    }, [config]);

    useEffect(() => { check(); }, [check]);

    const map = {
        ok: { dot: 'bg-green-400 shadow-[0_0_8px_#4ade80]', text: 'text-green-400', label: 'SMTP Online' },
        error: { dot: 'bg-red-500 shadow-[0_0_8px_#ef4444]', text: 'text-red-500', label: msg ? (msg.length > 15 ? msg.substring(0,12)+'...' : msg) : 'SMTP Error' },
        checking: { dot: 'bg-yellow-400 animate-pulse', text: 'text-yellow-400', label: 'Checking...' },
        unconfigured: { dot: 'bg-gray-300', text: 'text-gray-400', label: 'Not Configured' },
        idle: { dot: 'bg-gray-300', text: 'text-gray-400', label: '—' },
    }[status];

    return (
        <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-xl" title={msg}>
            <div className={`w-1.5 h-1.5 rounded-full ${map.dot}`} />
            <span className={`text-[9px] font-black uppercase tracking-widest ${map.text}`}>{map.label}</span>
            {latency && <span className="text-[8px] text-gray-600 font-mono ml-1">{latency}ms</span>}
            <button onClick={check} className="ml-1 text-gray-700 hover:text-gray-400 transition-colors"><RefreshCw className="w-2.5 h-2.5" /></button>
        </div>
    );
};

// Live email preview renderer
const EmailPreview = ({ flow, config, device, activeLang }) => {
    const isHe = activeLang === 'he';
    const rawSubject = (isHe && flow?.subject_he) ? flow.subject_he : (flow?.subject_en || flow?.subject || '');
    const rawBody = (isHe && flow?.body_he) ? flow.body_he : (flow?.body_en || flow?.body || '');
    const signatureUrl = config?.globalStyling?.signatureUrl;

    const body = rawBody.replace(/\n/g, '<br>')
        .replace(/{{name}}/g, isHe ? 'אלכס' : 'Alex')
        .replace(/{{eventName}}/g, isHe ? 'HBM תל אביב' : 'HBM Tel Aviv')
        .replace(/{{eventDate}}/g, isHe ? '14 במרץ 2026' : '14 March 2026')
        .replace(/{{location}}/g, isHe ? 'רעננה' : 'Raanana')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    const subject = rawSubject
        .replace(/{{name}}/g, isHe ? 'אלכס' : 'Alex')
        .replace(/{{eventName}}/g, isHe ? 'HBM תל אביב' : 'HBM Tel Aviv');

    const primary = config?.globalStyling?.primaryColor || '#6160AB';
    const secondary = config?.globalStyling?.secondaryColor || '#F07B3C';
    const logoUrl = config?.globalStyling?.logoUrl || '/logo.png';

    const dir = isHe ? 'rtl' : 'ltr';
    const align = isHe ? 'right' : 'left';

    return (
        <div className={`border-[8px] border-white rounded-[2rem] shadow-2xl overflow-hidden bg-[#f7f7fc] transition-all duration-500 ${device === 'mobile' ? 'w-[260px] mx-auto' : 'w-full'}`}>
            <div className="overflow-y-auto max-h-[520px]" dir={dir} style={{ textAlign: align }}>
                {/* Header */}
                <div className="h-24 flex items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                    <img src={logoUrl} className="h-10 object-contain drop-shadow-lg" alt="HBM" onError={(e) => e.target.style.display='none'} />
                </div>
                {/* Body */}
                <div className="p-6 bg-white shrink-0 min-h-[200px]">
                    <h3 className="text-[13px] font-black text-gray-900 leading-snug mb-3">{subject}</h3>
                    <div className="text-[11px] text-gray-600 leading-relaxed font-sans" dangerouslySetInnerHTML={{ __html: body }} />
                    {signatureUrl && <div className="mt-8"><img src={signatureUrl} alt="Signature" className="max-w-[120px] rounded" /></div>}
                </div>
                {/* Footer */}
                <div className="px-6 py-4 bg-[#fafafc] text-center text-[8px] text-gray-400 font-bold border-t border-gray-100 uppercase tracking-widest mt-auto">
                    © 2026 The Human Being Movement<br />
                    <span className="underline cursor-pointer text-gray-300 inline-block mt-2">Unsubscribe</span>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
// ── Main Component ────────────────────────────────────────────────────────────
const EmailEngine = () => {
    const [config, setConfig] = useState(null);
    const [activeFlowId, setActiveFlowId] = useState(null);
    const [activeView, setActiveView] = useState('flows');
    const [previewDevice, setPreviewDevice] = useState('mobile');
    const [saveStatus, setSaveStatus] = useState('');
    const [error, setError] = useState(null);
    const [engagementLog, setEngagementLog] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [aiGoal, setAiGoal] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [testStatus, setTestStatus] = useState('');
    const [queue, setQueue] = useState([]);
    const [editorLang, setEditorLang] = useState('en'); 
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiTone, setAiTone] = useState('inspiring');
    const [campaigns, setCampaigns] = useState([]);
    const [suppressionList, setSuppressionList] = useState([]);
    const [aiChat, setAiChat] = useState([{ role: 'ai', content: 'Ready to help you craft the perfect connection. What are we building today?' }]);
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
    const [crmSearch, setCrmSearch] = useState('');
    const [crmFilter, setCrmFilter] = useState('all');

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [cfg, eng, regs, q, camps, supp] = await Promise.all([
                fetch(`${API}/api/automation-settings`).then(r => r.json()).catch(() => null),
                fetch(`${API}/api/engagement`).then(r => r.json()).catch(() => []),
                fetch(`${API}/api/registrations`).then(r => r.json()).catch(() => []),
                fetch(`${API}/api/email-queue`).then(r => r.json()).catch(() => []),
                fetch(`${API}/api/campaigns`).then(r => r.json()).catch(() => []),
                fetch(`${API}/api/suppression`).then(r => r.json()).catch(() => []),
            ]);
            if (cfg === null) throw new Error('Server offline — is npm run dev:admin running?');

            if (!cfg.smtp) cfg.smtp = { host: '', port: 587, user: '', pass: '', from: '' };
            if (!cfg.globalStyling) cfg.globalStyling = { primaryColor: '#6160AB', secondaryColor: '#F07B3C', signatureUrl: '', logoUrl: '/logo.png' };

            const existingFlows = cfg.flows || [];
            DEFAULT_FLOWS.forEach(df => {
                if (!existingFlows.find(f => f.trigger === df.trigger)) {
                    existingFlows.push({
                        id: `flow_${df.id}`,
                        name: df.name,
                        trigger: df.trigger,
                        active: false,
                        subject_en: `Welcome - ${df.name}`,
                        subject_he: `ברוכים הבאים - ${df.name}`,
                        body_en: `Hello {{name}},\n\nThank you for joining us.\n\nBest regards,\nThe HBM Team`,
                        body_he: `שלום {{name}},\n\nתודה שהצטרפת אלינו.\n\nבברכה,\nצוות HBM`
                    });
                }
            });
            cfg.flows = existingFlows;

            setConfig(cfg);
            setEngagementLog(eng);
            setRegistrations(regs);
            setQueue(q);
            setCampaigns(camps);
            setSuppressionList(supp);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSave = async () => {
        setSaveStatus('Deploying...');
        try {
            await Promise.all([
                fetch(`${API}/api/automation-settings`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config)
                }),
                fetch(`${API}/api/campaigns/save-all`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ campaigns })
                })
            ]);
            setSaveStatus('✓ Live');
        } catch { setSaveStatus('✗ Failed'); }
        setTimeout(() => setSaveStatus(''), 3000);
    };

    const updateFlow = (id, updates) => {
        if (activeView === 'campaigns') {
            setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        } else {
            setConfig(prev => ({
                ...prev,
                flows: prev.flows.map(f => f.id === id ? { ...f, ...updates } : f)
            }));
        }
    };

    const improveWithAI = async () => {
        if (!aiPrompt && !aiGoal) return;
        setAiChat(prev => [...prev, { role: 'user', content: aiPrompt || `Improve with goal: ${aiGoal}` }]);
        setAiLoading(true);
        const textKey = editorLang === 'he' ? 'body_he' : 'body_en';
        const textToImprove = currentFlow[textKey] || currentFlow.body || '';
        try {
            const r = await fetch(`${API}/api/ai/improve-copy`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    text: textToImprove, 
                    goal: aiGoal || 'improvement', 
                    prompt: aiPrompt,
                    tone: aiTone,
                    language: editorLang 
                })
            });
            const d = await r.json();
            if (d.text) {
                setAiChat(prev => [...prev, { role: 'ai', content: m => "I've refined the copy. Should I apply it?", suggestedResult: d.text }]); // Note: This line is slightly different in the final version to handle chat better
            }
        } catch { 
            setAiChat(prev => [...prev, { role: 'ai', content: "Sorry, I hit a snag." }]);
        }
        setAiLoading(false);
        setAiPrompt('');
    };

    const applyAiResult = (text) => {
        const textKey = editorLang === 'he' ? 'body_he' : 'body_en';
        updateFlow(activeFlowId, { [textKey]: text });
    };

    const sendTest = async () => {
        if (!testEmail) { alert('Enter a test email first'); return; }
        setTestStatus('⏳ Sending...');
        try {
            const r = await fetch(`${API}/api/test-flow`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: testEmail, flowId: activeFlowId, language: editorLang })
            });
            const d = await r.json();
            if (d.success) setTestStatus('✅ Sent!');
            else throw new Error(d.error || 'Failed');
        } catch (e) { setTestStatus(`❌ ${e.message}`); }
        setTimeout(() => setTestStatus(''), 5000);
    };

    const toggleSuppression = async (email) => {
        try {
            const r = await fetch(`${API}/api/suppression/toggle`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const d = await r.json();
            if (d.success) setSuppressionList(d.list);
        } catch (e) { console.error(e); }
    };

    const deleteLead = async (id) => {
        if (!confirm('Permanently delete this lead?')) return;
        try {
            const r = await fetch(`${API}/api/registrations/${id}`, { method: 'DELETE' });
            if (r.ok) setRegistrations(prev => prev.filter(reg => reg.id !== id));
        } catch (e) { console.error(e); }
    };

    const insertAtCursor = (tag) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart, end = el.selectionEnd;
        const bodyKey = editorLang === 'he' ? 'body_he' : 'body_en';
        const body = currentFlow?.[bodyKey] || currentFlow?.body || '';
        const newBody = body.substring(0, start) + tag + body.substring(end);
        updateFlow(activeFlowId, { [bodyKey]: newBody });
        setTimeout(() => { el.focus(); el.setSelectionRange(start + tag.length, start + tag.length); }, 10);
    };

    const handleBlast = async (campaignId) => {
        const camp = campaigns.find(c => c.id === campaignId);
        const segment = camp?.segment || 'all';
        if (!confirm(`Are you sure you want to blast this campaign to [${segment}] segment?`)) return;
        setSaveStatus('🚀 Blasting...');
        try {
            const res = await fetch(`${API}/api/campaigns/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId, segment })
            });
            const data = await res.json();
            if (data.success) {
                setSaveStatus('✅ Blast enqueued!');
                fetchAll();
            } else throw new Error(data.error);
        } catch (e) { alert(`Blast failed: ${e.message}`); }
        setTimeout(() => setSaveStatus(''), 3000);
    };

    const handleEmailImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            const r = await fetch(`${API}/api/upload-email-image`, { method: 'POST', body: formData });
            const d = await r.json();
            if (d.success && d.url) {
                insertAtCursor(`\n<img src="${d.url}" width="100%" style="border-radius:12px;" />\n`);
            }
        } catch (err) { console.error('Image Upload Error:', err); }
    };

    const createCampaign = async () => {
        const name = prompt('Campaign Name:', 'Spring Newsletter 2026');
        if (!name) return;
        const segment = prompt('Target Segment (all / physical / video / newsletter):', 'all');
        const resp = await fetch(`${API}/api/campaigns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name, 
                segment: segment || 'all',
                subject_en: 'Edit Subject...', 
                body_en: 'Edit Content...', 
                sentToCount: 0 
            })
        });
        const data = await resp.json();
        if (data.success) {
            setCampaigns(prev => [...prev, data.campaign]);
            setActiveFlowId(data.campaign.id);
        }
    };

    const handleSignatureUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            const r = await fetch(`${API}/api/upload-email-image`, { method: 'POST', body: formData });
            const d = await r.json();
            if (d.success && d.url) {
                setConfig(prev => ({ ...prev, globalStyling: { ...prev.globalStyling, signatureUrl: d.url } }));
            }
        } catch (err) { console.error('Signature Upload Error:', err); }
    };

    // ── derived ─────────────────────────────────────────────────────────────
    const currentFlow = config?.flows?.find(f => f.id === activeFlowId) || campaigns.find(c => c.id === activeFlowId);
    const sentCount = queue.filter(q => q.status === 'sent').length;
    const pendingCount = queue.filter(q => q.status === 'pending').length;
    const failedCount = queue.filter(q => q.status === 'failed').length;
    const opens = engagementLog.filter(e => e.type === 'open').length;
    const clicks = engagementLog.filter(e => e.type === 'click').length;
    const openRate = sentCount > 0 ? Math.round((opens / sentCount) * 100) : 0;
    const ctr = opens > 0 ? Math.round((clicks / opens) * 100) : 0;

    // ── Error / Loading ──────────────────────────────────────────────────────
    if (error) return (
        <div className="h-full flex items-center justify-center p-10">
            <div className="bg-red-50 border border-red-100 rounded-[2rem] p-10 max-w-sm text-center shadow-xl">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-black text-red-700 tracking-tight mb-2">Engine Offline</h3>
                <p className="text-xs text-red-400 font-mono mb-6">{error}</p>
                <button onClick={fetchAll} className="bg-red-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg">
                    Reconnect
                </button>
            </div>
        </div>
    );

    if (!config) return (
        <div className="h-full flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Booting Email Engine...</p>
        </div>
    );

    // ── Main render ──────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full bg-[#f8f9fc] overflow-hidden font-sans">
            {/* TOP BAR */}
            <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-5">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
                            HBM Architect
                            <span className="text-[8px] bg-gradient-to-r from-purple-600 to-pink-500 text-white px-2 py-0.5 rounded-full font-black">ULTIMATE</span>
                        </h2>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                            {config.flows?.length + campaigns.length} paths · {registrations.length} leads · {suppressionList.length} opted out
                        </p>
                    </div>
                    <nav className="flex gap-0.5 p-1 bg-gray-100 rounded-xl">
                        {[
                            { id: 'flows', icon: Zap, label: 'Flows' },
                            { id: 'campaigns', icon: Send, label: 'Campaigns' },
                            { id: 'crm', icon: Users, label: 'CRM' },
                            { id: 'analytics', icon: BarChart3, label: 'Stats' },
                            { id: 'settings', icon: Settings, label: 'Setup' },
                        ].map(({ id, icon: Icon, label }) => (
                            <button key={id} onClick={() => { setActiveView(id); setActiveFlowId(null); }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === id ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
                                <Icon className="w-3 h-3" />{label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <SmtpBadge config={config} />
                    {saveStatus && <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest animate-pulse">{saveStatus}</span>}
                    <button onClick={handleSave} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all flex items-center gap-2 shadow-lg">
                        <Save className="w-3.5 h-3.5" /> Synchronize
                    </button>
                </div>
            </div>

            {/* FLOWS VIEW */}
            {activeView === 'flows' && !activeFlowId && (
                <div className="flex-1 p-10 overflow-y-auto">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-8">Engagement Triggers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
                        {DEFAULT_FLOWS.map((df) => {
                            const flow = config.flows.find(f => f.trigger === df.trigger);
                            if (!flow) return null;
                            return (
                                <div key={df.id} 
                                    onClick={() => setActiveFlowId(flow.id)}
                                    className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer overflow-hidden group">
                                    <div className="p-8 pb-6 flex items-start justify-between border-b border-gray-50 bg-gray-50/50">
                                        <div className="bg-purple-100 w-12 h-12 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <df.icon className="w-6 h-6" />
                                        </div>
                                        <Toggle checked={flow.active} onChange={(e) => { e.stopPropagation(); updateFlow(flow.id, { active: !flow.active }); }} />
                                    </div>
                                    <div className="p-8 pt-6">
                                        <h4 className="text-lg font-black text-gray-900 tracking-tight mb-2">{df.name}</h4>
                                        <p className="text-xs text-gray-400 font-bold mb-4">{df.desc}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono truncate">on_{df.trigger.replace('on', '')}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* CAMPAIGNS VIEW */}
            {activeView === 'campaigns' && !activeFlowId && (
                <div className="h-full p-10 overflow-y-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Broadcast Campaigns</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">One-time mass emails to your CRM segments</p>
                        </div>
                        <button onClick={createCampaign} className="bg-purple-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl flex items-center gap-2">
                            <PlusCircle className="w-4 h-4" /> New Broadcast
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-4 mb-10">
                        {[
                            { label: 'Total Campaigns', value: campaigns.length, icon: Send, color: 'text-purple-500 bg-purple-50' },
                            { label: 'Emails Sent', value: campaigns.reduce((a, c) => a + (c.sentToCount || 0), 0), icon: Mail, color: 'text-blue-500 bg-blue-50' },
                            { label: 'Active Drafts', value: campaigns.filter(c => c.status === 'draft').length, icon: Edit3, color: 'text-amber-500 bg-amber-50' },
                            { label: 'Total Leads', value: registrations.length, icon: Users, color: 'text-emerald-500 bg-emerald-50' },
                        ].map((s, i) => (
                            <div key={i} className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                                    <s.icon className="w-4 h-4" />
                                </div>
                                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {campaigns.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-gray-200 rounded-[3rem] p-20 text-center">
                            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Send className="w-8 h-8 text-purple-300" />
                            </div>
                            <h4 className="text-xl font-black text-gray-700 mb-2">No Campaigns Yet</h4>
                            <p className="text-sm text-gray-400 font-medium mb-6">Create a broadcast to send a mass email to your CRM segments.</p>
                            <button onClick={createCampaign} className="bg-purple-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-purple-700 transition shadow-lg">
                                + Create First Broadcast
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {campaigns.map(c => (
                                <div key={c.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                                    {/* Status Bar */}
                                    <div className={`h-1 w-full ${c.status === 'sent' ? 'bg-emerald-500' : c.status === 'sending' ? 'bg-blue-500 animate-pulse' : 'bg-amber-400'}`} />
                                    <div className="p-8">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-black text-gray-900 mb-1 leading-tight">{c.name}</h4>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                                        c.status === 'sent' ? 'bg-emerald-50 text-emerald-600' :
                                                        c.status === 'sending' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                                    }`}>{c.status || 'draft'}</span>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{c.segment || 'all'} leads</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-gray-50 rounded-2xl">
                                            <div className="text-center">
                                                <p className="text-xl font-black text-gray-900">{c.sentToCount || 0}</p>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Sent</p>
                                            </div>
                                            <div className="text-center border-x border-gray-200">
                                                <p className="text-xl font-black text-gray-900">{c.openCount || 0}</p>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Opened</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xl font-black text-gray-900">{c.clickCount || 0}</p>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Clicked</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setActiveFlowId(c.id)} className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-[9px] font-black uppercase hover:bg-black transition flex items-center justify-center gap-1.5">
                                                <Edit3 className="w-3 h-3" /> Edit
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if(window.confirm(`Send "${c.name}" to ${c.segment || 'all'} leads now?`)) handleBlast(c.id);
                                                }} 
                                                className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-[9px] font-black uppercase hover:bg-purple-700 transition flex items-center justify-center gap-1.5"
                                            >
                                                <Send className="w-3 h-3" /> Launch
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* EDITOR VIEW */}
            {(activeView === 'flows' || activeView === 'campaigns') && activeFlowId && currentFlow && (
                <div className="flex flex-1 overflow-y-auto gap-0 bg-white">
                    <div className="flex-1 p-8 space-y-6 overflow-y-auto min-w-0 border-r border-gray-100 rounded-tl-3xl shadow-[-10px_0_20px_rgba(0,0,0,0.02)] relative bg-[#f8f9fc]">
                        
                        {/* Editor Header */}
                        <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setActiveFlowId(null)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">{currentFlow.name}</h3>
                                    <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-widest">{currentFlow.trigger}</p>
                                </div>
                            </div>
                            
                            {/* Lang Toggle */}
                            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                                <button onClick={() => setEditorLang('en')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${editorLang === 'en' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}>English</button>
                                <button onClick={() => setEditorLang('he')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${editorLang === 'he' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}>עברית</button>
                            </div>
                        </div>

                        {/* Subject Input */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">{editorLang === 'he' ? 'שורת נושא' : 'Subject Line'}</label>
                            <input
                                value={editorLang === 'he' ? currentFlow.subject_he : currentFlow.subject_en || currentFlow.subject || ''}
                                onChange={e => updateFlow(activeFlowId, { [editorLang === 'he' ? 'subject_he' : 'subject_en']: e.target.value })}
                                dir={editorLang === 'he' ? 'rtl' : 'ltr'}
                                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                            />
                        </div>

                        {/* Body Input */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{editorLang === 'he' ? 'גוף ההודעה' : 'Email Body'}</label>
                                <div className="flex gap-2">
                                    <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-1">
                                        <ImageIcon className="w-3 h-3" /> Insert Image
                                        <input type="file" className="hidden" accept="image/*" onChange={handleEmailImageUpload} />
                                    </label>
                                    {['{{name}}', '{{eventName}}', '{{eventDate}}'].map(tag => (
                                        <button key={tag} onClick={() => insertAtCursor(tag)}
                                            className="text-[9px] font-black text-purple-600 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg font-mono transition-all">
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <textarea
                                ref={textareaRef}
                                rows={16}
                                value={editorLang === 'he' ? (currentFlow.body_he || '') : (currentFlow.body_en || currentFlow.body || '')}
                                onChange={e => updateFlow(activeFlowId, { [editorLang === 'he' ? 'body_he' : 'body_en']: e.target.value })}
                                dir={editorLang === 'he' ? 'rtl' : 'ltr'}
                                className="w-full bg-gray-50 rounded-xl px-4 py-4 text-sm font-mono border-none outline-none focus:ring-2 focus:ring-purple-500/20 resize-none leading-relaxed text-gray-800"
                            />
                        </div>

                        {/* AI & Testing Row */}
                        <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-pink-600 rounded-3xl p-6 text-white shadow-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">AI Copy Architect</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {['professional', 'warm', 'inspiring', 'witty'].map(t => (
                                                <button key={t} onClick={() => setAiTone(t)} className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter transition-all ${aiTone === t ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <input
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
                                        placeholder="e.g., 'Make it more urgent' or 'Focus on the 8-minute magic'"
                                        className="w-full bg-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/40 border border-white/10 mb-3 outline-none focus:ring-1 focus:ring-white/30"
                                    />

                                    <div className="flex gap-2">
                                        <select value={aiGoal} onChange={e => setAiGoal(e.target.value)}
                                            className="flex-1 bg-white/15 text-white rounded-xl px-2 py-2 text-[10px] font-bold backdrop-blur outline-none border border-white/10">
                                            <option value="" className="text-gray-900">Select vibe...</option>
                                            <option value="marketing" className="text-gray-900">Conversion Oriented</option>
                                            <option value="community" className="text-gray-900">Connection Focused</option>
                                            <option value="followup" className="text-gray-900">Post-Event FOMO</option>
                                        </select>
                                        <button onClick={improveWithAI} disabled={aiLoading}
                                        className="bg-white text-purple-700 px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-50 flex items-center gap-2 shadow-lg disabled:opacity-50 transition-transform active:scale-95">
                                        {aiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} Refine
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4 flex items-center gap-2"><Clock className="w-3 h-3" /> Delivery Drip (Delay)</label>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <input type="number" value={currentFlow.delayValue || 0} 
                                            onChange={e => updateFlow(activeFlowId, { delayValue: e.target.value })}
                                            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="0" />
                                    </div>
                                    <div className="flex-1">
                                        <select value={currentFlow.delayUnit || 'm'} 
                                            onChange={e => updateFlow(activeFlowId, { delayUnit: e.target.value })}
                                            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20">
                                            <option value="m">Minutes</option>
                                            <option value="h">Hours</option>
                                            <option value="d">Days</option>
                                        </select>
                                    </div>
                                </div>
                                <p className="text-[8px] text-gray-400 font-bold uppercase mt-3 tracking-wide">Wait {currentFlow.delayValue || 0} {currentFlow.delayUnit || 'm'} after trigger before sending.</p>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 flex flex-col items-start gap-1">Send Test (<span className='uppercase font-bold text-gray-600'>{editorLang}</span>)</label>
                                    <div className="flex gap-2">
                                        <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)}
                                            placeholder="test@email.com"
                                            className="flex-1 bg-gray-50 rounded-xl px-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20" />
                                        <button onClick={sendTest}
                                            className="px-4 py-3 bg-gray-900 text-white rounded-xl font-black text-[9px] uppercase hover:bg-black whitespace-nowrap">
                                            {testStatus || 'Test'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PREVIEW SIDEBAR */}
                        <div className="w-[380px] shrink-0 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-10 flex flex-col pt-8">
                            <div className="px-8 flex items-center justify-between mb-4">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Live Preview ({editorLang.toUpperCase()})</span>
                                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                                    <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded-lg transition-all ${previewDevice === 'mobile' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400'}`}><Smartphone className="w-4 h-4" /></button>
                                    <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded-lg transition-all ${previewDevice === 'desktop' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400'}`}><Monitor className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <div className="px-4 flex-1 overflow-y-auto pb-10">
                                <EmailPreview flow={currentFlow} config={config} device={previewDevice} activeLang={editorLang} />
                            </div>
                        </div>
                    </div>
                )}

                {/* CRM VIEW */}
                {activeView === 'crm' && (
                    <div className="h-full p-10 overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter">The HBM Directory</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage human connections and lead status</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="w-4 h-4 text-gray-300 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input 
                                        type="text" 
                                        placeholder="Search by name or email..." 
                                        value={crmSearch}
                                        onChange={e => setCrmSearch(e.target.value)}
                                        className="bg-white border border-gray-100 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/10 w-64 shadow-sm"
                                    />
                                </div>
                                <select 
                                    value={crmFilter}
                                    onChange={e => setCrmFilter(e.target.value)}
                                    className="bg-white border border-gray-100 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer"
                                >
                                    <option value="all">All Channels</option>
                                    <option value="video">Video Leads</option>
                                    <option value="physical">Physical Leads</option>
                                    <option value="subscriber">Subscribers</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {['Lead', 'Email', 'Source', 'Status', 'Heat', 'Actions'].map(h => (
                                            <th key={h} className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations
                                        .filter(r => {
                                            const matchesSearch = (r.name || '').toLowerCase().includes(crmSearch.toLowerCase()) || 
                                                                  (r.email || '').toLowerCase().includes(crmSearch.toLowerCase());
                                            const matchesFilter = crmFilter === 'all' || 
                                                                  (crmFilter === 'video' && r.category === 'Video Lead') ||
                                                                  (crmFilter === 'physical' && r.category === 'Event Lead') ||
                                                                  (crmFilter === 'subscriber' && r.category === 'Subscriber');
                                            return matchesSearch && matchesFilter;
                                        })
                                        .map(r => {
                                            const isUnsub = suppressionList.includes(r.email);
                                            const engSteps = engagementLog.filter(e => e.email === r.email).length;
                                        return (
                                            <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-black text-[10px]">{r.name ? r.name[0] : '?'}</div>
                                                        <span className="text-xs font-black text-gray-900">{r.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-xs text-gray-500 font-medium">{r.email}</td>
                                                <td className="px-8 py-6"><span className="px-3 py-1 bg-gray-100 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest">{r.source}</span></td>
                                                <td className="px-8 py-6">
                                                    {isUnsub ? (
                                                        <span className="flex items-center gap-1.5 text-red-500 text-[9px] font-black uppercase tracking-widest"><AlertCircle className="w-3 h-3" /> Opted Out</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-green-500 text-[9px] font-black uppercase tracking-widest"><CheckCircle2 className="w-3 h-3" /> Fully Active</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <div key={i} className={`w-3 h-1 rounded-full ${i < Math.min(engSteps, 5) ? 'bg-orange-400' : 'bg-gray-100'}`} />
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => toggleSuppression(r.email)} title={isUnsub ? "Re-subscribe" : "Mute Lead"} className={`p-2 rounded-lg transition-all ${isUnsub ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'}`}>
                                                            {isUnsub ? <CheckCircle2 className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                                                        </button>
                                                        <button onClick={() => deleteLead(r.id)} title="Delete Forever" className="p-2 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ANALYTICS VIEW */}
                {activeView === 'analytics' && (
                    <div className="h-full p-10 overflow-y-auto">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-8">Engagement Performance</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                            <KpiCard icon={Send} label="Outbound Total" value={sentCount} color="purple" />
                            <KpiCard icon={Eye} label="Open Events" value={opens} color="blue" sub={`${openRate}% rate`} />
                            <KpiCard icon={MousePointer} label="Direct Clicks" value={clicks} color="orange" sub={`${ctr}% CTR`} />
                            <KpiCard icon={Database} label="Growth Index" value={registrations.length} color="green" sub={`+${registrations.filter(r => new Date(r.date) > new Date(Date.now() - 7*24*60*60*1000)).length} this week`} />
                        </div>
                        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-10">Conversion Funnel</h4>
                            <div className="space-y-6">
                                {[
                                    { label: 'Sent', val: sentCount, color: 'bg-purple-600' },
                                    { label: 'Opened', val: opens, color: 'bg-blue-500' },
                                    { label: 'Clicked', val: clicks, color: 'bg-orange-500' }
                                ].map(step => (
                                    <div key={step.label} className="relative">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                            <span>{step.label}</span>
                                            <span>{step.val}</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }} animate={{ width: sentCount > 0 ? `${(step.val / sentCount) * 100}%` : '0%' }}
                                                className={`h-full ${step.color}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* SETTINGS VIEW */}
                {activeView === 'settings' && (
                    <div className="h-full p-10 overflow-y-auto">
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">Email Engine Setup</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Configure SMTP, branding, and global sending preferences</p>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                {/* SMTP Config */}
                                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 space-y-5">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center">
                                            <Settings className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-base">SMTP Infrastructure</h4>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Outbound mail server</p>
                                        </div>
                                        <div className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                            config.smtp?.host ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${config.smtp?.host ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                            {config.smtp?.host ? 'Configured' : 'Not Set'}
                                        </div>
                                    </div>
                                    {[
                                        { key: 'host', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
                                        { key: 'user', label: 'Username / Email', placeholder: 'you@gmail.com' },
                                        { key: 'pass', label: 'Password / App Key', placeholder: '••••••••' },
                                        { key: 'from', label: 'From Name + Email', placeholder: 'HBM Events <hello@thehbm.org>' },
                                    ].map(field => (
                                        <div key={field.key}>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{field.label}</label>
                                            <input 
                                                type={field.key === 'pass' ? 'password' : 'text'} 
                                                value={config.smtp?.[field.key] || ''} 
                                                onChange={e => setConfig(prev => ({ ...prev, smtp: { ...prev.smtp, [field.key]: e.target.value } }))} 
                                                placeholder={field.placeholder}
                                                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20 placeholder:text-gray-300" 
                                            />
                                        </div>
                                    ))}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Port</label>
                                            <input type="number" value={config.smtp?.port || 587} onChange={e => setConfig(prev => ({ ...prev, smtp: { ...prev.smtp, port: parseInt(e.target.value) } }))} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20" />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Encryption</label>
                                            <select value={config.smtp?.secure ? 'ssl' : 'tls'} onChange={e => setConfig(prev => ({ ...prev, smtp: { ...prev.smtp, secure: e.target.value === 'ssl' } }))} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none">
                                                <option value="tls">STARTTLS (587)</option>
                                                <option value="ssl">SSL/TLS (465)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Branding Config */}
                                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-pink-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-base">Email Branding</h4>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Visual identity for all emails</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Color</label>
                                            <div className="flex gap-2 items-center">
                                                <input type="color" value={config.globalStyling?.primaryColor || '#6160AB'} onChange={e => setConfig(prev => ({ ...prev, globalStyling: { ...prev.globalStyling, primaryColor: e.target.value } }))} className="w-12 h-12 rounded-xl border-none p-0 cursor-pointer" />
                                                <span className="text-xs font-mono text-gray-500">{config.globalStyling?.primaryColor || '#6160AB'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Accent Color</label>
                                            <div className="flex gap-2 items-center">
                                                <input type="color" value={config.globalStyling?.secondaryColor || '#F07B3C'} onChange={e => setConfig(prev => ({ ...prev, globalStyling: { ...prev.globalStyling, secondaryColor: e.target.value } }))} className="w-12 h-12 rounded-xl border-none p-0 cursor-pointer" />
                                                <span className="text-xs font-mono text-gray-500">{config.globalStyling?.secondaryColor || '#F07B3C'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Signature Banner</label>
                                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                                            {config.globalStyling?.signatureUrl ? (
                                                <img src={config.globalStyling.signatureUrl} className="h-12 object-contain rounded" />
                                            ) : (
                                                <div className="h-12 flex items-center">
                                                    <span className="text-[10px] text-gray-300 font-bold uppercase">No Signature Set</span>
                                                </div>
                                            )}
                                            <label className="bg-purple-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-purple-700 ml-auto">
                                                Upload <input type="file" className="hidden" onChange={handleSignatureUpload} />
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Unsubscribe URL</label>
                                        <input type="text" value={config.globalStyling?.unsubscribeUrl || ''} onChange={e => setConfig(prev => ({ ...prev, globalStyling: { ...prev.globalStyling, unsubscribeUrl: e.target.value } }))} placeholder="https://thehbm.org/unsubscribe" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20 placeholder:text-gray-300" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Global Footer Text</label>
                                        <textarea value={config.globalStyling?.footerText || ''} onChange={e => setConfig(prev => ({ ...prev, globalStyling: { ...prev.globalStyling, footerText: e.target.value } }))} rows={3} placeholder="© 2026 The HBM. Bringing people together." className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20 resize-none placeholder:text-gray-300" />
                                    </div>
                                </div>
                            </div>

                            {/* Quick Test */}
                            <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-[2rem] p-8 text-white">
                                <h4 className="font-black text-lg mb-2 flex items-center gap-2"><Zap className="w-5 h-5" /> Send Test Email</h4>
                                <p className="text-white/70 text-sm mb-4 font-medium">Verify your SMTP configuration is working correctly</p>
                                <div className="flex gap-3">
                                    <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="recipient@email.com" className="flex-1 bg-white/20 backdrop-blur text-white placeholder:text-white/40 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-white/30" />
                                    <button onClick={sendTest} className="bg-white text-purple-700 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-purple-50 transition shadow-lg">
                                        {testStatus || '📧 Send Test'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

        </div>
    );
};

export default EmailEngine;
