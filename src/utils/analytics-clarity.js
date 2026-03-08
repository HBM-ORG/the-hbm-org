/**
 * Microsoft Clarity — loaded in a separate chunk so main bundle stays small.
 * Only loaded when analytics is initialized and user has consented.
 */
import Clarity from '@microsoft/clarity';

export const CLARITY_ID = import.meta.env.VITE_CLARITY_ID || "vjvlklwjdb";

const isValid = (id) => id && id.length > 0 && !String(id).includes('XXXXX');

export const loadClarity = (consent = null) => {
  if (typeof window === 'undefined') return;
  if (window.clarity_loaded || !isValid(CLARITY_ID)) return;
  try {
    Clarity.init(CLARITY_ID);
    const analyticsGranted = consent?.analytics ?? (() => {
      try {
        const s = localStorage.getItem('hbm_cookie_consent');
        return s ? JSON.parse(s).analytics : false;
      } catch (_) { return false; }
    })();
    const marketingGranted = consent?.marketing ?? (() => {
      try {
        const s = localStorage.getItem('hbm_cookie_consent');
        return s ? JSON.parse(s).marketing : false;
      } catch (_) { return false; }
    })();
    if (typeof Clarity.consentV2 === 'function') {
      Clarity.consentV2({
        analytics_Storage: analyticsGranted ? 'granted' : 'denied',
        ad_Storage: marketingGranted ? 'granted' : 'denied',
      });
    } else if (typeof Clarity.consent === 'function') {
      Clarity.consent(!!analyticsGranted);
    }
  } catch (e) {
    console.warn('Clarity init/consent:', e);
  }
  window.clarity_loaded = true;
};

export const revokeClarityConsent = () => {
  if (window.clarity_loaded && typeof Clarity?.consentV2 === 'function') {
    Clarity.consentV2({ analytics_Storage: 'denied', ad_Storage: 'denied' });
  }
};
