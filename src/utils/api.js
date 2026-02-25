/**
 * Single source of truth for API base URL.
 * Returns "" so all /api calls are same-origin (Vite proxy in dev, same host in production).
 */
export function getApiBase() {
  return "";
}
