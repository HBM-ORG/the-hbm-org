/**
 * HBM Enterprise Analytics Service
 *
 * - GA4 (Google Analytics 4)
 * - Microsoft Clarity (Heatmaps, Session Recordings)
 * - Facebook Pixel (Meta Ads)
 */

export const GA_ID = import.meta.env.VITE_GA_ID || "";
export const CLARITY_ID = import.meta.env.VITE_CLARITY_ID || "";
export const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID || "";

const isValid = (id) => {
  const value = String(id || "").trim();
  if (!value) return false;
  if (value.includes("XXXXX")) return false;
  if (value.startsWith("your-")) return false;
  if (["null", "undefined", "false", "0"].includes(value.toLowerCase())) return false;
  return true;
};

const loadClarityModule = (consent) =>
  import("./analytics-clarity.js").then((module) => module.loadClarity(consent));

export const initAnalytics = () => {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
  }

  const savedConsent = localStorage.getItem("hbm_cookie_consent");
  const consent = savedConsent ? JSON.parse(savedConsent) : null;

  gtag("consent", "default", {
    ad_storage: consent?.marketing ? "granted" : "denied",
    ad_user_data: consent?.marketing ? "granted" : "denied",
    ad_personalization: consent?.marketing ? "granted" : "denied",
    analytics_storage: consent?.analytics ? "granted" : "denied",
    wait_for_update: 500,
  });

  if (consent?.analytics) {
    loadGoogleAnalytics();
    loadClarityModule(consent);
  }
  if (consent?.marketing) {
    loadMetaPixel();
  }

  window.dataLayer.push({
    event: "hbm_init",
    platform_version: "4.0.0",
    environment: "production",
  });

  if (import.meta.env.DEV) {
    console.log(
      "HBM Global Analytics: Initialization Complete (Respecting Consent)",
    );
  }
};

const loadGoogleAnalytics = () => {
  if (window.gtag_loaded || !isValid(GA_ID)) return;
  if (!window.gtag_script_loaded) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(script);
    window.gtag_script_loaded = true;
  }
  if (typeof window.gtag === "function") {
    window.gtag("config", GA_ID, { send_page_view: true });
  }
  window.gtag_loaded = true;
};

const loadMetaPixel = () => {
  if (window.fbq_loaded || !isValid(FB_PIXEL_ID)) return;
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      if (n.callMethod) {
        n.callMethod.apply(n, arguments);
      } else {
        n.queue.push(arguments);
      }
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  window.fbq("init", FB_PIXEL_ID);
  window.fbq_loaded = true;
};

export const updateConsent = (consent) => {
  if (window.gtag) {
    window.gtag("consent", "update", {
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied",
      analytics_storage: consent.analytics ? "granted" : "denied",
    });
  }

  if (consent.analytics) {
    loadGoogleAnalytics();
    loadClarityModule(consent);
  } else {
    import("./analytics-clarity.js")
      .then((module) => module.revokeClarityConsent?.())
      .catch(() => {});
  }

  if (consent.marketing) {
    loadMetaPixel();
  }

  localStorage.setItem("hbm_cookie_consent", JSON.stringify(consent));
};

export const trackPageView = (path) => {
  const savedConsent = localStorage.getItem("hbm_cookie_consent");
  const consent = savedConsent ? JSON.parse(savedConsent) : null;

  if (consent?.analytics && window.gtag && isValid(GA_ID)) {
    window.gtag("config", GA_ID, { page_path: path });
  }

  if (consent?.marketing && window.fbq && isValid(FB_PIXEL_ID)) {
    window.fbq("track", "PageView");
  }
};

export const trackEvent = (actionName, params = {}) => {
  if (window.gtag && isValid(GA_ID)) {
    window.gtag("event", actionName, params);
  }

  if (window.fbq && isValid(FB_PIXEL_ID)) {
    const fbEvent =
      actionName === "registration_complete"
        ? "CompleteRegistration"
        : "CustomEvent";
    window.fbq("track", fbEvent, params);
  }

  if (isValid(CLARITY_ID) && window.clarity) {
    try {
      window.clarity("set", actionName, JSON.stringify(params));
    } catch {}
  }

  if (window.dataLayer) {
    window.dataLayer.push({
      event: actionName,
      ...params,
    });
  }

  if (import.meta.env.DEV) {
    console.log(`HBM analytics event: [${actionName}]`, params);
  }
};

export const hbmAnalytics = {
  recordRegStart: (eventId, eventName) => {
    trackEvent("registration_start", {
      event_id: eventId,
      event_name: eventName,
      step: 1,
    });
  },
  recordRegComplete: (eventId, eventName, source) => {
    trackEvent("registration_complete", {
      event_id: eventId,
      event_name: eventName,
      purchase_source: source,
      currency: "ILS",
      value: 0.0,
    });
  },
  recordMediaView: (mediaType, mediaName) => {
    trackEvent("media_engagement", { type: mediaType, name: mediaName });
  },
  recordOutboundLink: (destination) => {
    trackEvent("outbound_click", { target: destination });
  },
};
