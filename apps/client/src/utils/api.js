/**
 * API base URL:
 * - dev: talk directly to the local server on port 3001
 * - when app is served from backend (e.g. port 3001): same-origin
 * - production: same-origin
 */
export function getApiBase() {
  if (typeof window === "undefined") return "";
  if (window.location.port === "3001") return "";
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:3001`;
  }
  return "";
}
