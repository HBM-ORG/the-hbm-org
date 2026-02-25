import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Shield, ShieldAlert, ShieldCheck, Clock, Hash } from 'lucide-react';

const CookieConsentLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
        fetch(`${base}/api/cookie-consent-logs`)
            .then(res => res.json())
            .then(data => {
                setLogs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch logs", err);
                setLoading(false);
            });
    }, []);

    const getChoiceBadge = (choice) => {
        switch(choice) {
            case 'accept_all': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold ring-1 ring-green-200">ACCEPT ALL</span>;
            case 'decline_all': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold ring-1 ring-red-200">DECLINE ALL</span>;
            default: return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold ring-1 ring-blue-200">CUSTOM</span>;
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading transparency logs...</div>;

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-hbm-purple" />
                    <h3 className="font-black text-hbm-dark uppercase tracking-wider">Cookie Compliance Logs (2026)</h3>
                </div>
                <div className="text-xs text-gray-400 font-medium">Last 100 choices logged</div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-[10px] uppercase tracking-widest text-gray-400 font-black bg-gray-50/30">
                        <tr>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Choice</th>
                            <th className="px-6 py-4">Detailed Settings</th>
                            <th className="px-6 py-4">Anonymized IP (Hash)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {logs.map((log) => {
                            const settings = JSON.parse(log.settings);
                            return (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getChoiceBadge(log.choice)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {settings.essential && <ShieldCheck className="w-4 h-4 text-green-500" title="Essential" />}
                                            {settings.analytics ? <ShieldCheck className="w-4 h-4 text-blue-500" title="Analytics" /> : <ShieldAlert className="w-4 h-4 text-gray-300" />}
                                            {settings.marketing ? <ShieldCheck className="w-4 h-4 text-red-500" title="Marketing" /> : <ShieldAlert className="w-4 h-4 text-gray-300" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 font-mono text-[10px] text-gray-400">
                                            <Hash className="w-3 h-3" />
                                            {log.hashedIp.substring(0, 16)}...
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">No consent logs recorded yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CookieConsentLogs;
