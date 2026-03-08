/**
 * API base URL: dev = same-origin (Vite proxies /api to admin server 3001);
 * when app is served from backend (e.g. port 3001) = same-origin;
 * production (Hostinger) = always "" so the site uses only local fallbacks (no Render).
 */
export function getApiBase() {
  if (typeof window === "undefined") return "";
  // App served from same server as API (e.g. node server on 3001) → use same origin
  if (window.location.port === "3001") return "";
  if (import.meta.env.DEV) return import.meta.env.VITE_API_BASE || "";
  return "";
}
