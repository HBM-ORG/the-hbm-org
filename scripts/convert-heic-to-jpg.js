/**
 * Converts all .heic files in public/assets/events to .jpg so they display in all browsers.
 * Does NOT delete the original .heic files. Updates events.json to point to .jpg paths.
 * Run once: node scripts/convert-heic-to-jpg.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
let heicConvert;
try {
  heicConvert = require("heic-convert");
} catch (e) {
  console.error("heic-convert is required. Run: npm install heic-convert");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const ASSETS_DIR = path.join(PROJECT_ROOT, "public", "assets", "events");
const EVENTS_FILE = path.join(PROJECT_ROOT, "public", "data", "events.json");

function* walkHeicFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walkHeicFiles(full);
    else if (e.isFile() && /\.heic$/i.test(e.name)) yield full;
  }
}

function replaceHeicWithJpgInObject(obj) {
  if (typeof obj === "string") {
    if (/\.heic$/i.test(obj)) return obj.replace(/\.heic$/i, ".jpg");
    return obj;
  }
  if (Array.isArray(obj)) return obj.map((item) => replaceHeicWithJpgInObject(item));
  if (obj && typeof obj === "object") {
    const out = {};
    for (const k of Object.keys(obj)) out[k] = replaceHeicWithJpgInObject(obj[k]);
    return out;
  }
  return obj;
}

async function main() {
  const heicFiles = [...walkHeicFiles(ASSETS_DIR)];
  console.log(`Found ${heicFiles.length} .heic file(s) in public/assets/events`);

  for (const heicPath of heicFiles) {
    const jpgPath = heicPath.replace(/\.heic$/i, ".jpg");
    if (fs.existsSync(jpgPath)) {
      console.log(`Skip (JPG exists): ${path.relative(ASSETS_DIR, heicPath)}`);
      continue;
    }
    try {
      const input = fs.readFileSync(heicPath);
      const output = await heicConvert({ buffer: input, format: "JPEG", quality: 0.9 });
      fs.writeFileSync(jpgPath, Buffer.from(output));
      console.log(`Converted: ${path.relative(ASSETS_DIR, heicPath)} -> ${path.basename(jpgPath)}`);
    } catch (err) {
      console.error(`Failed ${heicPath}:`, err.message);
    }
  }

  if (!fs.existsSync(EVENTS_FILE)) {
    console.log("No events.json found, skip path update.");
    return;
  }

  const eventsJson = fs.readFileSync(EVENTS_FILE, "utf8");
  const events = JSON.parse(eventsJson);
  const updated = replaceHeicWithJpgInObject(events);
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(updated, null, 2), "utf8");
  console.log("Updated public/data/events.json: all .heic paths -> .jpg");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
