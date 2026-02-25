import React from 'react';
import { motion } from 'framer-motion';
import EyebrowBadge from '../components/EyebrowBadge';
import BubbleContainer from '../components/BubbleContainer';

const cookieData = [
    { category: 'Essential', name: 'hbm_session', provider: 'The HBM', purpose: 'Maintains user session state.', expiry: 'Session' },
    { category: 'Essential', name: 'hbm_cookie_consent', provider: 'The HBM', purpose: 'Remembers user cookie preferences.', expiry: '1 Year' },
    { category: 'Analytics', name: '_ga, _ga_*', provider: 'Google Analytics', purpose: 'Distinguishes users and sessions for performance metrics.', expiry: '2 Years' },
    { category: 'Marketing', name: '_fbp', provider: 'Meta Pixel', purpose: 'Tracks conversions and ad campaign performance.', expiry: '3 Months' },
    { category: 'Marketing', name: 'li_sugr, bcookie', provider: 'LinkedIn', purpose: 'Tracks professional audience data for ad targeting.', expiry: '2 Years' },
];

const CookiePolicy = () => {
    return (
        <div className="min-h-screen bg-hbm-cream pt-20 pb-20">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-16">
                    <EyebrowBadge text="PRIVACY & TRANSPARENCY" />
                    <h1 className="text-4xl md:text-7xl font-bold mt-6 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] bg-clip-text text-transparent leading-tight">
                        מדיניות עוגיות (Cookie Policy)
                    </h1>
                </div>

                <BubbleContainer bgColor="white">
                    <div className="p-4 md:p-8">
                        <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                            ב-HBM אנו מחויבים לשקיפות מלאה. הטבלה שלהלן מפרטת את כל העוגיות (Cookies) בהן אנו משתמשים כדי להבטיח שהאתר שלנו פועל בצורה מיטבית ומספק חוויה מותאמת אישית.
                        </p>

                        <div className="overflow-x-auto rounded-2xl border border-gray-100">
                            <table className="w-full text-right" dir="rtl">
                                <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-black">
                                    <tr>
                                        <th className="px-6 py-4">קטגוריה</th>
                                        <th className="px-6 py-4">שם העוגיה</th>
                                        <th className="px-6 py-4">ספק</th>
                                        <th className="px-6 py-4">מטרה</th>
                                        <th className="px-6 py-4">תוקף</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {cookieData.map((cookie, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-hbm-purple text-sm">{cookie.category !== 'Essential' ? (cookie.category === 'Analytics' ? 'אנליטיקה' : 'שיווק') : 'חיוניות'}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{cookie.name}</td>
                                            <td className="px-6 py-4 text-sm font-medium">{cookie.provider}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">{cookie.purpose}</td>
                                            <td className="px-6 py-4 text-xs font-black uppercase text-gray-400">{cookie.expiry}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </BubbleContainer>
            </div>
        </div>
    );
};

export default CookiePolicy;
