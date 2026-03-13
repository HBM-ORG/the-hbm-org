/**
 * After vite build: copy runtime JSON data into <app>/dist/data/ for static hosting.
 * Default target app is apps/site.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");
const targetAppArg = process.argv[2] || "apps/site";
const targetAppRoot = path.join(projectRoot, targetAppArg);
const siteAppRoot = path.join(projectRoot, "apps", "site");
const distDataDir = path.join(targetAppRoot, "dist", "data");

const toCopy = [
  { src: path.join(projectRoot, "data", "site-configs.json"), name: "site-configs.json" },
  {
    src: path.join(siteAppRoot, "public", "data", "events.json"),
    name: "events.json",
  },
  {
    src: path.join(siteAppRoot, "public", "data", "runtime-config.json"),
    name: "runtime-config.json",
  },
];

try {
  fs.mkdirSync(distDataDir, { recursive: true });
  for (const { src, name } of toCopy) {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(distDataDir, name));
      console.log("copy-data-to-dist: copied", name, "→", `${targetAppArg}/dist/data/`);
    } else {
      console.warn("copy-data-to-dist: not found, skipping:", src);
    }
  }
} catch (err) {
  console.error("copy-data-to-dist error:", err.message);
  process.exit(1);
}
