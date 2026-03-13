import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart3, Eye, MousePointer, TrendingUp, Users, Clock,
    RefreshCw, Activity, Zap, Monitor, Flame, Radio, Globe, ArrowUpRight,
    MapPin, Cookie, Video
} from 'lucide-react';
import { getApiBase, getSiteUrl, joinUrl } from '../../utils/api';
import { CLARITY_ID } from '../../utils/admin-analytics';

const ANALYTICS_URL = 'https://analytics.google.com/analytics/web/#/a375882937p514067129/reports/intelligenthome';
const GA_REPORTS = 'https://analytics.google.com/analytics/web/#/a375882937p514067129/reports/explorer';
const buildClarityUrl = (path) => `https://clarity.microsoft.com/projects/view/${CLARITY_ID}/${path}`;
const CLARITY_URL = buildClarityUrl('gettingstarted');
const CLARITY_HEATMAP_URL = buildClarityUrl('heatmaps');
const CLARITY_RECORDINGS_URL = buildClarityUrl('recordings');
const CLARITY_INSIGHTS_URL = buildClarityUrl('insights');
const CLARITY_DASHBOARD_URL = buildClarityUrl('dashboard');
const SITE_SITEMAP_URL = joinUrl(getSiteUrl(), "/sitemap.xml");
const SITE_VISUAL_SITEMAP_URL = joinUrl(getSiteUrl(), "/visual-sitemap.html");

const LIVE_REFRESH_MS = 30_000; // 30 seconds

const StatCard = ({ icon: Icon, label, value, sub, color, trend, href }) => {
    const content = (
        <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend != null && (
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${trend > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
                {sub && sub.startsWith('Live') && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                    </span>
                )}
            </div>
            <div className="mt-auto">
                <p className="text-3xl font-black text-gray-900 tracking-tighter">{value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{label}</p>
                {sub && <p className="text-xs text-gray-400 mt-1 font-medium">{sub}</p>}
                {href && (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900">
                        Open <ArrowUpRight className="w-3 h-3" />
                    </a>
                )}
            </div>
        </div>
    );
    if (href) return <div className="block h-full">{content}</div>;
    return content;
};

const PlatformCard = ({ title, subtitle, url, icon: Icon, color, description, tags, linkItems }) => (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
        <div className={`h-3 w-full ${color}`} />
        <div className="p-8">
            <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${color.replace('bg-', 'bg-').replace('gradient-to-r', 'gradient-to-br')} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tighter">{title}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{subtitle}</p>
                    </div>
                </div>
                <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors shadow-sm">
                    Open <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
            </div>
            <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6">{description}</p>
            <div className="flex flex-wrap gap-2 mb-6">
                {tags.map(tag => (
                    <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">{tag}</span>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
                {linkItems.map(({ href, icon: LinkIcon, label, labelColor }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-3 ${labelColor} rounded-xl hover:opacity-90 transition-colors group/link`}>
                        <LinkIcon className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                    </a>
                ))}
            </div>
        </div>
    </div>
);

export default function AnalyticsDashboard({ onOpenCookieLogs }) {
    const [registrations, setRegistrations] = useState([]);
    const [lastSynced, setLastSynced] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRegistrations = useCallback(() => {
        setRefreshing(true);
        const base = getApiBase();
        fetch(`${base}/api/registrations`)
            .then(res => res.json())
            .then(data => {
                setRegistrations(Array.isArray(data) ? data : []);
                setLastSynced(new Date());
            })
            .catch(() => setRegistrations([]))
            .finally(() => setRefreshing(false));
    }, []);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    useEffect(() => {
        const t = setInterval(fetchRegistrations, LIVE_REFRESH_MS);
        return () => clearInterval(t);
    }, [fetchRegistrations]);

    const embedUrls = { ga: ANALYTICS_URL, clarity: CLARITY_URL, heatmap: CLARITY_HEATMAP_URL, recordings: CLARITY_RECORDINGS_URL };
    const openLink = (type) => window.open(embedUrls[type], '_blank');

    const kpiCards = [
        { icon: Users, label: 'Monthly Visitors', value: 'GA4', sub: 'View in dashboard', color: 'bg-blue-50 text-blue-500', trend: null, href: ANALYTICS_URL },
        { icon: Eye, label: 'Page Views', value: 'GA4', sub: 'View in dashboard', color: 'bg-violet-50 text-violet-500', trend: null, href: GA_REPORTS },
        { icon: MousePointer, label: 'Click Rate', value: 'Clarity', sub: 'View in dashboard', color: 'bg-orange-50 text-orange-500', trend: null, href: CLARITY_DASHBOARD_URL },
        { icon: Clock, label: 'Avg Session', value: 'GA4', sub: 'View in dashboard', color: 'bg-emerald-50 text-emerald-500', trend: null, href: ANALYTICS_URL },
        { icon: Globe, label: 'Countries', value: 'GA4', sub: 'View in dashboard', color: 'bg-pink-50 text-pink-500', trend: null, href: ANALYTICS_URL },
        { icon: TrendingUp, label: 'Registrations', value: registrations.length ?? '-', sub: 'Live CRM data', color: 'bg-indigo-50 text-indigo-500', trend: registrations.length > 0 ? 10 : null, href: null },
    ];

    return (
        <div className="h-full overflow-y-auto bg-[#0f172a]">
            {/* Enterprise header strip */}
            <div className="sticky top-0 z-10 bg-[#0f172a] border-b border-white/10 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tighter">Data Command Center</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live sync · GA4 · Clarity · CRM · Cookie logs</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {lastSynced && (
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                            Last synced {lastSynced.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={fetchRegistrations}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                    </div>
                </div>
            </div>

            <div className="p-8 bg-slate-50/80 min-h-full">
                {/* Where to see what — איפה רואים מה */}
                <div className="mb-10 rounded-[2rem] border border-slate-200 bg-white shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-5">
                        <h3 className="text-lg font-black text-white tracking-tighter flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-amber-400" />
                            Where to see what · איפה רואים כל נתון
                        </h3>
                        <p className="text-xs text-slate-300 mt-1">All data sources and live sync from one place.</p>
                    </div>
                    {/* Clarification: links open Clarity in browser; data appears after site traffic with consent */}
                    <div className="px-8 pb-4">
                        <div className="flex flex-wrap items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <span className="text-amber-600 font-black text-sm">💡</span>
                            <div className="text-sm text-amber-900">
                                <strong>Heatmaps &amp; Session Recordings</strong> — הלינקים פותחים את <strong>clarity.microsoft.com</strong> בטאב חדש (לא צילום מסך). אם אתה רואה &quot;Getting Started&quot; / &quot;ALMOST THERE&quot;: Clarity עדיין לא קיבל ביקורים. <strong>גלוש באתר הציבורי</strong> (פורט 4200 או האתר החי), <strong>אשר cookies (Accept)</strong>, דפדף בין דפים — אחרי עד כשעתיים יופיעו Heatmaps והקלטות.
                            </div>
                        </div>
                    </div>
                    <div className="p-8 grid md:grid-cols-3 gap-6">
                        <div className="flex gap-4 p-5 bg-orange-50 rounded-2xl border border-orange-100">
                            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
                                <Flame className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest">Heatmaps</h4>
                                <p className="text-xs text-gray-600 mt-1">Where users click, scroll, and focus. Visual heat layers per page.</p>
                                <a href={CLARITY_HEATMAP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-[10px] font-black uppercase text-orange-600 hover:text-orange-700">
                                    Open Clarity Heatmaps (opens clarity.microsoft.com) <ArrowUpRight className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                        <div className="flex gap-4 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                                <Cookie className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest">Cookie data</h4>
                                <p className="text-xs text-gray-600 mt-1">Consent choices (Accept / Decline / Custom), timestamp, anonymized IP. Synced live in admin.</p>
                                {typeof onOpenCookieLogs === 'function' ? (
                                    <button type="button" onClick={onOpenCookieLogs} className="inline-flex items-center gap-1 mt-2 text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 underline">
                                        → מעבר לטאב COOKIE LOGS באדמין
                                    </button>
                                ) : (
                                    <span className="inline-block mt-2 text-[10px] font-black uppercase text-blue-600">→ COOKIE LOGS tab in this admin</span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-4 p-5 bg-red-50 rounded-2xl border border-red-100">
                            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center shrink-0">
                                <Video className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest">Per-user: scroll & click</h4>
                                <p className="text-xs text-gray-600 mt-1">Session recordings: every scroll, click, and move per visitor. Rage clicks, dead clicks, insights.</p>
                                <a href={CLARITY_RECORDINGS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-[10px] font-black uppercase text-red-600 hover:text-red-700">
                                    Open Session Recordings (opens clarity.microsoft.com) <ArrowUpRight className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                    {kpiCards.map((card, i) => (
                        <StatCard key={i} {...card} />
                    ))}
                </div>

                {/* Quick launch */}
                <div className="flex flex-wrap gap-3 mb-10">
                    {[
                        { key: 'ga', label: 'Google Analytics 4', icon: BarChart3, color: 'bg-blue-600 hover:bg-blue-700' },
                        { key: 'heatmap', label: 'Heatmaps', icon: Flame, color: 'bg-orange-500 hover:bg-orange-600' },
                        { key: 'recordings', label: 'Session Recordings', icon: Radio, color: 'bg-red-500 hover:bg-red-600' },
                        { key: 'clarity', label: 'Clarity Dashboard', icon: Eye, color: 'bg-purple-600 hover:bg-purple-700' },
                    ].map(btn => (
                        <button
                            key={btn.key}
                            onClick={() => openLink(btn.key)}
                            className={`flex items-center gap-2.5 px-6 py-3 ${btn.color} text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
                        >
                            <btn.icon className="w-4 h-4" />
                            {btn.label} <ArrowUpRight className="w-4 h-4 opacity-50" />
                        </button>
                    ))}
                </div>

                {/* Platform cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <PlatformCard
                        title="Google Analytics"
                        subtitle="GA4 · Property 514067129"
                        url={ANALYTICS_URL}
                        icon={BarChart3}
                        color="bg-gradient-to-r from-[#4285F4] to-[#34A853]"
                        description="Track user journeys, acquisition channels, conversions, and real-time traffic. Deep dive into audience behavior and funnel performance across all HBM pages."
                        tags={['Real-Time', 'Funnels', 'Audiences', 'Conversions', 'GA4']}
                        linkItems={[
                            { href: 'https://analytics.google.com/analytics/web/#/a375882937p514067129/reports/reportinghub?params=_u..nav%3Dmaui', icon: Users, label: 'Audience', labelColor: 'bg-blue-50 text-blue-700' },
                            { href: GA_REPORTS, icon: BarChart3, label: 'Reports', labelColor: 'bg-indigo-50 text-indigo-700' },
                            { href: 'https://analytics.google.com/analytics/web/#/a375882937p514067129/reports/lifecycle/traffic-acquisition:overview', icon: TrendingUp, label: 'Acquisition', labelColor: 'bg-violet-50 text-violet-700' },
                            { href: 'https://analytics.google.com/analytics/web/#/a375882937p514067129/reports/lifecycle/engagement-overview', icon: Activity, label: 'Engagement', labelColor: 'bg-pink-50 text-pink-700' },
                        ]}
                    />
                    <PlatformCard
                        title="Microsoft Clarity"
                        subtitle={`Project ${CLARITY_ID} · AI-Powered`}
                        url={CLARITY_URL}
                        icon={Flame}
                        color="bg-gradient-to-r from-[#F25022] to-[#7FBA00]"
                        description="Visualize exactly where users click, scroll, and rage-click via heatmaps. Watch session recordings to identify UX friction points and drop-offs across the site."
                        tags={['Heatmaps', 'Recordings', 'Rage Clicks', 'Dead Clicks', 'AI Insights']}
                        linkItems={[
                            { href: CLARITY_HEATMAP_URL, icon: Flame, label: 'Heatmaps', labelColor: 'bg-orange-50 text-orange-700' },
                            { href: CLARITY_RECORDINGS_URL, icon: Radio, label: 'Recordings', labelColor: 'bg-red-50 text-red-700' },
                            { href: CLARITY_INSIGHTS_URL, icon: Zap, label: 'AI Insights', labelColor: 'bg-purple-50 text-purple-700' },
                            { href: CLARITY_DASHBOARD_URL, icon: Monitor, label: 'Dashboard', labelColor: 'bg-teal-50 text-teal-700' },
                        ]}
                    />
                </div>

                {/* Sitemap & SEO */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mb-10">
                    <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <div className="p-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                                <Globe className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900">Sitemap & SEO</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">היטמאפ של האתר</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">ה-sitemap (XML) וה־visual sitemap שייכים לאתר הציבורי. לעדכון: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">npm run generate-sitemap</code></p>
                        <div className="flex flex-wrap gap-3">
                            <a href={SITE_SITEMAP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700">
                                <Globe className="w-4 h-4" /> Open sitemap.xml
                            </a>
                            <a href={SITE_VISUAL_SITEMAP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-200">
                                <MapPin className="w-4 h-4" /> Visual sitemap
                            </a>
                        </div>
                    </div>
                </div>

                {/* Connections tip */}
                <div className="bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 rounded-[2rem] p-8">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center shrink-0">
                            <Zap className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 mb-2 text-base">Connections · חיבורים</h4>
                            <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                <strong>GA4:</strong> This dashboard links to the shared GA property and does not require a runtime admin env key. <strong>Clarity:</strong> Set <code className="bg-slate-200 px-1 rounded text-xs">VITE_CLARITY_ID</code> in the admin env if you want these deep links to open the correct Clarity project directly. Cookie data and registrations sync live in this admin.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
