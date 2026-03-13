/**
 * After vite build: copy all JSON data into apps/client/dist/data/ for static hosting.
 * - data/site-configs.json (team, partners, testimonials)
 * - apps/client/public/data/*.json (e.g. events.json if present)
 * Ensures Hostinger build has everything without Render.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");
const clientRoot = path.join(projectRoot, "apps", "client");
const distDataDir = path.join(clientRoot, "dist", "data");

const toCopy = [
  { src: path.join(projectRoot, "data", "site-configs.json"), name: "site-configs.json" },
  {
    src: path.join(clientRoot, "public", "data", "events.json"),
    name: "events.json",
  },
];

try {
  fs.mkdirSync(distDataDir, { recursive: true });
  for (const { src, name } of toCopy) {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(distDataDir, name));
      console.log("copy-data-to-dist: copied", name, "→ apps/client/dist/data/");
    } else {
      console.warn("copy-data-to-dist: not found, skipping:", src);
    }
  }
} catch (err) {
  console.error("copy-data-to-dist error:", err.message);
  process.exit(1);
}
