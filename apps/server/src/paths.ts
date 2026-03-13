import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const REPO_ROOT = path.resolve(__dirname, "../../..");
export const CLIENT_APP_ROOT = path.join(REPO_ROOT, "apps", "client");
export const SERVER_APP_ROOT = path.join(REPO_ROOT, "apps", "server");
export const CLIENT_PUBLIC_ROOT = path.join(CLIENT_APP_ROOT, "public");
export const CLIENT_DIST_ROOT = path.join(CLIENT_APP_ROOT, "dist");
export const ROOT_ENV_PATH = path.join(REPO_ROOT, ".env");
export const SERVER_ENV_PATH = path.join(SERVER_APP_ROOT, ".env");
