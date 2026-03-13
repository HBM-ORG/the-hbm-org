import { getApiBase } from "./api.js";

const ADMIN_SESSION_KEY = "hbm_admin_password";

export function getStoredAdminPassword() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(ADMIN_SESSION_KEY) || "";
}

export function storeAdminPassword(password) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ADMIN_SESSION_KEY, password);
}

export function clearAdminPassword() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export async function verifyAdminPassword(password) {
  const candidate = String(password || "").trim();
  if (!candidate) {
    return { ok: false, error: "Password is required" };
  }

  try {
    const base = getApiBase();
    const response = await fetch(`${base}/api/auth/check`, {
      headers: {
        "X-Admin-Password": candidate,
      },
    });

    if (!response.ok) {
      return { ok: false, error: "Invalid password" };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to verify password" };
  }
}
