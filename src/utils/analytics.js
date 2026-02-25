/**
 * HBM Enterprise Analytics Service
 * 
 * Supports: 
 * - GA4 (Google Analytics 4)
 * - Microsoft Clarity (Heatmaps & Session Recordings)
 * - Facebook Pixel (Meta Ads)
 * - LinkedIn Insight Tag
 */

export const GA_ID = "G-XXXXXXX"; 
export const CLARITY_ID = "XXXXXXX";
export const FB_PIXEL_ID = "XXXXXXX";

const isValid = (id) => id && !id.includes('XXXXX');

/**
 * Global initialization with Consent Mode v2
 */
export const initAnalytics = () => {
    if (typeof window === 'undefined') return;
    
    // 1. Consent Mode v2 Defaults (Deny everything by default)
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    
    const savedConsent = localStorage.getItem('hbm_cookie_consent');
    const consent = savedConsent ? JSON.parse(savedConsent) : null;

    gtag('consent', 'default', {
        'ad_storage': consent?.marketing ? 'granted' : 'denied',
        'ad_user_data': consent?.marketing ? 'granted' : 'denied',
        'ad_personalization': consent?.marketing ? 'granted' : 'denied',
        'analytics_storage': consent?.analytics ? 'granted' : 'denied',
        'wait_for_update': 500
    });

    // 2. Load scripts if consent already exists
    if (consent?.analytics) loadGoogleAnalytics();
    if (consent?.marketing) {
        loadMetaPixel();
        loadLinkedInInsight();
    }

    window.dataLayer.push({
        'event': 'hbm_init',
        'platform_version': '4.0.0',
        'environment': 'production'
    });

    console.log("🦅 HBM Global Analytics: Initialization Complete (Respecting Consent)");
};

const loadGoogleAnalytics = () => {
    if (window.gtag_loaded || !isValid(GA_ID)) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
    window.gtag_loaded = true;
};

const loadMetaPixel = () => {
    if (window.fbq_loaded || !isValid(FB_PIXEL_ID)) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', FB_PIXEL_ID);
    window.fbq_loaded = true;
};

const loadLinkedInInsight = () => {
    // Implementation for loading LinkedIn if needed
};

/**
 * updateConsent - Call this when user accepts cookies
 */
export const updateConsent = (consent) => {
    if (!window.gtag) return;
    window.gtag('consent', 'update', {
        'ad_storage': consent.marketing ? 'granted' : 'denied',
        'ad_user_data': consent.marketing ? 'granted' : 'denied',
        'ad_personalization': consent.marketing ? 'granted' : 'denied',
        'analytics_storage': consent.analytics ? 'granted' : 'denied'
    });

    if (consent.analytics) loadGoogleAnalytics();
    if (consent.marketing) {
        loadMetaPixel();
        loadLinkedInInsight();
    }
    
    localStorage.setItem('hbm_cookie_consent', JSON.stringify(consent));
};

/**
 * trackPageView - Professional routing tracking
 */
export const trackPageView = (path) => {
    const savedConsent = localStorage.getItem('hbm_cookie_consent');
    const consent = savedConsent ? JSON.parse(savedConsent) : null;

    // Only track if analytics is granted
    if (consent?.analytics) {
        if (window.gtag && isValid(GA_ID)) {
            window.gtag('config', GA_ID, { page_path: path });
        }
    }

    if (consent?.marketing) {
        if (window.fbq && isValid(FB_PIXEL_ID)) {
            window.fbq('track', 'PageView');
        }
    }
};

/**
 * trackEvent - High-level conversion tracking
 */
export const trackEvent = (actionName, params = {}) => {
    // Standard GA4
    if (window.gtag && isValid(GA_ID)) {
        window.gtag('event', actionName, params);
    }

    // FB Pixel Conversion
    if (window.fbq && isValid(FB_PIXEL_ID)) {
        const fbEvent = actionName === 'registration_complete' ? 'CompleteRegistration' : 'CustomEvent';
        window.fbq('track', fbEvent, params);
    }

    // Clarity Tagging
    if (window.clarity && isValid(CLARITY_ID)) {
        window.clarity("set", actionName, JSON.stringify(params));
    }

    // Data Layer for Advanced Tracking
    if (window.dataLayer) {
        window.dataLayer.push({
            'event': actionName,
            ...params
        });
    }

    console.log(`🎯 ENTERPRISE DATA CAPTURED: [${actionName}]`, params);
};

/**
 * Business Intelligence Events
 */
export const hbmAnalytics = {
    // Full User Journey Tracking
    recordRegStart: (eventId, eventName) => {
        trackEvent('registration_start', { 
            event_id: eventId, 
            event_name: eventName,
            step: 1
        });
    },

    recordRegComplete: (eventId, eventName, source) => {
        trackEvent('registration_complete', { 
            event_id: eventId, 
            event_name: eventName,
            purchase_source: source,
            currency: 'ILS',
            value: 0.00 // Adjust if paid events
        });
    },

    recordMediaView: (mediaType, mediaName) => {
        trackEvent('media_engagement', { type: mediaType, name: mediaName });
    },

    recordOutboundLink: (destination) => {
        trackEvent('outbound_click', { target: destination });
    }
};
