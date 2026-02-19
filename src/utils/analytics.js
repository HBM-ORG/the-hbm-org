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
 * Global initialization
 */
export const initAnalytics = () => {
    if (typeof window === 'undefined') return;
    
    // Push initial data layer for Google Tag Manager (if used)
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'event': 'hbm_init',
        'platform_version': '4.0.0',
        'environment': 'production'
    });

    console.log("🦅 HBM Global Analytics: Active & Monitoring");
};

/**
 * trackPageView - Professional routing tracking
 */
export const trackPageView = (path) => {
    // 1. GA4
    if (window.gtag && isValid(GA_ID)) {
        window.gtag('config', GA_ID, { page_path: path });
    }

    // 2. FB Pixel
    if (window.fbq && isValid(FB_PIXEL_ID)) {
        window.fbq('track', 'PageView');
    }

    // 3. Clarity Page Discovery (Automatic)
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
