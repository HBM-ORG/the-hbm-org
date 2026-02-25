import React, { useState, useEffect } from 'react';
import { 
    BarChart3, Eye, MousePointer, TrendingUp, Users, Clock, 
    ExternalLink, RefreshCw, Activity, Zap, Monitor, Flame,
    ChevronDown, Radio, Globe, ArrowUpRight
} from 'lucide-react';

const ANALYTICS_URL = 'https://analytics.google.com/analytics/web/#/a375882937p514067129/reports/intelligenthome';
const CLARITY_URL = 'https://clarity.microsoft.com/projects/view/vjvlklwjdb/gettingstarted';
const CLARITY_HEATMAP_URL = 'https://clarity.microsoft.com/projects/view/vjvlklwjdb/heatmaps';
const CLARITY_RECORDINGS_URL = 'https://clarity.microsoft.com/projects/view/vjvlklwjdb/recordings';

const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
    <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            {trend && (
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${trend > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <div>
            <p className="text-3xl font-black text-gray-900 tracking-tighter">{value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-1 font-medium">{sub}</p>}
        </div>
    </div>
);

const PlatformCard = ({ title, subtitle, url, icon: Icon, color, description, tags }) => (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
        {/* Header */}
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
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors shadow-sm"
                >
                    Open <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
            </div>

            <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6">{description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
                {tags.map(tag => (
                    <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">{tag}</span>
                ))}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
                {title === 'Google Analytics' && (
                    <>
                        <a href="https://analytics.google.com/analytics/web/#/a375882937p514067129/reports/reportinghub?params=_u..nav%3Dmaui" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group/link">
                            <Users className="w-4 h-4 text-blue-500 group-hover/link:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Audience</span>
                        </a>
                        <a href="https://analytics.google.com/analytics/web/#/a375882937p514067129/reports/explorer" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors group/link">
                            <BarChart3 className="w-4 h-4 text-indigo-500 group-hover/link:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Reports</span>
                        </a>
                        <a href="https://analytics.google.com/analytics/web/#/a375882937p514067129/reports/lifecycle/traffic-acquisition:overview" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors group/link">
                            <TrendingUp className="w-4 h-4 text-violet-500 group-hover/link:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-violet-700">Acquisition</span>
                        </a>
                        <a href="https://analytics.google.com/analytics/web/#/a375882937p514067129/reports/lifecycle/engagement-overview" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors group/link">
                            <Activity className="w-4 h-4 text-pink-500 group-hover/link:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-pink-700">Engagement</span>
                        </a>
                    </>
                )}
                {title === 'Microsoft Clarity' && (
                    <>
                        <a href={CLARITY_HEATMAP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors group/link">
                            <Flame className="w-4 h-4 text-orange-500 group-hover/link:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-700">Heatmaps</span>
                        </a>
                        <a href={CLARITY_RECORDINGS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors group/link">
                            <Radio className="w-4 h-4 text-red-500 group-hover/link:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-700">Recordings</span>
                        </a>
                        <a href="https://clarity.microsoft.com/projects/view/vjvlklwjdb/insights" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group/link">
                            <Zap className="w-4 h-4 text-purple-500 group-hover/link:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-700">AI Insights</span>
                        </a>
                        <a href="https://clarity.microsoft.com/projects/view/vjvlklwjdb/dashboard" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors group/link">
                            <Monitor className="w-4 h-4 text-teal-500 group-hover/link:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">Dashboard</span>
                        </a>
                    </>
                )}
            </div>
        </div>
    </div>
);

export default function AnalyticsDashboard() {
    const [registrations, setRegistrations] = useState([]);
    
    useEffect(() => {
        const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
        fetch(`${base}/api/registrations`)
            .then(res => res.json())
            .then(data => setRegistrations(data))
            .catch(err => console.error("Error fetching CRM data:", err));
    }, []);

    const embedUrls = {
        ga: ANALYTICS_URL,
        clarity: CLARITY_URL,
        heatmap: CLARITY_HEATMAP_URL,
        recordings: CLARITY_RECORDINGS_URL,
    };

    const openLink = (type) => {
        window.open(embedUrls[type], '_blank');
    };

    const kpiCards = [
        { icon: Users, label: 'Monthly Visitors', value: 'API req', sub: 'Needs GA4 setup', color: 'bg-blue-50 text-blue-500', trend: null },
        { icon: Eye, label: 'Page Views', value: 'API req', sub: 'Needs GA4 setup', color: 'bg-violet-50 text-violet-500', trend: null },
        { icon: MousePointer, label: 'Click Rate', value: 'API req', sub: 'Needs Clarity setup', color: 'bg-orange-50 text-orange-500', trend: null },
        { icon: Clock, label: 'Avg Session', value: 'API req', sub: 'Needs GA4 setup', color: 'bg-emerald-50 text-emerald-500', trend: null },
        { icon: Globe, label: 'Countries', value: 'API req', sub: 'Needs GA4 setup', color: 'bg-pink-50 text-pink-500', trend: null },
        { icon: TrendingUp, label: 'Registrations', value: registrations.length || '-', sub: 'Live CRM data', color: 'bg-indigo-50 text-indigo-500', trend: registrations.length > 0 ? 10 : null },
    ];

    return (
        <div className="h-full overflow-y-auto p-8 bg-gray-50/50">

            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Analytics Intelligence</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Real-time insights · Google Analytics 4 + Microsoft Clarity</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Tracking Active
                    </div>
                </div>
            </div>

            {/* KPI Summary Bar */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-10">
                {kpiCards.map((card, i) => (
                    <StatCard key={i} {...card} />
                ))}
            </div>

            {/* Quick Launch Embed Buttons */}
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

            {/* Platform Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
                <PlatformCard 
                    title="Google Analytics"
                    subtitle="GA4 · Property 514067129"
                    url={ANALYTICS_URL}
                    icon={BarChart3}
                    color="bg-gradient-to-r from-[#4285F4] to-[#34A853]"
                    description="Track user journeys, acquisition channels, conversions, and real-time traffic. Deep dive into audience behavior and funnel performance across all HBM pages."
                    tags={['Real-Time', 'Funnels', 'Audiences', 'Conversions', 'GA4']}
                />
                <PlatformCard 
                    title="Microsoft Clarity"
                    subtitle="Project vjvlklwjdb · AI-Powered"
                    url={CLARITY_URL}
                    icon={Flame}
                    color="bg-gradient-to-r from-[#F25022] to-[#7FBA00]"
                    description="Visualize exactly where users click, scroll, and rage-click via heatmaps. Watch session recordings to identify UX friction points and drop-offs across the site."
                    tags={['Heatmaps', 'Recordings', 'Rage Clicks', 'Dead Clicks', 'AI Insights']}
                />
            </div>

            {/* Tip box */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-[2rem] p-8">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 mb-2 text-base">📊 Pro Tip: Analytics + CRM = Full Picture</h4>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                            Combine your CRM registration data (visible in the CRM Database tab) with GA4 acquisition channels and Clarity heatmaps to understand <strong>where leads come from</strong>, <strong>what pages convert</strong>, and <strong>where visitors drop off</strong>. This triple view gives you complete funnel visibility.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
