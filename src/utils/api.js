/**
 * API base URL: dev = same-origin (Vite proxies /api to admin server 3001); production = Render backend.
 */
export function getApiBase() {
  if (typeof window === "undefined") return "";
  if (import.meta.env.DEV) return import.meta.env.VITE_API_BASE || "";
  return import.meta.env.VITE_API_BASE || "https://thehbm-backend.onrender.com";
}
