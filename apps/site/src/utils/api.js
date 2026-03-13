function trimTrailingSlash(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function readEnvValue(name) {
  if (typeof import.meta === "undefined" || !import.meta.env) {
    return "";
  }
  return trimTrailingSlash(import.meta.env[name]);
}

export function joinUrl(base, path) {
  const cleanBase = trimTrailingSlash(base);
  const cleanPath = String(path || "");

  if (!cleanBase) return cleanPath;
  if (!cleanPath) return cleanBase;
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }

  return `${cleanBase}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

export function getApiBase() {
  const explicitBase = readEnvValue("VITE_API_BASE");
  if (explicitBase) return explicitBase;

  if (typeof window === "undefined") return "";
  if (window.location.port === "3001") return "";

  if (import.meta.env.DEV) {
    return `http://${window.location.hostname}:3001`;
  }

  return "";
}

export function getAssetBase() {
  const explicitAssetBase = readEnvValue("VITE_ASSET_BASE");
  if (explicitAssetBase) return explicitAssetBase;

  const apiBase = getApiBase();
  return apiBase || "";
}

export function resolveAssetUrl(rawPath) {
  const value = String(rawPath || "").trim();
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (!value.startsWith("/")) return value;

  const assetBase = getAssetBase();
  return assetBase ? joinUrl(assetBase, value) : value;
}

export function getSiteUrl() {
  return readEnvValue("VITE_SITE_URL") || "https://www.thehbm.org";
}

export function getAdminUrl() {
  return readEnvValue("VITE_ADMIN_URL") || "https://admin.thehbm.org";
}
