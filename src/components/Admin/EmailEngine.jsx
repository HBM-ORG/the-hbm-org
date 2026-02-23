import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Zap, Clock, Smartphone, Monitor, Sparkles, Send, BarChart3,
    Settings, Save, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft,
    Wand2, Activity, Users, MousePointer, Eye, RefreshCw, PlusCircle,
    Trash2, Database, Layers, Radio, ChevronRight, ChevronDown,
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

const KpiCard = ({ icon: Icon, label, value, sub, color = 'purple' }) => (
    <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm cursor-default"
    >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${color}-50`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        <div className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{String(value).toLocaleString()}</div>
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</div>
        {sub && <div className="text-[9px] text-gray-300 font-mono mt-1">{sub}</div>}
    </motion.div>
);

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
        error: { dot: 'bg-red-500 shadow-[0_0_8px_#ef4444]', text: 'text-red-500', label: msg || 'SMTP Error' },
        checking: { dot: 'bg-yellow-400 animate-pulse', text: 'text-yellow-400', label: 'Checking...' },
        unconfigured: { dot: 'bg-gray-300', text: 'text-gray-400', label: 'Not Configured' },
        idle: { dot: 'bg-gray-300', text: 'text-gray-400', label: '—' },
    }[status];

    return (
        <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-xl">
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

    const dir = isHe ? 'rtl' : 'ltr';
    const align = isHe ? 'right' : 'left';

    return (
        <div className={`border-[8px] border-white rounded-[2rem] shadow-2xl overflow-hidden bg-[#f7f7fc] transition-all duration-500 ${device === 'mobile' ? 'w-[260px] mx-auto' : 'w-full'}`}>
            <div className="overflow-y-auto max-h-[520px]" dir={dir} style={{ textAlign: align }}>
                {/* Header */}
                <div className="h-24 flex items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                    {config?.globalStyling?.logoUrl ? (
                        <img src={config?.globalStyling?.logoUrl} className="h-10 object-contain drop-shadow-lg" alt="HBM" />
                    ) : (
                        <span className="text-white font-bold opacity-50 text-xs">No Logo</span>
                    )}
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
    const [editorLang, setEditorLang] = useState('en'); // 'en' or 'he'
    const textareaRef = useRef(null);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [cfg, eng, regs, q] = await Promise.all([
                fetch(`${API}/api/automation-settings`).then(r => r.json()).catch(() => null),
                fetch(`${API}/api/engagement`).then(r => r.json()).catch(() => []),
                fetch(`${API}/api/registrations`).then(r => r.json()).catch(() => []),
                fetch(`${API}/api/email-queue`).then(r => r.json()).catch(() => []),
            ]);
            if (cfg === null) throw new Error('Server offline — is npm run dev:admin running?');

            // Ensure required top-level keys always exist
            if (!cfg.smtp) cfg.smtp = { host: '', port: 587, user: '', pass: '', from: '' };
            if (!cfg.globalStyling) cfg.globalStyling = { primaryColor: '#6160AB', secondaryColor: '#F07B3C', signatureUrl: '' };

            // Ensure all 4 core flows exist
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
            setEngagementLog(Array.isArray(eng) ? eng : []);
            setRegistrations(Array.isArray(regs) ? regs : []);
            setQueue(Array.isArray(q) ? q : []);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSave = async () => {
        setSaveStatus('Deploying...');
        try {
            await fetch(`${API}/api/automation-settings`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            setSaveStatus('✓ Live');
        } catch { setSaveStatus('✗ Failed'); }
        setTimeout(() => setSaveStatus(''), 3000);
    };

    const updateFlow = (id, patch) => setConfig(prev => ({
        ...prev, flows: prev.flows.map(f => f.id === id ? { ...f, ...patch } : f)
    }));

    const improveWithAI = async () => {
        if (!aiGoal || !currentFlow) return;
        setAiLoading(true);
        const textKey = editorLang === 'he' ? 'body_he' : 'body_en';
        const textToImprove = currentFlow[textKey] || currentFlow.body || '';
        try {
            const r = await fetch(`${API}/api/ai/improve-copy`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToImprove, goal: aiGoal, language: editorLang })
            });
            const d = await r.json();
            if (d.text) updateFlow(activeFlowId, { [textKey]: d.text });
        } catch { }
        setAiLoading(false);
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
            setTestStatus(d.success ? '✅ Sent!' : `❌ ${d.error}`);
        } catch (e) { setTestStatus(`❌ ${e.message}`); }
        setTimeout(() => setTestStatus(''), 5000);
    };

    const insertAtCursor = (tag) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart, end = el.selectionEnd;
        const bodyKey = editorLang === 'he' ? 'body_he' : 'body_en';
        const body = currentFlow?.[bodyKey] || currentFlow?.body || '';
        const newBody = body.substring(0, start) + tag + body.substring(end);
        updateFlow(activeFlowId, { [bodyKey]: newBody });
        setTimeout(() => { el.selectionStart = el.selectionEnd = start + tag.length; el.focus(); }, 0);
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
    const currentFlow = config?.flows?.find(f => f.id === activeFlowId);
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
                            Email Architect
                            <span className="text-[8px] bg-gradient-to-r from-purple-600 to-pink-500 text-white px-2 py-0.5 rounded-full font-black">PRO</span>
                        </h2>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                            {config.flows?.length} flows · {registrations.length} subscribers · {pendingCount} queued
                        </p>
                    </div>
                    <nav className="flex gap-0.5 p-1 bg-gray-100 rounded-xl">
                        {[
                            { id: 'flows', icon: Mail, label: 'Flows' },
                            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
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
                    <AnimatePresence>
                        {saveStatus && (
                            <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{saveStatus}
                            </motion.span>
                        )}
                    </AnimatePresence>
                    <button onClick={handleSave} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all flex items-center gap-2 shadow-lg hover:shadow-xl">
                        <Save className="w-3.5 h-3.5" /> Deploy
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

            {/* EDITOR VIEW */}
            {activeView === 'flows' && activeFlowId && currentFlow && (
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
                            <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-pink-600 rounded-2xl p-5 text-white shadow-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">AI Copywriter</span>
                                </div>
                                <div className="flex gap-2">
                                    <select value={aiGoal} onChange={e => setAiGoal(e.target.value)}
                                        className="flex-1 bg-white/15 text-white rounded-xl px-2 py-2 text-[10px] font-bold backdrop-blur outline-none">
                                        <option value="" className="text-gray-900">Select goal...</option>
                                        <option value="marketing" className="text-gray-900">Boost Registrations</option>
                                        <option value="community" className="text-gray-900">Community Warmth</option>
                                    </select>
                                    <button onClick={improveWithAI} disabled={aiLoading || !aiGoal}
                                        className="bg-white text-purple-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-50 flex items-center gap-1 shadow-lg disabled:opacity-50">
                                        {aiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} Refine
                                    </button>
                                </div>
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

            {/* ANALYTICS VIEW */}
            {activeView === 'analytics' && (
                <div className="flex-1 overflow-y-auto p-10">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-8">Performance & Log</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                        <KpiCard icon={Send} label="Total Sent" value={sentCount} color="purple" />
                        <KpiCard icon={Eye} label="Opens" value={opens} color="blue" sub={`${openRate}% rate`} />
                        <KpiCard icon={MousePointer} label="Clicks" value={clicks} color="orange" sub={`${ctr}% CTR`} />
                        <KpiCard icon={Database} label="Subscribers" value={registrations.length} color="green" />
                    </div>
                </div>
            )}

            {/* SETTINGS VIEW — always render even if smtp was missing on first load */}
            {activeView === 'settings' && (
                <div className="flex-1 overflow-y-auto p-10">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-8">System & Styling</h3>

                        <div className="grid grid-cols-2 gap-8">
                            {/* SMTP Config */}
                            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-black text-gray-900 flex items-center gap-2"><Settings className="w-4 h-4 text-purple-600" /> SMTP Host</h4>
                                    <SmtpBadge config={config} />
                                </div>
                                {[
                                    { key: 'host', label: 'Host', type: 'text' },
                                    { key: 'user', label: 'Username', type: 'text' },
                                    { key: 'pass', label: 'Password', type: 'password' },
                                    { key: 'from', label: 'From Email', type: 'text' }
                                ].map(({ key, label, type }) => (
                                    <div key={key}>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</label>
                                        <input type={type} value={config.smtp[key] || ''} onChange={e => setConfig(prev => ({ ...prev, smtp: { ...prev.smtp, [key]: e.target.value } }))} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none" />
                                    </div>
                                ))}
                            </div>

                            {/* Global Design & Signature */}
                            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-6">
                                <h4 className="font-black text-gray-900 flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-pink-500" /> Design Tokens</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Brand Primary</label>
                                        <input type="color" value={config.globalStyling?.primaryColor || '#6160AB'} onChange={e => setConfig(prev => ({ ...prev, globalStyling: { ...prev.globalStyling, primaryColor: e.target.value } }))} className="w-full h-12 rounded-xl border-none cursor-pointer p-0" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Brand Accent</label>
                                        <input type="color" value={config.globalStyling?.secondaryColor || '#F07B3C'} onChange={e => setConfig(prev => ({ ...prev, globalStyling: { ...prev.globalStyling, secondaryColor: e.target.value } }))} className="w-full h-12 rounded-xl border-none cursor-pointer p-0" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Signature Manager</label>
                                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                                        {config.globalStyling?.signatureUrl ? (
                                            <div className="relative group">
                                                <img src={config.globalStyling?.signatureUrl} alt="Signature" className="h-12 object-contain bg-white rounded p-1" />
                                                <button onClick={() => setConfig(prev => ({ ...prev, globalStyling: { ...prev.globalStyling, signatureUrl: '' } }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                                            </div>
                                        ) : (
                                            <div className="h-12 w-24 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-xs italic">No Image</div>
                                        )}
                                        <label className="bg-purple-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 cursor-pointer transition-colors shadow-lg">
                                            Upload Base64 / Image
                                            <input type="file" className="hidden" accept="image/*" onChange={handleSignatureUpload} />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-mono mt-2">Appended at the bottom of every automated email.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailEngine;
