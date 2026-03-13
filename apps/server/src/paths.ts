import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const REPO_ROOT = path.resolve(__dirname, "../../..");
export const LEGACY_CLIENT_APP_ROOT = path.join(REPO_ROOT, "apps", "client");
export const SITE_APP_ROOT = path.join(REPO_ROOT, "apps", "site");
export const ADMIN_APP_ROOT = path.join(REPO_ROOT, "apps", "admin");
export const SERVER_APP_ROOT = path.join(REPO_ROOT, "apps", "server");
export const LEGACY_CLIENT_PUBLIC_ROOT = path.join(LEGACY_CLIENT_APP_ROOT, "public");
export const SITE_PUBLIC_ROOT = path.join(SITE_APP_ROOT, "public");
export const SITE_DIST_ROOT = path.join(SITE_APP_ROOT, "dist");
export const ADMIN_DIST_ROOT = path.join(ADMIN_APP_ROOT, "dist");
export const ROOT_ENV_PATH = path.join(REPO_ROOT, ".env");
export const SERVER_ENV_PATH = path.join(SERVER_APP_ROOT, ".env");
