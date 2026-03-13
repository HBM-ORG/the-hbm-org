/**
 * HBM Enterprise Analytics Service
 *
 * - GA4 (Google Analytics 4)
 * - Microsoft Clarity (Heatmaps, Session Recordings) — loaded in separate chunk via analytics-clarity.js
 * - Facebook Pixel (Meta Ads)
 * - LinkedIn Insight Tag
 */

export const GA_ID = import.meta.env.VITE_GA_ID || "";
export const CLARITY_ID = import.meta.env.VITE_CLARITY_ID || "";
export const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID || "";

const isValid = (id) => id && id.length > 0 && !String(id).includes('XXXXX');

/** Load Clarity in a separate chunk so main bundle stays small */
const loadClarityModule = (consent) =>
  import('./analytics-clarity.js').then((m) => m.loadClarity(consent));

/**
 * Global initialization with Consent Mode v2
 */
export const initAnalytics = () => {
    if (typeof window === 'undefined') return;
    // gtag may already be defined by index.html (Google tag snippet)
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
        function gtag(){window.dataLayer.push(arguments);}
        window.gtag = gtag;
    }

    // 1. Consent Mode v2 Defaults (Deny everything by default)
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
    if (consent?.analytics) {
        loadGoogleAnalytics();
        loadClarityModule(consent);
    }
    if (consent?.marketing) {
        loadMetaPixel();
        loadLinkedInInsight();
    }

    window.dataLayer.push({
        'event': 'hbm_init',
        'platform_version': '4.0.0',
        'environment': 'production'
    });

    if (import.meta.env.DEV) {
        console.log("🦅 HBM Global Analytics: Initialization Complete (Respecting Consent)");
    }
};

const loadGoogleAnalytics = () => {
    if (window.gtag_loaded || !isValid(GA_ID)) return;
    // Script already in index.html; just send config (after consent)
    if (typeof window.gtag === 'function') {
        window.gtag('config', GA_ID, { send_page_view: true });
    }
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
 * updateConsent - Call when user accepts or changes cookie preferences (cookie‑professional)
 */
export const updateConsent = (consent) => {
    if (window.gtag) {
        window.gtag('consent', 'update', {
            'ad_storage': consent.marketing ? 'granted' : 'denied',
            'ad_user_data': consent.marketing ? 'granted' : 'denied',
            'ad_personalization': consent.marketing ? 'granted' : 'denied',
            'analytics_storage': consent.analytics ? 'granted' : 'denied'
        });
    }
    if (consent.analytics) {
        loadGoogleAnalytics();
        loadClarityModule(consent);
    } else {
        import('./analytics-clarity.js').then((m) => m.revokeClarityConsent?.()).catch(() => {});
    }
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

    // Clarity: custom event (shows in Recordings/Heatmaps filters) — only if already loaded
    if (isValid(CLARITY_ID) && window.clarity) {
        try {
            window.clarity('set', actionName, JSON.stringify(params));
        } catch (_) {}
    }

    // Data Layer for Advanced Tracking
    if (window.dataLayer) {
        window.dataLayer.push({
            'event': actionName,
            ...params
        });
    }

    if (import.meta.env.DEV) {
        console.log(`🎯 ENTERPRISE DATA CAPTURED: [${actionName}]`, params);
    }
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
