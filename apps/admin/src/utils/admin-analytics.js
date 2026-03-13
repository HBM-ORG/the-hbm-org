export const CLARITY_ID = import.meta.env.VITE_CLARITY_ID || "";

function noop() {}

export const hbmAnalytics = {
  recordRegStart: noop,
  recordRegComplete: noop,
  recordMediaView: noop,
  recordOutboundLink: noop,
};
