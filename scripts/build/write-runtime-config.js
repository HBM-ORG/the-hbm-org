import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");
const targetAppArg = process.argv[2] || "apps/site";
const targetAppRoot = path.join(projectRoot, targetAppArg);
const publicDataDir = path.join(targetAppRoot, "public", "data");

dotenv.config({ path: path.join(projectRoot, "apps", "site", ".env") });
dotenv.config({ path: path.join(projectRoot, ".env"), override: false });

function readEnv(name) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

const runtimeConfig = {
  siteUrl: readEnv("VITE_SITE_URL") || readEnv("SITE_APP_URL") || "",
  adminUrl: readEnv("VITE_ADMIN_URL") || readEnv("ADMIN_APP_URL") || "",
  apiBase: readEnv("VITE_API_BASE") || readEnv("BASE_URL") || "",
  assetBase: readEnv("VITE_ASSET_BASE") || "",
};

fs.mkdirSync(publicDataDir, { recursive: true });
fs.writeFileSync(
  path.join(publicDataDir, "runtime-config.json"),
  `${JSON.stringify(runtimeConfig, null, 2)}\n`,
);

console.log(
  "write-runtime-config: wrote",
  `${targetAppArg}/public/data/runtime-config.json`,
);
