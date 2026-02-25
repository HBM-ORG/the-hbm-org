import React, { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, ShieldCheck, PieChart, Target, ArrowLeft } from 'lucide-react';
import { updateConsent } from '../../utils/analytics';

const CookieConsent = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showWidget, setShowWidget] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({
        essential: true,
        analytics: true,
        marketing: true
    });

    useEffect(() => {
        const consent = localStorage.getItem('hbm_cookie_consent');
        if (!consent) {
            const timer = setTimeout(() => setIsOpen(true), 2000);
            return () => clearTimeout(timer);
        } else {
            try {
                const savedSettings = JSON.parse(consent);
                setSettings(savedSettings);
            } catch (e) {
                console.error("Failed to parse cookie consent", e);
            }
        }
    }, []);

    const logConsent = async (choice, finalSettings) => {
        try {
            const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
            await fetch(`${base}/api/cookie-consent-log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ choice, settings: finalSettings })
            });
        } catch (err) {
            console.error('Failed to log consent', err);
        }
    };

    const handleAcceptAll = () => {
        const allIn = { essential: true, analytics: true, marketing: true };
        setSettings(allIn);
        updateConsent(allIn);
        logConsent('accept_all', allIn);
        setIsOpen(false);
    };

    const handleDeclineAll = () => {
        const minimal = { essential: true, analytics: false, marketing: false };
        setSettings(minimal);
        updateConsent(minimal);
        logConsent('decline_all', minimal);
        setIsOpen(false);
    };

    const handleSaveSettings = () => {
        updateConsent(settings);
        logConsent('custom', settings);
        setIsOpen(false);
        setShowSettings(false);
    };

    return (
        <>
            {/* 1. The Drawer */}
            <Drawer.Root open={isOpen} onOpenChange={setIsOpen} dismissible={false}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999]" />
                    <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[1000] flex flex-col items-center outline-none">
                        <div className="w-full max-w-2xl bg-white border-t border-x border-gray-100 rounded-t-[40px] p-8 md:p-10 shadow-2xl relative">
                            {/* Close Button */}
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-8 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 mb-8 md:mb-10" />
                            
                            {!showSettings ? (
                                <div className="text-center">
                                    <div className="flex justify-center mb-6 md:mb-8">
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-hbm-purple/10 rounded-2xl md:rounded-[2rem] flex items-center justify-center animate-bounce-slow">
                                            <Cookie className="w-8 h-8 md:w-10 md:h-10 text-hbm-purple" />
                                        </div>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 font-['Sora'] text-hbm-dark tracking-tight">We use cookies 🍪</h2>
                                    <p className="text-gray-500 mb-8 md:mb-10 leading-relaxed text-base md:text-lg max-w-lg mx-auto">
                                        We use cookies to enhance your experience and deliver personalized content. You can customize your preferences in settings.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                                        <button 
                                            onClick={handleAcceptAll}
                                            className="px-10 md:px-12 py-4 md:py-6 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] text-white rounded-2xl font-black text-sm md:text-base hover:scale-[1.02] transition-all shadow-2xl shadow-hbm-purple/40 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <ShieldCheck className="w-5 h-5" />
                                            Accept All
                                        </button>
                                        <div className="flex gap-2 sm:gap-4">
                                            <button 
                                                onClick={handleDeclineAll}
                                                className="flex-1 px-6 md:px-8 py-4 md:py-6 bg-white text-gray-400 rounded-2xl font-bold text-xs md:text-sm hover:text-gray-600 transition-all border border-gray-100"
                                            >
                                                Decline
                                            </button>
                                            <button 
                                                onClick={() => setShowSettings(true)}
                                                className="flex-1 px-6 md:px-8 py-4 md:py-6 bg-white text-gray-400 rounded-2xl font-bold text-xs md:text-sm hover:text-gray-600 transition-all border border-gray-100"
                                            >
                                                Settings
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 md:space-y-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black font-['Sora'] text-hbm-dark">Preferences</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">GDPR Compliance 2026</p>
                                        </div>
                                        <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>

                                    {/* Essential */}
                                    <div className="flex items-center justify-between p-4 md:p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <ShieldCheck className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="font-black text-hbm-dark text-sm">Essential Cookies</p>
                                                <p className="text-xs text-gray-500">Required for the website to function.</p>
                                            </div>
                                        </div>
                                        <div className="w-12 h-6 bg-hbm-purple rounded-full relative opacity-50">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                        </div>
                                    </div>

                                    {/* Analytics */}
                                    <div className="flex items-center justify-between p-4 md:p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <PieChart className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="font-black text-hbm-dark text-sm">Analytics</p>
                                                <p className="text-xs text-gray-500">Help us improve the experience.</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setSettings(s => ({...s, analytics: !s.analytics}))}
                                            className={`w-12 h-6 rounded-full relative transition-colors ${settings.analytics ? 'bg-hbm-purple' : 'bg-gray-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.analytics ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {/* Marketing */}
                                    <div className="flex items-center justify-between p-4 md:p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <Target className="w-5 h-5 text-red-600" />
                                            <div>
                                                <p className="font-black text-hbm-dark text-sm">Marketing</p>
                                                <p className="text-xs text-gray-500">Used for relevant advertisements.</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setSettings(s => ({...s, marketing: !s.marketing}))}
                                            className={`w-12 h-6 rounded-full relative transition-colors ${settings.marketing ? 'bg-hbm-purple' : 'bg-gray-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.marketing ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    <button 
                                        onClick={handleSaveSettings}
                                        className="w-full py-4 bg-hbm-dark text-white rounded-2xl font-black"
                                    >
                                        Save Preferences
                                    </button>
                                </div>
                            )}
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </>
    );
};

export default CookieConsent;
