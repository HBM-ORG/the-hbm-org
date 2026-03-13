function trimTrailingSlash(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function readEnvValue(name) {
  if (typeof import.meta === "undefined" || !import.meta.env) {
    return "";
  }
  return trimTrailingSlash(import.meta.env[name]);
}

function getBrowserOrigin() {
  if (typeof window === "undefined") return "";
  return trimTrailingSlash(window.location.origin);
}

function deriveAdminUrl() {
  if (typeof window === "undefined") return "";

  const currentOrigin = getBrowserOrigin();
  if (!currentOrigin) return "";

  const { hostname, protocol } = window.location;
  if (hostname.startsWith("admin.")) {
    return currentOrigin;
  }
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "";
  }

  const rootHost = hostname.replace(/^www\./, "");
  return `${protocol}//admin.${rootHost}`;
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
  return readEnvValue("VITE_SITE_URL") || getBrowserOrigin();
}

export function getAdminUrl() {
  return readEnvValue("VITE_ADMIN_URL") || deriveAdminUrl();
}

export function getCmsUploadsBase() {
  const explicitBase =
    readEnvValue("VITE_CMS_UPLOADS_BASE") || readEnvValue("VITE_WP_CONTENT_BASE");
  if (explicitBase) return explicitBase;

  const siteUrl = getSiteUrl();
  return siteUrl ? joinUrl(siteUrl, "/wp-content/uploads") : "";
}

export function getAbsoluteSiteUrl(path = "/") {
  const siteUrl = getSiteUrl();
  return siteUrl ? joinUrl(siteUrl, path) : path;
}
