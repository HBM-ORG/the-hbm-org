import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Zap, Clock, Smartphone, Monitor, Sparkles, Send, BarChart3,
    Settings, Save, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Search,
    Wand2, Activity, Users, MousePointer, Eye, RefreshCw, PlusCircle,
    Trash2, BellOff, Database, Layers, Radio, ChevronRight, ChevronDown,
    ToggleLeft, ToggleRight, Copy, Play, Pause, FlaskConical, Bell, Image as ImageIcon, Video, Calendar, X,
    Edit3
} from 'lucide-react';

import { getApiBase, resolveAssetUrl } from '../../utils/api';
import { getStoredAdminPassword } from '../../utils/admin-auth.js';
import { uploadFile } from '../../utils/upload';

// ── Utility ─────────────────────────────────────────────────────────────────
const TAG_COLORS = {
    open: 'text-blue-600 bg-blue-50',
    click: 'text-orange-600 bg-orange-50',
    sent: 'text-green-600 bg-green-50',
    failed: 'text-red-600 bg-red-50',
};

const DEFAULT_FLOWS = [
    { id: 'newsletter', trigger: 'onNewsletterSignup', name: 'Newsletter Welcome', icon: Mail, iconId: 'mail', desc: 'Sent when explicitly signing up for the newsletter' },
    { id: 'physical', trigger: 'onPhysicalRegistration', name: 'Physical Event Reg', icon: Calendar, iconId: 'calendar', desc: 'Sent when booking a spot for a real-world event' },
    { id: 'video', trigger: 'onVideoRegistration', name: 'Video Event Reg', icon: Video, iconId: 'video', desc: 'Sent when registering for an upcoming video session' },
    { id: 'journey', trigger: 'on8MinJourney', name: '8-Min Journey', icon: Zap, iconId: 'zap', desc: 'Funnel or re-engagement for the general journey' }
];

const ICON_OPTIONS = [
    { id: '', label: 'Auto / Default', icon: Sparkles },
    { id: 'bell', label: 'Bell', icon: Bell },
    { id: 'mail', label: 'Mail', icon: Mail },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'zap', label: 'Lightning', icon: Zap },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'clock', label: 'Clock', icon: Clock },
    { id: 'send', label: 'Send', icon: Send },
    { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'mousePointer', label: 'Pointer', icon: MousePointer },
    { id: 'eye', label: 'Eye', icon: Eye },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'layers', label: 'Layers', icon: Layers },
    { id: 'radio', label: 'Radio', icon: Radio },
    { id: 'smartphone', label: 'Mobile', icon: Smartphone },
    { id: 'monitor', label: 'Desktop', icon: Monitor },
    { id: 'checkCircle', label: 'Check', icon: CheckCircle2 },
    { id: 'alertCircle', label: 'Alert', icon: AlertCircle },
    { id: 'flask', label: 'Experiment', icon: FlaskConical },
];

const ICON_BY_ID = ICON_OPTIONS.reduce((acc, item) => {
    if (item.id) acc[item.id] = item.icon;
    return acc;
}, {});

function getFlowIcon(flow, definition) {
    return ICON_BY_ID[flow?.icon] || definition?.icon || Bell;
}

const TRIGGER_ALIASES = {
    site_signup: 'on8MinJourney',
    on_site_signup: 'on8MinJourney',
};

function normalizeTriggerKey(trigger) {
    const raw = String(trigger || '').trim();
    return TRIGGER_ALIASES[raw] || raw;
}

const DELIVERY_MODE_META = {
    architect_html: {
        label: 'Email Architect',
        shortLabel: 'Architect',
        card: 'bg-blue-50 text-blue-600',
        dot: 'bg-blue-500',
        description: 'This trigger sends the local Email Architect template.',
    },
    brevo_template: {
        label: 'Brevo Template',
        shortLabel: 'Brevo Template',
        card: 'bg-violet-50 text-violet-600',
        dot: 'bg-violet-500',
        description: 'This trigger sends a Brevo transactional template ID.',
    },
    brevo_automation: {
        label: 'Brevo Automation',
        shortLabel: 'Brevo Auto',
        card: 'bg-amber-50 text-amber-700',
        dot: 'bg-amber-500',
        description: 'No local email is sent; Brevo automations own delivery after contact sync.',
    },
};

function getDeliveryMeta(flow) {
    return DELIVERY_MODE_META[flow?.deliveryMode] || DELIVERY_MODE_META.architect_html;
}

function isDefaultFlow(flow) {
    return DEFAULT_FLOWS.some(df => String(df.trigger || '').toLowerCase() === normalizeTriggerKey(flow?.trigger).toLowerCase());
}

function getFlowDefinition(flow) {
    const match = DEFAULT_FLOWS.find(df => String(df.trigger || '').toLowerCase() === normalizeTriggerKey(flow?.trigger).toLowerCase());
    if (match) return match;
    return {
        id: flow?.id || flow?.trigger || 'custom',
        trigger: flow?.trigger || '',
        name: flow?.name || 'Custom Trigger',
        icon: Bell,
        desc: 'Custom automation trigger. It will run when the backend emits this trigger key.',
        custom: true,
    };
}

function getFlowPriority(flow) {
    let score = 0;
    if (flow?.active) score += 10;
    if (flow?.deliveryMode && flow.deliveryMode !== 'architect_html') score += 5;
    if (flow?.legacyId && !String(flow.legacyId).startsWith('flow_')) score += 3;
    if (flow?.id && !String(flow.id).startsWith('flow_')) score += 1;
    return score;
}

function dedupeFlowsByTrigger(flows) {
    const byTrigger = new Map();
    flows.forEach(flow => {
        const normalized = normalizeFlow(flow);
        const key = normalizeTriggerKey(normalized.trigger).toLowerCase();
        if (!key) return;
        const current = byTrigger.get(key);
        if (!current || getFlowPriority(normalized) >= getFlowPriority(current)) {
            byTrigger.set(key, normalized);
        }
    });
    return Array.from(byTrigger.values());
}

const DEFAULT_PROVIDER_CONFIG = {
    emailProvider: 'smtp',
    brevoApiUrl: 'https://api.brevo.com/v3',
    brevoApiKey: '',
    brevoApiKeyMasked: '',
    brevoApiKeySource: 'none',
    brevoConfigured: false,
    brevoSenderName: 'The HBM',
    brevoSenderEmail: '',
    brevoAutomationEnabled: false,
};

const DEFAULT_GLOBAL_STYLING = {
    primaryColor: '#6160AB',
    secondaryColor: '#F07B3C',
    logoUrl: '',
    fontFamily: 'Sora, Arial, sans-serif',
    useDefaultHeader: true,
    useDefaultFooter: true,
    headerMode: 'gradient',
    headerImageUrl: '',
    headerTitle: 'The Human Being Movement',
    headerSubtitle: 'Crafting deep human connections, 8 minutes at a time.',
    headerBackgroundColor: '#6160AB',
    headerBackgroundType: 'gradient',
    headerGradientFrom: '#6160AB',
    headerGradientTo: '#F07B3C',
    headerGradientAngle: 135,
    headerTextColor: '#ffffff',
    headerTextType: 'flat',
    headerTextGradientFrom: '#ffffff',
    headerTextGradientTo: '#F7D5FF',
    headerTextGradientAngle: 135,
    footerText: '© 2026 The Human Being Movement<br>Crafting deep human connections, 8 minutes at a time.',
    footerImageUrl: '',
    footerBackgroundColor: '#fafafc',
    footerBackgroundType: 'flat',
    footerGradientFrom: '#fafafc',
    footerGradientTo: '#F07B3C',
    footerGradientAngle: 135,
    footerTextColor: '#a0a0b0',
    footerTextType: 'flat',
    footerTextGradientFrom: '#a0a0b0',
    footerTextGradientTo: '#6160AB',
    footerTextGradientAngle: 135,
    unsubscribeLabel: 'Unsubscribe from these emails',
    unsubscribeUrl: '',
    signatureUrl: '',
};

function normalizeGlobalStyling(styling = {}) {
    return { ...DEFAULT_GLOBAL_STYLING, ...styling };
}

function getEffectiveTemplateSettings(config, flow) {
    const global = normalizeGlobalStyling(config?.globalStyling);
    const overrides = flow?.templateOverrides && typeof flow.templateOverrides === 'object' ? flow.templateOverrides : {};
    return { ...global, ...overrides };
}

function getBackgroundStyle(settings, prefix, fallbackFlat, fallbackTo) {
    const type = settings?.[`${prefix}BackgroundType`] || 'flat';
    const flat = settings?.[`${prefix}BackgroundColor`] || fallbackFlat;
    const from = settings?.[`${prefix}GradientFrom`] || flat;
    const to = settings?.[`${prefix}GradientTo`] || fallbackTo || flat;
    const angle = Number(settings?.[`${prefix}GradientAngle`] ?? 135);
    return type === 'gradient'
        ? `linear-gradient(${Number.isFinite(angle) ? angle : 135}deg, ${from}, ${to})`
        : flat;
}

function getTextStyle(settings, prefix, fallbackFlat, fallbackTo) {
    const type = settings?.[`${prefix}TextType`] || 'flat';
    const flat = settings?.[`${prefix}TextColor`] || fallbackFlat;
    const from = settings?.[`${prefix}TextGradientFrom`] || flat;
    const to = settings?.[`${prefix}TextGradientTo`] || fallbackTo || flat;
    const angle = Number(settings?.[`${prefix}TextGradientAngle`] ?? 135);
    if (type !== 'gradient') return { color: flat };
    return {
        color: flat,
        backgroundImage: `linear-gradient(${Number.isFinite(angle) ? angle : 135}deg, ${from}, ${to})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    };
}

function createDefaultFlow(df) {
    return {
        id: `flow_${df.id}`,
        name: df.name,
        trigger: df.trigger,
        icon: df.iconId || '',
        active: false,
        status: 'published',
        deliveryMode: 'architect_html',
        brevoTemplateId: '',
        brevoTemplateIdEn: '',
        brevoTemplateIdHe: '',
        templateOverrides: {},
        subject_en: `Welcome - ${df.name}`,
        subject_he: `ברוכים הבאים - ${df.name}`,
        body_en: `Hello {{name}},\n\nThank you for joining us.\n\nBest regards,\nThe HBM Team`,
        body_he: `שלום {{name}},\n\nתודה שהצטרפת אלינו.\n\nבברכה,\nצוות HBM`
    };
}

function normalizeFlow(flow) {
    const deliveryMode = ['architect_html', 'brevo_template', 'brevo_automation'].includes(String(flow?.deliveryMode || '').toLowerCase())
        ? String(flow.deliveryMode).toLowerCase()
        : 'architect_html';
    return {
        ...flow,
        trigger: normalizeTriggerKey(flow?.trigger),
        icon: ICON_BY_ID[flow?.icon] ? flow.icon : '',
        status: String(flow?.status || '').toLowerCase() === 'draft' ? 'draft' : 'published',
        deliveryMode,
        brevoTemplateId: flow?.brevoTemplateId || '',
        brevoTemplateIdEn: flow?.brevoTemplateIdEn || '',
        brevoTemplateIdHe: flow?.brevoTemplateIdHe || '',
        templateOverrides: flow?.templateOverrides && typeof flow.templateOverrides === 'object' ? flow.templateOverrides : {},
    };
}

function getDefaultConfig() {
    return {
        smtp: { host: '', port: 587, user: '', pass: '', from: '' },
        providerConfig: { ...DEFAULT_PROVIDER_CONFIG },
        globalStyling: normalizeGlobalStyling(),
        flows: DEFAULT_FLOWS.map(createDefaultFlow)
    };
}

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

const ColorModeControl = ({ label, prefix, tone = 'Background', values, onChange, fallbackFlat = '#ffffff', fallbackTo = '#F07B3C' }) => {
    const isBackground = tone === 'Background';
    const typeKey = `${prefix}${tone}Type`;
    const flatKey = `${prefix}${tone}Color`;
    const fromKey = isBackground ? `${prefix}GradientFrom` : `${prefix}${tone}GradientFrom`;
    const toKey = isBackground ? `${prefix}GradientTo` : `${prefix}${tone}GradientTo`;
    const angleKey = isBackground ? `${prefix}GradientAngle` : `${prefix}${tone}GradientAngle`;
    const type = values?.[typeKey] || 'flat';
    const flat = values?.[flatKey] || fallbackFlat;
    const from = values?.[fromKey] || flat;
    const to = values?.[toKey] || fallbackTo;
    const angle = values?.[angleKey] ?? 135;
    const preview = type === 'gradient' ? `linear-gradient(${angle}deg, ${from}, ${to})` : flat;

    return (
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
                <div className="w-10 h-10 rounded-xl border border-white shadow-sm" style={{ background: preview }} />
            </div>
            <div className="flex bg-white rounded-xl p-1 gap-1">
                {[
                    { id: 'flat', label: 'Flat' },
                    { id: 'gradient', label: 'Gradient' },
                ].map(option => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onChange({ [typeKey]: option.id })}
                        className={`flex-1 rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest ${type === option.id ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            {type === 'gradient' ? (
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">From</span>
                        <input type="color" value={from} onChange={e => onChange({ [fromKey]: e.target.value })} className="w-full h-10 rounded-lg border-none p-0 cursor-pointer" />
                    </div>
                    <div>
                        <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">To</span>
                        <input type="color" value={to} onChange={e => onChange({ [toKey]: e.target.value })} className="w-full h-10 rounded-lg border-none p-0 cursor-pointer" />
                    </div>
                    <div>
                        <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Angle</span>
                        <input type="number" min="0" max="360" value={angle} onChange={e => onChange({ [angleKey]: Number(e.target.value) })} className="w-full h-10 rounded-lg bg-white px-2 text-xs font-bold outline-none" />
                    </div>
                </div>
            ) : (
                <div>
                    <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Color</span>
                    <input type="color" value={flat} onChange={e => onChange({ [flatKey]: e.target.value })} className="w-14 h-10 rounded-lg border-none p-0 cursor-pointer" />
                </div>
            )}
        </div>
    );
};

const IconPicker = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const selected = ICON_OPTIONS.find(option => option.id === value) || ICON_OPTIONS[0];
    const SelectedIcon = selected.icon;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20 flex items-center justify-between gap-3"
            >
                <span className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <SelectedIcon className="w-4 h-4" />
                    </span>
                    <span className="truncate">{selected.label}</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute z-30 mt-2 w-full max-h-72 overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-xl p-2">
                    {ICON_OPTIONS.map(option => {
                        const OptionIcon = option.icon;
                        const active = option.id === value;
                        return (
                            <button
                                key={option.id || 'auto'}
                                type="button"
                                onClick={() => {
                                    onChange(option.id);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-purple-50 text-purple-700' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                                    <OptionIcon className="w-4 h-4" />
                                </span>
                                <span className="truncate">{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Backend connection status (API reachable)
const BackendBadge = () => {
    const [status, setStatus] = useState('checking');
    const [latency, setLatency] = useState(null);
    const API = getApiBase();

    const check = useCallback(async () => {
        setStatus('checking');
        const t0 = Date.now();
        try {
            const r = await fetch(`${API}/api/automation-settings`, { method: 'GET' });
            setLatency(Date.now() - t0);
            setStatus(r.ok ? 'ok' : 'error');
        } catch (e) { setStatus('error'); setLatency(Date.now() - t0); }
    }, [API]);

    useEffect(() => { check(); }, [check]);

    const map = {
        ok: { dot: 'bg-green-400 shadow-[0_0_8px_#4ade80]', text: 'text-green-400', label: 'Connection OK' },
        error: { dot: 'bg-red-500 shadow-[0_0_8px_#ef4444]', text: 'text-red-500', label: 'Connection Failed' },
        checking: { dot: 'bg-yellow-400 animate-pulse', text: 'text-yellow-400', label: 'Checking…' },
    }[status];

    return (
        <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-xl" title={status === 'error' ? 'Backend not reachable. Run: npm run dev:admin' : ''}>
            <div className={`w-1.5 h-1.5 rounded-full ${map.dot}`} />
            <span className={`text-[9px] font-black uppercase tracking-widest ${map.text}`}>{map.label}</span>
            {latency != null && <span className="text-[8px] text-gray-500 font-mono ml-1">{latency}ms</span>}
            <button onClick={check} className="ml-1 text-gray-600 hover:text-gray-400 transition-colors" title="Recheck"><RefreshCw className="w-2.5 h-2.5" /></button>
        </div>
    );
};

const SmtpBadge = ({ config }) => {
    const API = getApiBase();
    const [status, setStatus] = useState('idle');
    const [msg, setMsg] = useState('');
    const [latency, setLatency] = useState(null);

    const check = useCallback(async () => {
        if (!config?.smtp?.host || !config?.smtp?.user || !config?.smtp?.pass) { setStatus('unconfigured'); setMsg('SMTP host, user, and password/app key are required'); return; }
        setStatus('checking');
        const t0 = Date.now();
        try {
            const r = await fetch(`${API}/api/smtp-check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Password': getStoredAdminPassword()
                },
                body: JSON.stringify(config.smtp)
            });
            const d = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(d?.error || 'SMTP check failed');
            setLatency(Date.now() - t0);
            setStatus(d.connected || d.success ? 'ok' : 'error');
            setMsg(d.message || '');
        } catch (e) { setStatus('error'); setMsg(e.message || 'Connection refused'); }
    }, [config, API]);

    useEffect(() => { check(); }, [check]);

    const map = {
        ok: { dot: 'bg-green-400 shadow-[0_0_8px_#4ade80]', text: 'text-green-400', label: 'SMTP OK' },
        error: { dot: 'bg-red-500 shadow-[0_0_8px_#ef4444]', text: 'text-red-500', label: 'SMTP Failed' },
        checking: { dot: 'bg-yellow-400 animate-pulse', text: 'text-yellow-400', label: 'SMTP…' },
        unconfigured: { dot: 'bg-gray-300', text: 'text-gray-400', label: 'SMTP Not Set' },
        idle: { dot: 'bg-gray-300', text: 'text-gray-400', label: '—' },
    }[status];

    return (
        <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-xl" title={msg || undefined}>
            <div className={`w-1.5 h-1.5 rounded-full ${map.dot}`} />
            <span className={`text-[9px] font-black uppercase tracking-widest ${map.text}`}>{map.label}</span>
            {latency != null && status !== 'unconfigured' && <span className="text-[8px] text-gray-500 font-mono ml-1">{latency}ms</span>}
            <button onClick={check} className="ml-1 text-gray-600 hover:text-gray-400 transition-colors" title="Recheck SMTP"><RefreshCw className="w-2.5 h-2.5" /></button>
        </div>
    );
};

const ProviderBadge = () => {
    const API = getApiBase();
    const [status, setStatus] = useState(null);

    const check = useCallback(async () => {
        try {
            const r = await fetch(`${API}/api/providers/status`, {
                headers: { 'X-Admin-Password': getStoredAdminPassword() }
            });
            const d = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(d?.error || 'Provider status unavailable');
            setStatus(d);
        } catch (_error) {
            setStatus(null);
        }
    }, [API]);

    useEffect(() => { check(); }, [check]);

    const provider = String(status?.emailProvider || 'smtp').toUpperCase();
    const brevoConfigured = Boolean(status?.brevo?.configured);
    const brevoConnected = Boolean(status?.brevo?.connected);
    const espoConfigured = Boolean(status?.espocrm?.configured);

    return (
        <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-xl" title={`Brevo: ${brevoConnected ? 'connected' : brevoConfigured ? status?.brevo?.message || 'configured' : 'off'} · EspoCRM: ${espoConfigured ? 'configured' : 'off'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${provider === 'BREVO' && brevoConnected ? 'bg-purple-400 shadow-[0_0_8px_#c084fc]' : provider === 'BREVO' ? 'bg-amber-400 shadow-[0_0_8px_#facc15]' : 'bg-blue-400 shadow-[0_0_8px_#60a5fa]'}`} />
            <span className="text-[9px] font-black uppercase tracking-widest text-white">{provider}</span>
            <span className="text-[8px] text-gray-500 font-mono">{brevoConnected ? 'brevo:ok' : brevoConfigured ? 'brevo:check' : 'brevo:off'} · {espoConfigured ? 'espo:on' : 'espo:off'}</span>
            <button onClick={check} className="ml-1 text-gray-600 hover:text-gray-400 transition-colors" title="Recheck providers"><RefreshCw className="w-2.5 h-2.5" /></button>
        </div>
    );
};

// Live email preview renderer
const EmailPreview = ({ flow, config, device, activeLang }) => {
    const isHe = activeLang === 'he';
    const rawSubject = (isHe && flow?.subject_he) ? flow.subject_he : (flow?.subject_en || flow?.subject || '');
    const rawBody = (isHe && flow?.body_he) ? flow.body_he : (flow?.body_en || flow?.body || '');
    const template = getEffectiveTemplateSettings(config, flow);
    const signatureUrl = resolveAssetUrl(template.signatureUrl);

    const body = rawBody.replace(/\n/g, '<br>')
        .replace(/{{name}}/g, isHe ? 'אלכס' : 'Alex')
        .replace(/{{eventName}}/g, isHe ? 'HBM תל אביב' : 'HBM Tel Aviv')
        .replace(/{{eventDate}}/g, isHe ? '14 במרץ 2026' : '14 March 2026')
        .replace(/{{location}}/g, isHe ? 'רעננה' : 'Raanana')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    const subject = rawSubject
        .replace(/{{name}}/g, isHe ? 'אלכס' : 'Alex')
        .replace(/{{eventName}}/g, isHe ? 'HBM תל אביב' : 'HBM Tel Aviv');

    const primary = template.primaryColor || '#6160AB';
    const secondary = template.secondaryColor || '#F07B3C';
    const logoUrl = resolveAssetUrl(template.logoUrl);
    const headerImageUrl = resolveAssetUrl(template.headerImageUrl);
    const footerImageUrl = resolveAssetUrl(template.footerImageUrl);
    const headerLogoUrl = headerImageUrl || logoUrl;

    const dir = isHe ? 'rtl' : 'ltr';
    const align = isHe ? 'right' : 'left';

    return (
        <div className={`border-[8px] border-white rounded-[2rem] shadow-2xl overflow-hidden bg-[#f7f7fc] transition-all duration-500 ${device === 'mobile' ? 'w-[260px] mx-auto' : 'w-full'}`}>
            <div className="overflow-y-auto max-h-[520px]" dir={dir} style={{ textAlign: align }}>
                {template.useDefaultHeader !== false && (
                    <div
                        className="min-h-24 flex flex-col items-center justify-center p-4 text-center"
                        style={{
                            color: template.headerTextColor || '#ffffff',
                            background: template.headerMode === 'image' && headerImageUrl
                                ? `linear-gradient(135deg, ${primary}aa, ${secondary}aa), url(${headerImageUrl}) center/cover`
                                : getBackgroundStyle(template, 'header', primary, secondary)
                        }}
                    >
                        {headerLogoUrl ? (
                            <img src={headerLogoUrl} className="max-h-12 max-w-[150px] object-contain drop-shadow-lg mb-2" alt="HBM" onError={(e) => e.target.style.display='none'} />
                        ) : null}
                        {template.headerTitle && <div className="text-[14px] font-black leading-tight" style={getTextStyle(template, 'header', template.headerTextColor || '#ffffff', '#F7D5FF')}>{template.headerTitle}</div>}
                        {template.headerSubtitle && <div className="text-[9px] font-bold opacity-80 mt-1" style={getTextStyle(template, 'header', template.headerTextColor || '#ffffff', '#F7D5FF')}>{template.headerSubtitle}</div>}
                    </div>
                )}
                {/* Body */}
                <div className="p-6 bg-white shrink-0 min-h-[200px]">
                    <h3 className="text-[13px] font-black text-gray-900 leading-snug mb-3">{subject}</h3>
                    <div className="text-[11px] text-gray-600 leading-relaxed font-sans" dangerouslySetInnerHTML={{ __html: body }} />
                    {signatureUrl && <div className="mt-8"><img src={signatureUrl} alt="Signature" className="max-w-[120px] rounded" /></div>}
                </div>
                {/* Footer */}
                {template.useDefaultFooter !== false && (
                    <div
                        className="px-6 py-4 text-center text-[8px] font-bold border-t border-gray-100 mt-auto"
                        style={{ background: getBackgroundStyle(template, 'footer', '#fafafc', secondary), ...getTextStyle(template, 'footer', template.footerTextColor || '#a0a0b0', secondary) }}
                    >
                        {footerImageUrl && <img src={footerImageUrl} className="h-8 object-contain mx-auto mb-2" alt="" />}
                        <div dangerouslySetInnerHTML={{ __html: template.footerText || DEFAULT_GLOBAL_STYLING.footerText }} />
                        <span className="underline cursor-pointer inline-block mt-2 opacity-70">{template.unsubscribeLabel || 'Unsubscribe'}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
// ── Main Component ────────────────────────────────────────────────────────────
const EmailEngine = () => {
    const API = getApiBase();
    const [config, setConfig] = useState(getDefaultConfig);
    const [lastSavedConfig, setLastSavedConfig] = useState(getDefaultConfig);
    const [backendOffline, setBackendOffline] = useState(false);
    const [activeFlowId, setActiveFlowId] = useState(null);
    const [activeFlowTrigger, setActiveFlowTrigger] = useState(null);
    const [activeView, setActiveView] = useState('flows');
    const editorPanelRef = useRef(null);
    const textareaRef = useRef(null);
    const [previewDevice, setPreviewDevice] = useState('mobile');
    const [saveStatus, setSaveStatus] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [error, setError] = useState(null);
    const [engagementLog, setEngagementLog] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [aiGoal, setAiGoal] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [testStatus, setTestStatus] = useState('');
    const [smtpTestStatus, setSmtpTestStatus] = useState('');
    const [brevoTestStatus, setBrevoTestStatus] = useState('');
    const [templateUploadStatus, setTemplateUploadStatus] = useState('');
    const [queue, setQueue] = useState([]);
    const [editorLang, setEditorLang] = useState('en'); 
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiTone, setAiTone] = useState('inspiring');
    const [campaigns, setCampaigns] = useState([]);
    const [suppressionList, setSuppressionList] = useState([]);
    const [aiChat, setAiChat] = useState([{ role: 'ai', content: 'Ready to help you craft the perfect connection. What are we building today?' }]);
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
    const [pendingAiText, setPendingAiText] = useState(null);
    const [crmSearch, setCrmSearch] = useState('');
    const [crmFilter, setCrmFilter] = useState('all');

    useEffect(() => {
        fetchAll();
    }, []);


    const fetchAll = async () => {
        try {
            setError(null);
            const [cfg, eng, regs, q, camps, supp] = await Promise.all([
                fetch(`${API}/api/automation-settings`).then(r => r.ok ? r.json().catch(() => null) : null).catch(() => null),
                fetch(`${API}/api/engagement`).then(r => r.ok ? r.json().catch(() => []) : []).catch(() => []),
                fetch(`${API}/api/registrations`).then(r => r.ok ? r.json().catch(() => []) : []).catch(() => []),
                fetch(`${API}/api/email-queue`).then(r => r.ok ? r.json().catch(() => []) : []).catch(() => []),
                fetch(`${API}/api/campaigns`).then(r => r.ok ? r.json().catch(() => []) : []).catch(() => []),
                fetch(`${API}/api/suppression`).then(r => r.ok ? r.json().catch(() => []) : []).catch(() => []),
            ]);
            if (cfg === null || typeof cfg !== 'object') {
                setBackendOffline(true);
                const fallback = getDefaultConfig();
                setConfig(fallback);
                setLastSavedConfig(fallback);
                setEngagementLog([]);
                setRegistrations([]);
                setQueue([]);
                setCampaigns([]);
                setSuppressionList([]);
                setError(null);
                return;
            }

            setBackendOffline(false);
            if (!cfg.smtp) cfg.smtp = { host: '', port: 587, user: '', pass: '', from: '' };
            cfg.providerConfig = { ...DEFAULT_PROVIDER_CONFIG, ...(cfg.providerConfig || {}) };
            cfg.globalStyling = normalizeGlobalStyling(cfg.globalStyling);

            const existingFlows = dedupeFlowsByTrigger(Array.isArray(cfg.flows) ? cfg.flows : []);
            const triggerKey = (t) => (t || '').toLowerCase();
            DEFAULT_FLOWS.forEach(df => {
                if (!existingFlows.find(f => triggerKey(f.trigger) === triggerKey(df.trigger))) {
                    existingFlows.push(createDefaultFlow(df));
                }
            });
            cfg.flows = existingFlows;

            setConfig(cfg);
            setLastSavedConfig(cfg);
            setEngagementLog(Array.isArray(eng) ? eng : []);
            setRegistrations(Array.isArray(regs) ? regs : []);
            setQueue(Array.isArray(q) ? q : []);
            setCampaigns(Array.isArray(camps) ? camps : []);
            setSuppressionList(Array.isArray(supp) ? supp : []);
            setError(null);
        } catch (err) {
            setBackendOffline(true);
            const fallback = getDefaultConfig();
            setConfig(fallback);
            setLastSavedConfig(fallback);
            setEngagementLog([]);
            setRegistrations([]);
            setQueue([]);
            setCampaigns([]);
            setSuppressionList([]);
            setError(null);
        }
    };

    const handleSave = async () => {
        setSaveStatus('Deploying...');
        try {
            const invalidBrevoFlow = (Array.isArray(config.flows) ? config.flows : []).find(flow => {
                if (flow.status === 'draft') return false;
                if (flow.deliveryMode !== 'brevo_template') return false;
                return !(flow.brevoTemplateId || flow.brevoTemplateIdEn || flow.brevoTemplateIdHe);
            });
            if (invalidBrevoFlow) {
                setSaveStatus(`✗ Missing Brevo template: ${invalidBrevoFlow.name || invalidBrevoFlow.id}`);
                setTimeout(() => setSaveStatus(''), 5000);
                return;
            }

            const authHeaders = {
                'Content-Type': 'application/json',
                'X-Admin-Password': getStoredAdminPassword()
            };
            const [settingsRes, campaignsRes] = await Promise.all([
                fetch(`${API}/api/automation-settings`, {
                    method: 'POST', headers: authHeaders,
                    body: JSON.stringify(config)
                }),
                fetch(`${API}/api/campaigns/save-all`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ campaigns: Array.isArray(campaigns) ? campaigns : [] })
                })
            ]);
            if (settingsRes.ok && campaignsRes.ok) {
                setSaveStatus('✓ Live');
                setLastSavedConfig(config);
                setHasUnsavedChanges(false);
            } else {
                const body = await settingsRes.json().catch(() => ({}));
                setSaveStatus(settingsRes.status === 401 ? '✗ Unauthorized' : `✗ ${body?.error || 'Failed'}`);
            }
        } catch (error) { setSaveStatus(`✗ ${error.message || 'Backend unavailable'}`); }
        setTimeout(() => setSaveStatus(''), 5000);
    };

    const persistAutomationSettings = async (nextConfig, { quiet = false } = {}) => {
        if (!quiet) setSaveStatus('Synchronizing...');
        const response = await fetch(`${API}/api/automation-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Password': getStoredAdminPassword()
            },
            body: JSON.stringify(nextConfig)
        });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(response.status === 401 ? 'Unauthorized' : body?.error || 'Failed to save automation settings');
        }
        setLastSavedConfig(nextConfig);
        setHasUnsavedChanges(false);
        if (!quiet) {
            setSaveStatus('✓ Saved');
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    const updateFlow = (id, updates, options = {}) => {
        setHasUnsavedChanges(true);
        if (activeView === 'campaigns') {
            setCampaigns(prev => (Array.isArray(prev) ? prev : []).map(c => c.id === id ? { ...c, ...updates } : c));
            return;
        } else {
            const nextConfig = {
                ...config,
                flows: (Array.isArray(config.flows) ? config.flows : []).map(f => f.id === id ? { ...f, ...updates } : f)
            };
            setConfig(nextConfig);
            if (options.autoSave) {
                persistAutomationSettings(nextConfig)
                    .catch(error => {
                        setSaveStatus(`✗ ${error.message || 'Save failed'}`);
                        setTimeout(() => setSaveStatus(''), 5000);
                    });
            }
            return;
        }
    };

    const updateFlowTemplateOverrides = (id, updates, options = {}) => {
        const existing = flowsList.find(flow => flow.id === id)?.templateOverrides || {};
        updateFlow(id, { templateOverrides: { ...existing, ...updates } }, options);
    };

    const saveFlowTemplateOverrides = async () => {
        if (!currentFlow) return;
        setTemplateUploadStatus('Saving trigger template...');
        try {
            await persistAutomationSettings(config, { quiet: true });
            setTemplateUploadStatus('✓ Trigger template saved');
        } catch (error) {
            setTemplateUploadStatus(`✗ ${error.message || 'Save failed'}`);
        }
        setTimeout(() => setTemplateUploadStatus(''), 6000);
    };

    const cancelFlowTemplateOverrides = () => {
        if (!currentFlow) return;
        const savedFlow = (Array.isArray(lastSavedConfig.flows) ? lastSavedConfig.flows : []).find(flow => flow.id === currentFlow.id);
        const savedOverrides = savedFlow?.templateOverrides || {};
        const nextConfig = {
            ...config,
            flows: (Array.isArray(config.flows) ? config.flows : []).map(flow =>
                flow.id === currentFlow.id ? { ...flow, templateOverrides: savedOverrides } : flow
            )
        };
        setConfig(nextConfig);
        setHasUnsavedChanges(JSON.stringify(nextConfig) !== JSON.stringify(lastSavedConfig));
        setTemplateUploadStatus('Trigger template changes cancelled');
        setTimeout(() => setTemplateUploadStatus(''), 4000);
    };

    const handleFlowTemplateImageUpload = async (e, key) => {
        const file = e.target.files?.[0];
        if (!file || !activeFlowId) return;
        setTemplateUploadStatus('Uploading image...');
        try {
            const result = await uploadFile(file, { keyPrefix: 'emails' });
            if (result.success && result.url) {
                updateFlowTemplateOverrides(activeFlowId, { [key]: result.url });
                setTemplateUploadStatus('✓ Image uploaded. Save trigger to keep it.');
            } else {
                setTemplateUploadStatus(`✗ ${result.error || 'Upload failed'}`);
            }
        } catch (err) {
            console.error('Flow Template Image Upload Error:', err);
            setTemplateUploadStatus(`✗ ${err.message || 'Upload failed'}`);
        }
        setTimeout(() => setTemplateUploadStatus(''), 6000);
    };

    const createCustomFlow = () => {
        const timestamp = Date.now();
        const flow = normalizeFlow({
            id: `custom_${timestamp}`,
            name: 'New Custom Trigger',
            trigger: `onCustom${timestamp}`,
            icon: '',
            active: false,
            status: 'draft',
            deliveryMode: 'architect_html',
            subject_en: 'New custom trigger',
            subject_he: 'טריגר מותאם חדש',
            body_en: 'Hello {{name}},\n\nYour custom automation is ready.',
            body_he: 'שלום {{name}},\n\nהאוטומציה המותאמת מוכנה.',
        });
        const nextConfig = {
            ...config,
            flows: [...(Array.isArray(config.flows) ? config.flows : []), flow],
        };
        setConfig(nextConfig);
        setSaveStatus('Saving draft...');
        persistAutomationSettings(nextConfig, { quiet: true })
            .then(() => setSaveStatus('✓ Draft saved'))
            .catch(error => {
                setHasUnsavedChanges(true);
                setSaveStatus(`✗ ${error.message || 'Save failed'}`);
            })
            .finally(() => setTimeout(() => setSaveStatus(''), 5000));
        setActiveFlowId(flow.id);
        setActiveFlowTrigger(flow.trigger);
        setTimeout(() => editorPanelRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 100);
    };

    const deleteFlow = async (flow) => {
        if (!flow?.id) return;
        const defaultFlow = isDefaultFlow(flow);
        const message = defaultFlow
            ? 'This is a built-in trigger. Delete is not recommended because it will be recreated by the defaults. Use Draft instead.'
            : `Delete "${flow.name || flow.id}"? This removes it from Email Architect.`;
        if (defaultFlow) {
            alert(message);
            return;
        }
        if (!confirm(message)) return;

        const nextConfig = {
            ...config,
            flows: (Array.isArray(config.flows) ? config.flows : []).filter(f => f.id !== flow.id),
        };
        setConfig(nextConfig);
        setActiveFlowId(null);
        setActiveFlowTrigger(null);
        setSaveStatus('Deleting...');

        try {
            const response = await fetch(`${API}/api/automation-settings/flows/${encodeURIComponent(flow.id)}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Password': getStoredAdminPassword() }
            });
            const body = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(body?.error || 'Delete failed');
            setSaveStatus('✓ Deleted');
            setLastSavedConfig(nextConfig);
            setHasUnsavedChanges(false);
        } catch (error) {
            setConfig(config);
            setActiveFlowId(flow.id);
            setActiveFlowTrigger(flow.trigger || null);
            setSaveStatus(`✗ ${error.message || 'Delete failed'}`);
            setHasUnsavedChanges(true);
        }
        setTimeout(() => setSaveStatus(''), 5000);
    };

    const improveWithAI = async () => {
        if (!aiPrompt && !aiGoal) return;
        setAiChat(prev => [...prev, { role: 'user', content: aiPrompt || `Improve with goal: ${aiGoal}` }]);
        setAiLoading(true);
        setPendingAiText(null);
        const textKey = editorLang === 'he' ? 'body_he' : 'body_en';
        const textToImprove = (currentFlow && (currentFlow[textKey] || currentFlow.body)) || '';
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
            const d = await r.json().catch(() => ({}));
            if (d.text && typeof d.text === 'string') {
                setAiChat(prev => [...prev, { role: 'ai', content: "I've refined the copy. Use Apply below to paste it into the body.", suggestedResult: d.text }]);
                setPendingAiText(d.text);
            } else if (!r.ok) {
                setAiChat(prev => [...prev, { role: 'ai', content: d.error || `Request failed (${r.status}). Check GEMINI_API_KEY in .env for AI.` }]);
            } else {
                setAiChat(prev => [...prev, { role: 'ai', content: "No text returned. Try again or add a goal/prompt." }]);
            }
        } catch (e) {
            setAiChat(prev => [...prev, { role: 'ai', content: `Error: ${e.message || 'Network or server error'}. Is the backend running?` }]);
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
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Password': getStoredAdminPassword()
                },
                body: JSON.stringify({ email: testEmail, flowId: activeFlowId, language: editorLang })
            });
            const d = await r.json().catch(() => ({}));
            if (d.success) setTestStatus('✅ Sent!');
            else throw new Error(d.error || (r.status ? `HTTP ${r.status}` : 'Failed'));
        } catch (e) {
            const msg = e.message || 'Send failed';
            setTestStatus(`❌ ${msg}`);
            if (msg.toLowerCase().includes('app password')) setTestStatus(`❌ ${msg} (Check Automation → SMTP)`);
        }
        setTimeout(() => setTestStatus(''), 10000);
    };

    const checkSmtpStatus = async () => {
        setSmtpTestStatus('Checking...');
        try {
            const r = await fetch(`${API}/api/smtp-check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Password': getStoredAdminPassword()
                },
                body: JSON.stringify(config.smtp || {})
            });
            const d = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(d?.error || 'SMTP check failed');
            setSmtpTestStatus(d.connected || d.success ? 'Connected' : d.message || 'Not connected');
        } catch (error) {
            setSmtpTestStatus(error.message || 'SMTP check failed');
        }
    };

    const checkBrevoStatus = async () => {
        setBrevoTestStatus('Checking...');
        try {
            const r = await fetch(`${API}/api/providers/status`, {
                headers: { 'X-Admin-Password': getStoredAdminPassword() }
            });
            const d = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(d?.error || 'Brevo check failed');
            setBrevoTestStatus(d?.brevo?.connected ? 'Connected' : d?.brevo?.message || 'Not connected');
        } catch (error) {
            setBrevoTestStatus(error.message || 'Brevo check failed');
        }
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
        try {
            const result = await uploadFile(file, { keyPrefix: 'emails' });
            if (result.success && result.url) {
                insertAtCursor(`\n<img src="${result.url}" width="100%" style="border-radius:12px;" />\n`);
            }
        } catch (err) { console.error('Image Upload Error:', err); }
    };

    const createCampaign = async () => {
        const name = prompt('Campaign Name:', 'Spring Newsletter 2026');
        if (!name) return;
        const segment = prompt('Target Segment (all / physical / video / newsletter):', 'all');
        try {
            const resp = await fetch(`${API}/api/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name, 
                    segment: segment || 'all',
                    subject_en: 'Edit Subject...', 
                    subject_he: 'ערוך נושא...',
                    body_en: 'Edit content below, then click Synchronize and Launch.', 
                    body_he: 'ערוך את התוכן למטה, ואז לחץ Synchronize ו-Launch.',
                    sentToCount: 0,
                    openCount: 0,
                    clickCount: 0,
                    status: 'draft'
                })
            });
            const data = await resp.json();
            if (data.success && data.campaign) {
                setCampaigns(prev => [...(Array.isArray(prev) ? prev : []), data.campaign]);
                setActiveView('campaigns');
                setActiveFlowId(data.campaign.id);
                setActiveFlowTrigger(null);
            } else {
                alert(data.error || 'Failed to create campaign');
            }
        } catch (e) {
            alert('Connection error. Is the backend running?');
        }
    };

    const handleSignatureUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const result = await uploadFile(file, { keyPrefix: 'emails' });
            if (result.success && result.url) {
                setConfig(prev => ({ ...prev, globalStyling: { ...prev.globalStyling, signatureUrl: result.url } }));
            }
        } catch (err) { console.error('Signature Upload Error:', err); }
    };

    const handleTemplateImageUpload = async (e, key) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setTemplateUploadStatus('Uploading image...');
        try {
            const result = await uploadFile(file, { keyPrefix: 'emails' });
            if (result.success && result.url) {
                const nextConfig = {
                    ...config,
                    globalStyling: normalizeGlobalStyling({ ...config.globalStyling, [key]: result.url })
                };
                setConfig(nextConfig);
                await persistAutomationSettings(nextConfig, { quiet: true });
                setTemplateUploadStatus('✓ Image uploaded');
            } else {
                setTemplateUploadStatus(`✗ ${result.error || 'Upload failed'}`);
            }
        } catch (err) {
            console.error('Template Image Upload Error:', err);
            setTemplateUploadStatus(`✗ ${err.message || 'Upload failed'}`);
        }
        setTimeout(() => setTemplateUploadStatus(''), 6000);
    };

    const updateGlobalStyling = (updates) => {
        setConfig(prev => ({ ...prev, globalStyling: normalizeGlobalStyling({ ...prev.globalStyling, ...updates }) }));
        setHasUnsavedChanges(true);
    };

    // ── derived ─────────────────────────────────────────────────────────────
    const flowsList = Array.isArray(config?.flows) ? config.flows : [];
    const triggerKey = (t) => (t || '').toLowerCase();
    const currentFlow =
        flowsList.find(f => f.id === activeFlowId) ||
        (Array.isArray(campaigns) ? campaigns : []).find(c => c.id === activeFlowId) ||
        (activeView === 'flows' && activeFlowTrigger
            ? flowsList.find(f => triggerKey(f.trigger) === triggerKey(activeFlowTrigger))
            : null);
    const lastSavedFlow = currentFlow
        ? (Array.isArray(lastSavedConfig.flows) ? lastSavedConfig.flows : []).find(flow => flow.id === currentFlow.id)
        : null;
    const templateOverridesDirty = Boolean(
        activeView === 'flows' &&
        currentFlow &&
        JSON.stringify(currentFlow.templateOverrides || {}) !== JSON.stringify(lastSavedFlow?.templateOverrides || {})
    );
    const safeQueue = Array.isArray(queue) ? queue : [];
    const safeEngagement = Array.isArray(engagementLog) ? engagementLog : [];
    const sentCount = safeQueue.filter(q => q.status === 'sent').length;
    const pendingCount = safeQueue.filter(q => q.status === 'pending').length;
    const failedCount = safeQueue.filter(q => q.status === 'failed').length;
    const opens = safeEngagement.filter(e => e.type === 'open').length;
    const clicks = safeEngagement.filter(e => e.type === 'click').length;
    const openRate = sentCount > 0 ? Math.round((opens / sentCount) * 100) : 0;
    const ctr = opens > 0 ? Math.round((clicks / opens) * 100) : 0;

    // ── Error / Loading ──────────────────────────────────────────────────────
    if (error) return (
        <div className="h-full flex items-center justify-center p-10">
            <div className="bg-red-50 border border-red-100 rounded-[2rem] p-10 max-w-md text-center shadow-xl">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-black text-red-700 tracking-tight mb-2">Engine Offline</h3>
                <p className="text-xs text-red-400 font-mono mb-2">{error}</p>
                <p className="text-[10px] text-gray-500 mb-6">בפיתוח: הרץ <code className="bg-gray-200 px-1 rounded">npm run dev:admin</code> (גם Vite וגם השרת). בפרודקשן וודא ש-admin-server רץ.</p>
                <button onClick={fetchAll} className="bg-red-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg">
                    Reconnect
                </button>
            </div>
        </div>
    );

    // ── Main render (config is always set: default first, then server data from fetchAll) ──────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full bg-[#f8f9fc] overflow-hidden font-sans">
            {/* OFFLINE BANNER */}
            {backendOffline && (
                <div className="bg-amber-50 border-b border-amber-200 px-8 py-3 flex items-center justify-between shrink-0">
                    <p className="text-xs text-amber-800 font-bold">
                        השרת לא זמין — מוצג תוכן מקומי. הרץ <code className="bg-amber-200 px-1 rounded">npm run dev:admin</code> ולחץ נסה שוב כדי לטעון את המיילים והעיצובים השמורים.
                    </p>
                    <button onClick={fetchAll} className="bg-amber-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700">
                        נסה שוב
                    </button>
                </div>
            )}
            {/* TOP BAR */}
            <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-5">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
                            HBM Architect
                            <span className="text-[8px] bg-gradient-to-r from-purple-600 to-pink-500 text-white px-2 py-0.5 rounded-full font-black">ULTIMATE</span>
                        </h2>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                            {flowsList.length + (Array.isArray(campaigns) ? campaigns.length : 0)} paths · {(Array.isArray(registrations) ? registrations : []).length} leads · {(Array.isArray(suppressionList) ? suppressionList : []).length} opted out
                        </p>
                    </div>
                    <nav className="flex gap-0.5 p-1 bg-gray-100 rounded-xl">
                        {[
                            { id: 'flows', icon: Zap, label: 'Flows' },
                            { id: 'campaigns', icon: Send, label: 'Campaigns' },
                            { id: 'crm', icon: Users, label: 'CRM' },
                            { id: 'analytics', icon: BarChart3, label: 'Stats' },
                            { id: 'defaults', icon: Layers, label: 'Defaults' },
                            { id: 'settings', icon: Settings, label: 'Setup' },
                        ].map(({ id, icon: Icon, label }) => (
                            <button key={id} onClick={() => { setActiveView(id); setActiveFlowId(null); setActiveFlowTrigger(null); }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === id ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
                                <Icon className="w-3 h-3" />{label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <BackendBadge />
                    <ProviderBadge />
                    <SmtpBadge config={config} />
                    {hasUnsavedChanges && !saveStatus && <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest animate-pulse">Unsaved changes</span>}
                    {saveStatus && <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest animate-pulse">{saveStatus}</span>}
                    <button onClick={handleSave} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all flex items-center gap-2 shadow-lg">
                        <Save className="w-3.5 h-3.5" /> Synchronize
                    </button>
                </div>
            </div>

            {/* FLOWS VIEW */}
            {activeView === 'flows' && !activeFlowId && (
                <div className="flex-1 p-10 overflow-y-auto">
                    <div className="flex items-start justify-between gap-4 mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-2">Engagement Triggers</h3>
                            <p className="text-xs text-gray-500">לחץ על כרטיס לעריכת נושא וגוף המייל שנשלח אוטומטית מהמערכת. אירוע פיזי = רישום באירוע בעולם האמיתי. אירוע וידאו = רישום לאירוע וידאו.</p>
                        </div>
                        <button onClick={createCustomFlow} className="bg-purple-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl flex items-center gap-2 shrink-0">
                            <PlusCircle className="w-4 h-4" /> New Trigger
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
                        {flowsList.map((flow) => {
                            const df = getFlowDefinition(flow);
                            const deliveryMeta = getDeliveryMeta(flow);
                            const isDraft = flow.status === 'draft';
                            const Icon = getFlowIcon(flow, df);
                            const openEditor = () => {
                                setActiveFlowId(flow.id);
                                setActiveFlowTrigger(flow.trigger || null);
                                setTimeout(() => editorPanelRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 100);
                            };
                            return (
                                <div key={flow.id || flow.trigger}
                                    role="button"
                                    tabIndex={0}
                                    onClick={openEditor}
                                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEditor(); } }}
                                    className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer overflow-hidden group">
                                    <div className="p-8 pb-6 flex items-start justify-between border-b border-gray-50 bg-gray-50/50">
                                        <div className="bg-purple-100 w-12 h-12 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isDraft ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {isDraft ? 'Draft' : 'Published'}
                                            </span>
                                            <Toggle checked={flow.active} onChange={(e) => { e.stopPropagation(); updateFlow(flow.id, { active: !flow.active }, { autoSave: true }); }} />
                                        </div>
                                    </div>
                                    <div className="p-8 pt-6">
                                        <h4 className="text-lg font-black text-gray-900 tracking-tight mb-2">{flow.name || df.name}</h4>
                                        <p className="text-xs text-gray-400 font-bold mb-2">{df.desc}</p>
                                        <div className={`mt-4 mb-3 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${deliveryMeta.card}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${deliveryMeta.dot}`} />
                                            <span>{isDraft ? `Draft · ${deliveryMeta.shortLabel}` : flow.active ? deliveryMeta.shortLabel : `Off · ${deliveryMeta.shortLabel}`}</span>
                                        </div>
                                        <p className="text-[9px] text-gray-400 font-bold leading-relaxed mb-2">
                                            {isDraft ? 'Draft triggers are saved in Email Architect but will not run from HBM.' : flow.active ? deliveryMeta.description : 'Trigger is off in HBM; Brevo can still own automations after contact sync if configured in Brevo.'}
                                        </p>
                                        <button type="button" onClick={e => { e.stopPropagation(); openEditor(); }} className="w-full mt-3 py-3 rounded-xl bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all flex items-center justify-center gap-2">
                                            <Edit3 className="w-4 h-4" /> ערוך נושא וגוף המייל
                                        </button>
                                        <div className="flex items-center gap-2 mt-4">
                                            <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono truncate">on_{(flow.trigger || df.trigger || '').replace(/^on/i, '')}</span>
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
                                            <button onClick={() => { setActiveFlowId(c.id); setActiveFlowTrigger(null); setTimeout(() => editorPanelRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 100); }} className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-[9px] font-black uppercase hover:bg-black transition flex items-center justify-center gap-1.5">
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
                <div ref={editorPanelRef} className="flex flex-1 overflow-y-auto gap-0 bg-white min-h-0">
                    <div className="flex-1 p-8 space-y-6 overflow-y-auto min-w-0 border-r border-gray-100 rounded-tl-3xl shadow-[-10px_0_20px_rgba(0,0,0,0.02)] relative bg-[#f8f9fc]">
                        
                        {/* Editor Header */}
                        <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                            <div className="flex items-center gap-4">
                                <button onClick={() => { setActiveFlowId(null); setActiveFlowTrigger(null); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors" title="Back to triggers">
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

                        {activeView === 'flows' && (
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4">Trigger Identity</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                                        <input
                                            value={currentFlow.name || ''}
                                            onChange={e => updateFlow(activeFlowId, { name: e.target.value })}
                                            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Card Icon</label>
                                        <IconPicker
                                            value={currentFlow.icon || ''}
                                            onChange={icon => updateFlow(activeFlowId, { icon }, { autoSave: true })}
                                        />
                                        <p className="mt-2 text-[8px] text-gray-400 font-bold uppercase tracking-wide">
                                            Auto uses the default icon for predefined triggers.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Trigger Key</label>
                                        <input
                                            value={currentFlow.trigger || ''}
                                            onChange={e => updateFlow(activeFlowId, { trigger: e.target.value })}
                                            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-mono font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20"
                                        />
                                        <p className="mt-2 text-[8px] text-gray-400 font-bold uppercase tracking-wide">Must match a backend trigger event to run automatically.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeView === 'flows' && (
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Publish State</label>
                                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                                            Draft keeps the trigger saved for editing. Published allows it to run when the trigger is also switched on.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${currentFlow.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {currentFlow.status === 'draft' ? 'Draft' : 'Published'}
                                        </span>
                                        <Toggle
                                            checked={currentFlow.status !== 'draft'}
                                            onChange={() => updateFlow(activeFlowId, { status: currentFlow.status === 'draft' ? 'published' : 'draft' }, { autoSave: true })}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4 mt-5 pt-5 border-t border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                                        Delete is available for custom triggers. Built-in triggers should be moved to Draft when they are not ready.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => deleteFlow(currentFlow)}
                                        disabled={isDefaultFlow(currentFlow)}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isDefaultFlow(currentFlow) ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete Trigger
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeView === 'flows' && (
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Delivery Provider Mode</label>
                                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                                            Choose who owns this trigger. Brevo automation only syncs the contact and lets Brevo send its own automation.
                                        </p>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-purple-50 text-purple-600">
                                        {currentFlow.deliveryMode || 'architect_html'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'architect_html', title: 'Email Architect', desc: 'Use this editor and send rendered HTML.' },
                                        { id: 'brevo_template', title: 'Brevo Template', desc: 'Send through Brevo using template ID.' },
                                        { id: 'brevo_automation', title: 'Brevo Automation', desc: 'No local email; Brevo automation owns send.' },
                                    ].map(mode => (
                                        <button
                                            key={mode.id}
                                            type="button"
                                            onClick={() => updateFlow(activeFlowId, { deliveryMode: mode.id }, { autoSave: true })}
                                            className={`text-left rounded-2xl border p-4 transition-all ${currentFlow.deliveryMode === mode.id || (!currentFlow.deliveryMode && mode.id === 'architect_html') ? 'border-purple-300 bg-purple-50 text-purple-700 shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-white'}`}
                                        >
                                            <div className="text-[10px] font-black uppercase tracking-widest">{mode.title}</div>
                                            <div className="text-[9px] font-bold mt-1 leading-relaxed">{mode.desc}</div>
                                        </button>
                                    ))}
                                </div>
                                {currentFlow.deliveryMode === 'brevo_template' && (
                                    <div className="grid grid-cols-3 gap-3 mt-4">
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Default Template ID</label>
                                            <input value={currentFlow.brevoTemplateId || ''} onChange={e => updateFlow(activeFlowId, { brevoTemplateId: e.target.value })} placeholder="123" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20" />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">English Template ID</label>
                                            <input value={currentFlow.brevoTemplateIdEn || ''} onChange={e => updateFlow(activeFlowId, { brevoTemplateIdEn: e.target.value })} placeholder="optional" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20" />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Hebrew Template ID</label>
                                            <input value={currentFlow.brevoTemplateIdHe || ''} onChange={e => updateFlow(activeFlowId, { brevoTemplateIdHe: e.target.value })} placeholder="optional" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20" />
                                        </div>
                                    </div>
                                )}
                                {currentFlow.deliveryMode === 'brevo_automation' && (
                                    <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-100 p-4 text-[10px] font-bold text-amber-700 leading-relaxed">
                                        This flow will not queue or send an Email Architect template. The registration/newsletter contact is synced to Brevo, and Brevo automations/templates should send the email.
                                    </div>
                                )}
                            </div>
                        )}

                        {activeView === 'flows' && (
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Template Header & Footer</label>
                                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                                            Inherit defaults, hide sections for this trigger, or override copy/colors. Brevo templates receive these values as params; Brevo automation must mirror them inside Brevo.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${templateOverridesDirty ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'}`}>
                                            {templateOverridesDirty ? 'Pending' : Object.keys(currentFlow.templateOverrides || {}).length ? 'Custom' : 'Defaults'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={cancelFlowTemplateOverrides}
                                            disabled={!templateOverridesDirty}
                                            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${templateOverridesDirty ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={saveFlowTemplateOverrides}
                                            disabled={!templateOverridesDirty}
                                            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${templateOverridesDirty ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm' : 'bg-purple-50 text-purple-200 cursor-not-allowed'}`}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {templateUploadStatus && (
                                        <div className={`col-span-2 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest ${templateUploadStatus.startsWith('✗') ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600'}`}>
                                            {templateUploadStatus}
                                        </div>
                                    )}
                                    <label className="flex items-center justify-between gap-4 bg-gray-50 rounded-xl px-4 py-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Use Header</span>
                                        <Toggle checked={(currentFlow.templateOverrides?.useDefaultHeader ?? config.globalStyling?.useDefaultHeader) !== false} onChange={() => updateFlowTemplateOverrides(activeFlowId, { useDefaultHeader: (currentFlow.templateOverrides?.useDefaultHeader ?? config.globalStyling?.useDefaultHeader) === false })} />
                                    </label>
                                    <label className="flex items-center justify-between gap-4 bg-gray-50 rounded-xl px-4 py-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Use Footer</span>
                                        <Toggle checked={(currentFlow.templateOverrides?.useDefaultFooter ?? config.globalStyling?.useDefaultFooter) !== false} onChange={() => updateFlowTemplateOverrides(activeFlowId, { useDefaultFooter: (currentFlow.templateOverrides?.useDefaultFooter ?? config.globalStyling?.useDefaultFooter) === false })} />
                                    </label>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Override Header Title</label>
                                        <input value={currentFlow.templateOverrides?.headerTitle || ''} onChange={e => updateFlowTemplateOverrides(activeFlowId, { headerTitle: e.target.value })} placeholder={config.globalStyling?.headerTitle || 'Default title'} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20 placeholder:text-gray-300" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Override Header Subtitle</label>
                                        <input value={currentFlow.templateOverrides?.headerSubtitle || ''} onChange={e => updateFlowTemplateOverrides(activeFlowId, { headerSubtitle: e.target.value })} placeholder={config.globalStyling?.headerSubtitle || 'Default subtitle'} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20 placeholder:text-gray-300" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Header Image Override</label>
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                                            {currentFlow.templateOverrides?.headerImageUrl ? <img src={resolveAssetUrl(currentFlow.templateOverrides.headerImageUrl)} className="h-9 w-12 object-contain rounded-lg bg-white p-1" /> : <div className="h-9 w-12 rounded-lg bg-white text-gray-300 flex items-center justify-center"><ImageIcon className="w-4 h-4" /></div>}
                                            <label className="ml-auto bg-purple-600 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase cursor-pointer">Upload<input type="file" className="hidden" accept="image/*" onChange={e => handleFlowTemplateImageUpload(e, 'headerImageUrl')} /></label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Footer Image Override</label>
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                                            {currentFlow.templateOverrides?.footerImageUrl ? <img src={resolveAssetUrl(currentFlow.templateOverrides.footerImageUrl)} className="h-9 w-12 object-contain rounded-lg" /> : <div className="h-9 w-12 rounded-lg bg-white text-gray-300 flex items-center justify-center"><ImageIcon className="w-4 h-4" /></div>}
                                            <label className="ml-auto bg-purple-600 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase cursor-pointer">Upload<input type="file" className="hidden" accept="image/*" onChange={e => handleFlowTemplateImageUpload(e, 'footerImageUrl')} /></label>
                                        </div>
                                    </div>
                                    <ColorModeControl
                                        label="Header Background Override"
                                        prefix="header"
                                        values={{ ...config.globalStyling, ...(currentFlow.templateOverrides || {}) }}
                                        onChange={updates => updateFlowTemplateOverrides(activeFlowId, updates)}
                                        fallbackFlat={config.globalStyling?.headerBackgroundColor || config.globalStyling?.primaryColor || '#6160AB'}
                                        fallbackTo={config.globalStyling?.headerGradientTo || config.globalStyling?.secondaryColor || '#F07B3C'}
                                    />
                                    <ColorModeControl
                                        label="Header Text Override"
                                        prefix="header"
                                        tone="Text"
                                        values={{ ...config.globalStyling, ...(currentFlow.templateOverrides || {}) }}
                                        onChange={updates => updateFlowTemplateOverrides(activeFlowId, updates)}
                                        fallbackFlat={config.globalStyling?.headerTextColor || '#ffffff'}
                                        fallbackTo={config.globalStyling?.headerTextGradientTo || '#F7D5FF'}
                                    />
                                    <ColorModeControl
                                        label="Footer Background Override"
                                        prefix="footer"
                                        values={{ ...config.globalStyling, ...(currentFlow.templateOverrides || {}) }}
                                        onChange={updates => updateFlowTemplateOverrides(activeFlowId, updates)}
                                        fallbackFlat={config.globalStyling?.footerBackgroundColor || '#fafafc'}
                                        fallbackTo={config.globalStyling?.footerGradientTo || config.globalStyling?.secondaryColor || '#F07B3C'}
                                    />
                                    <ColorModeControl
                                        label="Footer Text Override"
                                        prefix="footer"
                                        tone="Text"
                                        values={{ ...config.globalStyling, ...(currentFlow.templateOverrides || {}) }}
                                        onChange={updates => updateFlowTemplateOverrides(activeFlowId, updates)}
                                        fallbackFlat={config.globalStyling?.footerTextColor || '#a0a0b0'}
                                        fallbackTo={config.globalStyling?.footerTextGradientTo || config.globalStyling?.secondaryColor || '#F07B3C'}
                                    />
                                    <div className="col-span-2">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Override Footer Text</label>
                                        <textarea value={currentFlow.templateOverrides?.footerText || ''} onChange={e => updateFlowTemplateOverrides(activeFlowId, { footerText: e.target.value })} rows={3} placeholder="Leave empty to inherit default footer text" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20 resize-none placeholder:text-gray-300" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Unsubscribe Label Override</label>
                                        <input value={currentFlow.templateOverrides?.unsubscribeLabel || ''} onChange={e => updateFlowTemplateOverrides(activeFlowId, { unsubscribeLabel: e.target.value })} placeholder={config.globalStyling?.unsubscribeLabel || 'Default unsubscribe label'} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20 placeholder:text-gray-300" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Unsubscribe URL Override</label>
                                        <input value={currentFlow.templateOverrides?.unsubscribeUrl || ''} onChange={e => updateFlowTemplateOverrides(activeFlowId, { unsubscribeUrl: e.target.value })} placeholder="Default unsubscribe endpoint" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20 placeholder:text-gray-300" />
                                    </div>
                                </div>
                                {currentFlow.deliveryMode === 'brevo_template' && (
                                    <div className="mt-4 rounded-2xl bg-violet-50 border border-violet-100 p-4 text-[10px] font-bold text-violet-700 leading-relaxed">
                                        Brevo templates can include params such as <span className="font-mono">{"{{ params.headerHtml }}"}</span>, <span className="font-mono">{"{{ params.footerHtml }}"}</span>, <span className="font-mono">{"{{ params.bodyHtml }}"}</span>, and <span className="font-mono">{"{{ params.unsubscribeUrl }}"}</span>.
                                    </div>
                                )}
                                {currentFlow.deliveryMode === 'brevo_automation' && (
                                    <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-100 p-4 text-[10px] font-bold text-amber-700 leading-relaxed">
                                        Brevo automation sends its own email. Use this panel as the HBM reference, then mirror the same header/footer inside the Brevo automation template.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Subject Input */}
                        <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative ${currentFlow.deliveryMode === 'brevo_automation' ? 'opacity-50' : ''}`}>
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">{editorLang === 'he' ? 'שורת נושא' : 'Subject Line'}</label>
                            <input
                                value={editorLang === 'he' ? currentFlow.subject_he : currentFlow.subject_en || currentFlow.subject || ''}
                                onChange={e => updateFlow(activeFlowId, { [editorLang === 'he' ? 'subject_he' : 'subject_en']: e.target.value })}
                                disabled={currentFlow.deliveryMode === 'brevo_automation'}
                                dir={editorLang === 'he' ? 'rtl' : 'ltr'}
                                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                            />
                        </div>

                        {/* Body Input */}
                        <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm ${currentFlow.deliveryMode === 'brevo_automation' ? 'opacity-50' : ''}`}>
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
                                disabled={currentFlow.deliveryMode === 'brevo_automation'}
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
                                    {pendingAiText && (
                                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] text-white/90">Refined copy ready →</span>
                                            <button type="button" onClick={() => { const key = editorLang === 'he' ? 'body_he' : 'body_en'; updateFlow(activeFlowId, { [key]: pendingAiText }); setPendingAiText(null); }} className="bg-white text-purple-700 px-3 py-1.5 rounded-lg font-black text-[9px] uppercase">Apply to body</button>
                                            <button type="button" onClick={() => setPendingAiText(null)} className="text-white/80 hover:text-white text-[9px] font-bold">Dismiss</button>
                                        </div>
                                    )}
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
                                    {(Array.isArray(registrations) ? registrations : [])
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
                                            const isUnsub = (Array.isArray(suppressionList) ? suppressionList : []).includes(r.email);
                                            const engSteps = safeEngagement.filter(e => e.email === r.email).length;
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
                            <KpiCard icon={Database} label="Growth Index" value={(Array.isArray(registrations) ? registrations : []).length} color="green" sub={`+${(Array.isArray(registrations) ? registrations : []).filter(r => new Date(r.date) > new Date(Date.now() - 7*24*60*60*1000)).length} this week`} />
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

                {/* DEFAULTS VIEW */}
                {activeView === 'defaults' && (
                    <div className="h-full p-10 overflow-y-auto">
                        <div className="max-w-6xl mx-auto grid grid-cols-[1fr_320px] gap-8">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">Template Defaults</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reusable header, footer, colors, images, and unsubscribe controls for Email Architect templates</p>
                                    {templateUploadStatus && <p className={`text-[10px] font-black uppercase tracking-widest mt-3 ${templateUploadStatus.startsWith('✗') ? 'text-red-500' : 'text-purple-600'}`}>{templateUploadStatus}</p>}
                                </div>

                                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 space-y-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className="font-black text-gray-900 text-base">Default Header</h4>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1">Used by local Email Architect sends and exposed to Brevo templates as params.</p>
                                        </div>
                                        <Toggle checked={config.globalStyling?.useDefaultHeader !== false} onChange={() => updateGlobalStyling({ useDefaultHeader: config.globalStyling?.useDefaultHeader === false })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Header Mode</label>
                                            <select value={config.globalStyling?.headerMode || 'gradient'} onChange={e => updateGlobalStyling({ headerMode: e.target.value })} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none">
                                                <option value="gradient">Gradient / Color</option>
                                                <option value="image">Image Background</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Header Image</label>
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                                                {config.globalStyling?.headerImageUrl ? <img src={resolveAssetUrl(config.globalStyling.headerImageUrl)} className="h-9 w-12 object-contain rounded-lg bg-white p-1" /> : <div className="h-9 w-12 rounded-lg bg-white text-gray-300 flex items-center justify-center"><ImageIcon className="w-4 h-4" /></div>}
                                                <label className="ml-auto bg-purple-600 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase cursor-pointer">Upload<input type="file" className="hidden" accept="image/*" onChange={e => handleTemplateImageUpload(e, 'headerImageUrl')} /></label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Header Title</label>
                                            <input value={config.globalStyling?.headerTitle || ''} onChange={e => updateGlobalStyling({ headerTitle: e.target.value })} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20" />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Header Subtitle</label>
                                            <input value={config.globalStyling?.headerSubtitle || ''} onChange={e => updateGlobalStyling({ headerSubtitle: e.target.value })} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20" />
                                        </div>
                                        <ColorModeControl
                                            label="Header Background"
                                            prefix="header"
                                            values={config.globalStyling}
                                            onChange={updateGlobalStyling}
                                            fallbackFlat={config.globalStyling?.primaryColor || '#6160AB'}
                                            fallbackTo={config.globalStyling?.secondaryColor || '#F07B3C'}
                                        />
                                        <ColorModeControl
                                            label="Header Text"
                                            prefix="header"
                                            tone="Text"
                                            values={config.globalStyling}
                                            onChange={updateGlobalStyling}
                                            fallbackFlat="#ffffff"
                                            fallbackTo="#F7D5FF"
                                        />
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 space-y-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className="font-black text-gray-900 text-base">Default Footer</h4>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1">Controls footer copy, footer image, and unsubscribe label/link.</p>
                                        </div>
                                        <Toggle checked={config.globalStyling?.useDefaultFooter !== false} onChange={() => updateGlobalStyling({ useDefaultFooter: config.globalStyling?.useDefaultFooter === false })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Footer Image</label>
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                                                {config.globalStyling?.footerImageUrl ? <img src={resolveAssetUrl(config.globalStyling.footerImageUrl)} className="h-9 w-12 object-contain rounded-lg" /> : <div className="h-9 w-12 rounded-lg bg-white text-gray-300 flex items-center justify-center"><ImageIcon className="w-4 h-4" /></div>}
                                                <label className="ml-auto bg-purple-600 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase cursor-pointer">Upload<input type="file" className="hidden" accept="image/*" onChange={e => handleTemplateImageUpload(e, 'footerImageUrl')} /></label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Unsubscribe Label</label>
                                            <input value={config.globalStyling?.unsubscribeLabel || ''} onChange={e => updateGlobalStyling({ unsubscribeLabel: e.target.value })} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Unsubscribe URL Override</label>
                                            <input value={config.globalStyling?.unsubscribeUrl || ''} onChange={e => updateGlobalStyling({ unsubscribeUrl: e.target.value })} placeholder="Leave empty to use the local unsubscribe endpoint" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20 placeholder:text-gray-300" />
                                        </div>
                                        <ColorModeControl
                                            label="Footer Background"
                                            prefix="footer"
                                            values={config.globalStyling}
                                            onChange={updateGlobalStyling}
                                            fallbackFlat="#fafafc"
                                            fallbackTo={config.globalStyling?.secondaryColor || '#F07B3C'}
                                        />
                                        <ColorModeControl
                                            label="Footer Text"
                                            prefix="footer"
                                            tone="Text"
                                            values={config.globalStyling}
                                            onChange={updateGlobalStyling}
                                            fallbackFlat="#a0a0b0"
                                            fallbackTo={config.globalStyling?.secondaryColor || '#F07B3C'}
                                        />
                                        <div className="col-span-2">
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Footer Text / HTML</label>
                                            <textarea value={config.globalStyling?.footerText || ''} onChange={e => updateGlobalStyling({ footerText: e.target.value })} rows={4} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20 resize-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sticky top-6 self-start bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Defaults Preview</p>
                                        <h4 className="font-black text-gray-900">Sample Email</h4>
                                    </div>
                                    <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                                        <button onClick={() => setEditorLang('en')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${editorLang === 'en' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}>EN</button>
                                        <button onClick={() => setEditorLang('he')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${editorLang === 'he' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}>HE</button>
                                    </div>
                                </div>
                                <EmailPreview
                                    flow={{
                                        subject_en: 'Welcome to The HBM',
                                        subject_he: 'ברוכים הבאים ל-HBM',
                                        body_en: 'Hello {{name}},\n\nThis preview uses your default header and footer settings.',
                                        body_he: 'שלום {{name}},\n\nתצוגה זו משתמשת בהגדרות ברירת המחדל של הכותרת והתחתית.',
                                    }}
                                    config={config}
                                    device="mobile"
                                    activeLang={editorLang}
                                />
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

                            <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-xl text-[10px] text-purple-800">
                                <strong>רישום לאירוע:</strong> כל נרשם נשמר אוטומטית ב-CRM. כדי שהנרשם <em>יקבל מייל</em> — בטאב Flows הפעל (Toggle) את &quot;Physical Event Reg&quot; או &quot;Video Event Reg&quot;, ערוך טקסט/נושא אם צריך, לחץ Synchronize, והגדר SMTP למטה.
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
                                            config.smtp?.host && config.smtp?.user && config.smtp?.pass ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${config.smtp?.host && config.smtp?.user && config.smtp?.pass ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                            {config.smtp?.host && config.smtp?.user && config.smtp?.pass ? 'Configured' : 'Incomplete'}
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
                                    <button type="button" onClick={checkSmtpStatus} className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black">
                                        Test SMTP Status
                                    </button>
                                    {smtpTestStatus && <p className="text-[10px] font-bold text-gray-500">{smtpTestStatus}</p>}
                                </div>

                                {/* Brevo Config */}
                                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 space-y-5">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center">
                                            <Radio className="w-5 h-5 text-violet-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-base">Brevo Provider</h4>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">API, templates, and automations</p>
                                        </div>
                                        <div className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                            config.providerConfig?.brevoConfigured ? 'bg-violet-50 text-violet-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${config.providerConfig?.brevoConfigured ? 'bg-violet-500' : 'bg-amber-500 animate-pulse'}`} />
                                            {config.providerConfig?.brevoConfigured ? 'Configured' : 'Not Set'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Provider</label>
                                            <select value={config.providerConfig?.emailProvider || 'smtp'} onChange={e => setConfig(prev => ({ ...prev, providerConfig: { ...DEFAULT_PROVIDER_CONFIG, ...prev.providerConfig, emailProvider: e.target.value } }))} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none">
                                                <option value="smtp">SMTP</option>
                                                <option value="brevo">Brevo</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Brevo API URL</label>
                                            <input value={config.providerConfig?.brevoApiUrl || ''} onChange={e => setConfig(prev => ({ ...prev, providerConfig: { ...DEFAULT_PROVIDER_CONFIG, ...prev.providerConfig, brevoApiUrl: e.target.value } }))} placeholder="https://api.brevo.com/v3" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Brevo API Key Override</label>
                                        <input type="password" value={config.providerConfig?.brevoApiKey || ''} onChange={e => setConfig(prev => ({ ...prev, providerConfig: { ...DEFAULT_PROVIDER_CONFIG, ...prev.providerConfig, brevoApiKey: e.target.value } }))} placeholder={config.providerConfig?.brevoApiKeyMasked || 'Use env BREVO_API_KEY'} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20" />
                                        <p className="text-[9px] text-gray-400 mt-2 font-bold">Current key source: {config.providerConfig?.brevoApiKeySource || 'none'}. Leave empty to keep the existing env/database key.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Sender Name</label>
                                            <input value={config.providerConfig?.brevoSenderName || ''} onChange={e => setConfig(prev => ({ ...prev, providerConfig: { ...DEFAULT_PROVIDER_CONFIG, ...prev.providerConfig, brevoSenderName: e.target.value } }))} placeholder="The HBM" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20" />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Sender Email</label>
                                            <input value={config.providerConfig?.brevoSenderEmail || ''} onChange={e => setConfig(prev => ({ ...prev, providerConfig: { ...DEFAULT_PROVIDER_CONFIG, ...prev.providerConfig, brevoSenderEmail: e.target.value } }))} placeholder="office@thehbm.org" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-purple-500/20" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl bg-violet-50 border border-violet-100 p-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-violet-700">Allow Brevo Automation Mode</p>
                                            <p className="text-[9px] font-bold text-violet-500">Flow-level Brevo automation choices rely on contact sync/list attributes in Brevo.</p>
                                        </div>
                                        <Toggle checked={Boolean(config.providerConfig?.brevoAutomationEnabled)} onChange={() => setConfig(prev => ({ ...prev, providerConfig: { ...DEFAULT_PROVIDER_CONFIG, ...prev.providerConfig, brevoAutomationEnabled: !prev.providerConfig?.brevoAutomationEnabled } }))} />
                                    </div>
                                    <button type="button" onClick={checkBrevoStatus} className="w-full bg-violet-600 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700">
                                        Test Brevo Status
                                    </button>
                                    {brevoTestStatus && <p className="text-[10px] font-bold text-gray-500">{brevoTestStatus}</p>}
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
