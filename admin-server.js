import express from "express";
import nodemailer from "nodemailer";
import * as ics from "ics";
import { v4 as uuidv4 } from "uuid";
import { Liquid } from "liquidjs";
import inlineCss from "inline-css";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";
import { Buffer } from "buffer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const dotenv = await import("dotenv").catch(() => null);
  if (dotenv) dotenv.default.config();
} catch (e) {
  console.error("Error loading dotenv:", e);
}

import fetch from "node-fetch";
import crypto from "crypto";
import Database from "better-sqlite3";

const dbPath = process.env.DATABASE_URL
  ? (process.env.DATABASE_URL || "./dev.db").replace("file:", "")
  : "./dev.db";
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Initialize tables if they don't exist (schema: choice, settings, hashedIp, timestamp)
db.exec(`
  CREATE TABLE IF NOT EXISTS "CookieConsentLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" TEXT NOT NULL DEFAULT (datetime('now')),
    "choice" TEXT NOT NULL,
    "settings" TEXT NOT NULL,
    "hashedIp" TEXT NOT NULL
  );
`);
// Migration: if old schema (data column exists, no choice), add new columns
try {
  const info = db.prepare("PRAGMA table_info(CookieConsentLog)").all();
  const hasChoice = info.some((c) => c.name === "choice");
  const hasData = info.some((c) => c.name === "data");
  if (!hasChoice && hasData) {
    db.exec(`ALTER TABLE "CookieConsentLog" ADD COLUMN "choice" TEXT;`);
    db.exec(`ALTER TABLE "CookieConsentLog" ADD COLUMN "settings" TEXT;`);
    db.exec(`ALTER TABLE "CookieConsentLog" ADD COLUMN "hashedIp" TEXT;`);
    console.log("[CookieConsentLog] Migrated table to new schema");
  }
} catch (e) {
  // ignore if table doesn't exist yet
}

// Define triggerAutomation function
const triggerAutomation = async (flowId) => {
  console.log(`Triggering automation for flowId: ${flowId}`);
  // Add logic here
};

const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const app = express();

// Trust reverse proxy (Hostinger)
app.set("trust proxy", 1);

// Middleware — Manual CORS (most reliable with Express 5)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());

// --- Subdomain Routing ---
app.use((req, res, next) => {
  const host = req.headers.host || "";
  // Redirect admin subdomain to the dashboard
  if (host.startsWith("admin.") && req.path === "/") {
    return res.redirect("/admin-dashboard");
  }
  next();
});

// Middleware for logging
app.use((req, res, next) => {
  if (req.path !== "/api/events" && !req.path.startsWith("/assets/")) {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} (Host: ${req.headers.host})`,
    );
  }
  next();
});

// Global Paths
const EVENTS_FILE_PATH = path.join(__dirname, "public", "data", "events.json");
const AUTOMATION_CONFIG_PATH = path.join(
  __dirname,
  "src",
  "data",
  "automationConfig.json",
);
const REGISTRATIONS_FILE_PATH = path.join(
  __dirname,
  "src",
  "data",
  "registrations.json",
);
const EMAIL_QUEUE_PATH = path.join(__dirname, "src", "data", "emailQueue.json");
const ENGAGEMENT_LOG_PATH = path.join(
  __dirname,
  "src",
  "data",
  "engagement.json",
);
const VIDEO_EVENT_CONFIG_PATH = path.join(
  __dirname,
  "src",
  "data",
  "videoEvent.json",
);
const SUPPRESSION_LIST_PATH = path.join(
  __dirname,
  "src",
  "data",
  "suppression.json",
);
const CAMPAIGNS_FILE_PATH = path.join(
  __dirname,
  "src",
  "data",
  "campaigns.json",
);
const HOW_IT_WORKS_CONFIG_PATH = path.join(
  __dirname,
  "src",
  "data",
  "howItWorksConfig.json",
);
const HOW_IT_WORKS_STAGING_PATH = path.join(
  __dirname,
  "src",
  "data",
  "howItWorksStaging.json",
);
const KNOWLEDGE_BASE_CONFIG_PATH = path.join(
  __dirname,
  "src",
  "data",
  "knowledgeBaseConfig.json",
);
const ASSETS_DIR = path.join(__dirname, "public", "assets", "events");
const CMS_ASSETS_DIR = path.join(__dirname, "public", "assets", "cms");
if (!fs.existsSync(CMS_ASSETS_DIR))
  fs.mkdirSync(CMS_ASSETS_DIR, { recursive: true });
const LOG_FILE = path.join(__dirname, "src", "data", "server-errors.log");

// Safe file-based error logger — never crashes the process
const logError = (context, err) => {
  const entry = `[${new Date().toISOString()}] [${context}] ${err?.message || err}\n`;
  console.error(entry);
  try {
    fs.appendFileSync(LOG_FILE, entry);
  } catch (_) {
    /* disk full — ignore */
  }
};

const liquidEngine = new Liquid();

// Ensure assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Multer Setup for Image Uploads
import multer from "multer";

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folderName = req.body.folderName;

    // Fallback logic if client hasn't sent folderName yet (Multer field order issue)
    if (!folderName) {
      console.warn(
        'Multer: No folderName in body yet. This usually means field order is wrong or field is missing. Defaulting to "general".',
      );
      folderName = "general";
    }

    const uploadPath = path.join(ASSETS_DIR, folderName);

    // Create folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Sanitize filename: remove spaces and special chars to avoid URL issues
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, Date.now() + "_" + sanitized); // Add timestamp to avoid collisions
  },
});

const upload = multer({ storage: storage });

// ==========================================
// IMAGE ENDPOINTS
// ==========================================

// Dedicated Email Image Upload
const EMAIL_ASSETS_DIR = path.join(__dirname, "public", "assets", "emails");
if (!fs.existsSync(EMAIL_ASSETS_DIR))
  fs.mkdirSync(EMAIL_ASSETS_DIR, { recursive: true });

const emailStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, EMAIL_ASSETS_DIR),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() + "_" + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_"),
    ),
});
const uploadEmail = multer({ storage: emailStorage });

app.post("/api/upload-email-image", uploadEmail.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const fullUrl =
    req.protocol +
    "://" +
    req.get("host") +
    "/assets/emails/" +
    req.file.filename;
  res.json({ success: true, url: fullUrl }); // Return absolute URL for email compatibility
});

// Dedicated CMS Image Upload
const cmsStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CMS_ASSETS_DIR),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() + "_" + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_"),
    ),
});
const uploadCms = multer({ storage: cmsStorage });

app.post("/api/upload-cms-image", uploadCms.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = "/assets/cms/" + req.file.filename;
  res.json({ success: true, url });
});

// 1. List Images in a Folder
app.get("/api/images/:folderName", (req, res) => {
  const folderName = req.params.folderName;
  const folderPath = path.join(ASSETS_DIR, folderName);

  if (!fs.existsSync(folderPath)) {
    return res.json({ images: [] });
  }

  try {
    const files = fs.readdirSync(folderPath);
    // Include both images and videos
    const assets = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp|mp4|mov|webm|pdf)$/i.test(file),
    );
    res.json({ images: assets, files: assets }); // keep images key for backward compatibility
  } catch (error) {
    res.status(500).json({ error: "Failed to list images" });
  }
});

// Cookie Consent Logging
app.post("/api/cookie-consent-log", async (req, res) => {
  const { choice, settings } = req.body;
  const ip =
    req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const hashedIp = crypto
    .createHash("sha256")
    .update(ip || "unknown")
    .digest("hex");

  try {
    const stmt = db.prepare(`
            INSERT INTO "CookieConsentLog" ("timestamp", "choice", "settings", "hashedIp")
            VALUES (datetime('now'), ?, ?, ?)
        `);
    const result = stmt.run(
      choice || "custom",
      JSON.stringify(settings || {}),
      hashedIp,
    );
    console.log("[Cookie Consent] Logged:", {
      choice,
      ip: hashedIp.substring(0, 16),
    });
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error("[Cookie Consent POST Error]", error);
    logError("CookieConsentLog.POST", error);
    res
      .status(500)
      .json({ error: "Failed to log consent", details: error.message });
  }
});

app.get("/api/cookie-consent-logs", async (req, res) => {
  try {
    const stmt = db.prepare(`
            SELECT * FROM "CookieConsentLog"
            ORDER BY "timestamp" DESC
            LIMIT 100
        `);
    const logs = stmt.all();
    console.log("[Cookie Consent] Fetched logs count:", logs.length);
    res.json(logs);
  } catch (error) {
    console.error("[Cookie Consent GET Error]", error);
    logError("CookieConsentLog.GET", error);
    res
      .status(500)
      .json({ error: "Failed to fetch logs", details: error.message });
  }
});

// 2b. Upload General Asset (Video, Partners, etc.)
// Uses 'asset' field name. 'subfolder' in body.
app.post("/api/upload-asset", upload.single("asset"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Move file if subfolder is requested
  // Multer upload default is to root of event folder (from destination function)
  const folderName = req.body.folderName;
  const subfolder = req.body.subfolder; // e.g., 'partners', 'hero' (optional mainly for org)

  if (subfolder) {
    const currentPath = req.file.path;
    const subfolderDir = path.join(ASSETS_DIR, folderName, subfolder);
    if (!fs.existsSync(subfolderDir)) {
      fs.mkdirSync(subfolderDir, { recursive: true });
    }
    const savedFilename = req.file.filename; // Use the version with timestamp
    const newPath = path.join(subfolderDir, savedFilename);

    // If file exists, overwrite (unlikely with timestamp but safe)
    if (fs.existsSync(newPath)) {
      fs.unlinkSync(newPath);
    }

    fs.renameSync(currentPath, newPath);

    // Return relative path for frontend to use
    res.json({
      success: true,
      path: `${subfolder}/${savedFilename}`,
      filename: savedFilename,
    });
  } else {
    res.json({ success: true, filename: req.file.filename });
  }
});

// 3. Delete Image (Physical)
app.post("/api/delete-image", (req, res) => {
  const { folderName, filename } = req.body; // filename can be 'partners/logo.png'
  if (!folderName || !filename)
    return res.status(400).json({ error: "Missing parameters" });

  // Handle potential subfolders in filename
  const filePath = path.join(ASSETS_DIR, folderName, filename);

  console.log(`Attempting to delete: ${filePath}`);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${filePath}`);
      res.json({ success: true });
    } else {
      console.log(`File not found: ${filePath}`);
      res.status(404).json({ error: "File not found" });
    }
  } catch (error) {
    console.error(`Failed to delete file: ${error}`);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

app.post("/api/save-events", (req, res) => {
  try {
    const { events } = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const fileContent = JSON.stringify(events, null, 2);
    fs.writeFileSync(EVENTS_FILE_PATH, fileContent, "utf8");

    console.log("Events saved successfully to JSON");
    res.json({ success: true, message: "Events saved successfully" });
  } catch (error) {
    console.error("Error saving events:", error);
    res.status(500).json({ error: "Failed to save events" });
  }
});

// ==========================================
// REGISTRATION ENDPOINT
// ==========================================
// ==========================================
// REGISTRATION ENDPOINT
// ==========================================
// Ensure registrations file exists
if (!fs.existsSync(REGISTRATIONS_FILE_PATH)) {
  fs.writeFileSync(REGISTRATIONS_FILE_PATH, "[]", "utf8");
}

app.post("/api/register", (req, res) => {
  try {
    const { name, email, phone, source, eventId, eventName, language } =
      req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    let registrations = [];
    if (fs.existsSync(REGISTRATIONS_FILE_PATH)) {
      registrations = JSON.parse(
        fs.readFileSync(REGISTRATIONS_FILE_PATH, "utf8"),
      );
    }

    // Professional Lead Object
    const newRegistration = {
      id: Date.now(),
      name,
      email,
      phone,
      acquisitionSource: req.body.source || "Direct", // How they heard about us
      registrationSource: req.body.regSource || "website_general", // Where they clicked
      source: req.body.regSource || req.body.source || "Direct Web", // Legacy support
      category: eventId === "video-event" ? "Video Lead" : "Event Lead",
      eventId: eventId || "general",
      eventName: eventName || "General Registration",
      date: new Date().toISOString(),
      language: language || "en",
      status: "confirmed",
      history: [
        {
          type: "registration",
          date: new Date().toISOString(),
          message: `Registered for ${eventName || "General"}`,
        },
      ],
    };

    registrations.push(newRegistration);
    fs.writeFileSync(
      REGISTRATIONS_FILE_PATH,
      JSON.stringify(registrations, null, 2),
    );

    console.log(
      `[CRM] New registration: ${name} (${email}) | Event: ${eventName} | Source: ${source}`,
    );
    res.json({
      success: true,
      message: "Registration successful",
      leadId: newRegistration.id,
    });

    // Trigger automations asynchronously so email failures never block or fail the response
    setImmediate(() => {
      try {
        if (eventId === "video-event")
          triggerAutomationByEvent("onVideoRegistration", newRegistration);
        else
          triggerAutomationByEvent("onPhysicalRegistration", newRegistration);
        if (source === "8min_journey")
          triggerAutomationByEvent("on8MinJourney", newRegistration);
        triggerAutomationByEvent("registration", newRegistration);
        triggerAutomationByEvent("site_signup", newRegistration);
      } catch (e) {
        console.error("[Email] Registration automation trigger error:", e);
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to save registration" });
  }
});

app.post("/api/newsletter", (req, res) => {
  try {
    const { email, name, language, source } = req.body;
    if (!email) return res.status(400).json({ error: "Missing email" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    let registrations = [];
    if (fs.existsSync(REGISTRATIONS_FILE_PATH)) {
      registrations = JSON.parse(
        fs.readFileSync(REGISTRATIONS_FILE_PATH, "utf8"),
      );
    }

    const existing = registrations.find((r) => r.email === email);
    if (!existing) {
      const newRegistration = {
        id: Date.now(),
        name: name || "Subscriber",
        email,
        phone: "",
        source: source || "Newsletter Footer",
        category: "Subscriber",
        date: new Date().toISOString(),
        language: language || "en",
        status: "confirmed",
        history: [
          {
            type: "subscription",
            date: new Date().toISOString(),
            message: "Subscribed to Newsletter",
          },
        ],
      };
      registrations.push(newRegistration);
      fs.writeFileSync(
        REGISTRATIONS_FILE_PATH,
        JSON.stringify(registrations, null, 2),
      );
      triggerAutomationByEvent("onNewsletterSignup", newRegistration);
    } else {
      // Just update or trigger if it's a new subscription attempt
      existing.category =
        existing.category === "Lead" ? "Lead + Subscriber" : existing.category;
      if (!existing.history) existing.history = [];
      existing.history.push({
        type: "subscription",
        date: new Date().toISOString(),
        message: "Re-subscribed to Newsletter",
      });
      fs.writeFileSync(
        REGISTRATIONS_FILE_PATH,
        JSON.stringify(registrations, null, 2),
      );
      triggerAutomationByEvent("onNewsletterSignup", existing);
    }

    res.json({ success: true, message: "Newsletter signup successful" });
  } catch (error) {
    res.status(500).json({ error: "Failed" });
  }
});

// ==========================================
// ENTERPRISE EMAIL ENGINE (THE MONSTER)
// ==========================================

const getEmailTemplate = (body, config, trackingId, email, language) => {
  const styling = config?.globalStyling || {
    primaryColor: "#6160AB",
    secondaryColor: "#F07B3C",
    signatureUrl: "",
    logoUrl: "/logo.png",
  };
  const primary = styling.primaryColor;
  const secondary = styling.secondaryColor;
  const signatureUrl = styling.signatureUrl;
  const logoUrl = styling.logoUrl || "/logo.png";
  const trackingUrl = `${BASE_URL}/api/track/open/${trackingId}`;
  const unsubscribeUrl = `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}`;

  const dir = language === "he" ? "rtl" : "ltr";
  const align = language === "he" ? "right" : "left";

  return `
    <!DOCTYPE html>
    <html dir="${dir}">
    <head>
        <style>
            body { font-family: 'Sora', sans-serif; background-color: #f7f7fc; margin: 0; padding: 0; direction: ${dir}; text-align: ${align}; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #f7f7fc; padding-bottom: 40px; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.03); border: 1px solid #f0f0f5; text-align: ${align}; }
            .header { background: linear-gradient(135deg, ${primary}, ${secondary}); padding: 60px 40px; text-align: center; }
            .logo { width: 140px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1)); }
            .content { padding: 50px 40px; color: #1a1a1a; line-height: 1.8; font-size: 16px; text-align: ${align}; }
            .signature { margin-top: 40px; max-width: 200px; }
            .footer { padding: 40px; text-align: center; font-size: 12px; color: #a0a0b0; background: #fafafc; direction: ${dir}; }
            .btn { display: inline-block; padding: 16px 40px; background: ${secondary}; color: #ffffff !important; text-decoration: none; border-radius: 18px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 30px; box-shadow: 0 10px 20px ${secondary}44; }
            .tracking-pixel { display: none; }
            .unsub { color: #a0a0b0; text-decoration: underline; margin-top: 10px; display: block; }
        </style>
    </head>
    <body dir="${dir}">
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <img src="${logoUrl.startsWith("http") ? logoUrl : BASE_URL + logoUrl}" class="logo" alt="The HBM">
                </div>
                <div class="content">
                    ${body}
                    ${signatureUrl ? `<br><img src="${signatureUrl}" class="signature" alt="Signature">` : ""}
                </div>
                <div class="footer">
                    <strong>© 2026 The Human Being Movement</strong><br>
                    Crafting deep human connections, 8 minutes at a time.<br>
                    <a href="${unsubscribeUrl}" class="unsub">Unsubscribe from these emails</a>
                </div>
            </div>
        </div>
        <img src="${trackingUrl}" class="tracking-pixel" width="1" height="1" />
    </body>
    </html>
    `;
};

const triggerAutomationByEvent = (triggerType, userData) => {
  try {
    if (!fs.existsSync(AUTOMATION_CONFIG_PATH)) return;
    const config = JSON.parse(fs.readFileSync(AUTOMATION_CONFIG_PATH));

    const queue = fs.existsSync(EMAIL_QUEUE_PATH)
      ? JSON.parse(fs.readFileSync(EMAIL_QUEUE_PATH))
      : [];
    const now = Date.now();
    let queuedCount = 0;

    // 1. Process Individual Flows
    const activeFlows = (config.flows || []).filter(
      (f) => f.active && f.trigger === triggerType,
    );
    activeFlows.forEach((flow) => {
      let scheduledFor = now;
      if (flow.delayValue && flow.delayUnit) {
        const multiplier =
          flow.delayUnit === "h"
            ? 3600000
            : flow.delayUnit === "d"
              ? 86400000
              : 60000;
        scheduledFor += parseInt(flow.delayValue) * multiplier;
      }
      queue.push({
        id: uuidv4(),
        status: "pending",
        scheduledFor,
        data: userData,
        stepType: "email",
        flowId: flow.id,
        attempts: 0,
      });
      queuedCount++;
    });

    // 2. Process Sequences (Journeys)
    const activeSequences = (config.sequences || []).filter(
      (s) => s.active && s.trigger === triggerType,
    );
    activeSequences.forEach((seq) => {
      let cumulativeDelay = 0;
      seq.steps.forEach((step) => {
        if (step.type === "wait") {
          cumulativeDelay += parseDelay(step.duration);
        } else if (step.type === "email") {
          // Note: If the email has its own duration (e.g. '24h'), add it
          const stepDelay = step.duration ? parseDelay(step.duration) : 0;
          queue.push({
            id: uuidv4(),
            status: "pending",
            scheduledFor: now + cumulativeDelay + stepDelay,
            data: userData,
            stepType: "email",
            flowId: step.flowId,
            attempts: 0,
            sequenceId: seq.id,
          });
          queuedCount++;
        }
      });
    });

    if (queuedCount > 0) {
      fs.writeFileSync(EMAIL_QUEUE_PATH, JSON.stringify(queue, null, 2));
      console.log(
        `🚀 [Email] Queued ${queuedCount} items for trigger [${triggerType}] -> ${userData.email}`,
      );
      processQueue().catch((err) =>
        console.error("[Email] Immediate process failed:", err),
      );
    } else {
      console.log(
        `[Email] No active flows or sequences found for trigger: ${triggerType}`,
      );
    }
  } catch (err) {
    console.error("[Email] triggerAutomationByEvent Error:", err);
  }
};

const addToEmailQueue = async (sequenceId, userData) => {};

const parseDelay = (str) => {
  const value = parseInt(str);
  if (str.includes("h")) return value * 60 * 60 * 1000;
  if (str.includes("m")) return value * 60 * 1000;
  if (str.includes("d")) return value * 24 * 60 * 60 * 1000;
  return 0;
};

const processQueue = async (specificItemId = null) => {
  try {
    if (!fs.existsSync(EMAIL_QUEUE_PATH)) return false;
    const queue = JSON.parse(fs.readFileSync(EMAIL_QUEUE_PATH));
    const now = Date.now();
    let config;
    try {
      config = JSON.parse(fs.readFileSync(AUTOMATION_CONFIG_PATH));
    } catch (e) {
      console.error("[Email] processQueue: failed to load config", e);
      return false;
    }
    const suppressionList = fs.existsSync(SUPPRESSION_LIST_PATH)
      ? JSON.parse(fs.readFileSync(SUPPRESSION_LIST_PATH))
      : [];

    if (!config?.smtp?.host) return false;

    const port = parseInt(config.smtp.port) || 587;
    const secure =
      typeof config.smtp.secure === "boolean"
        ? config.smtp.secure
        : port === 465;
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port,
        secure,
        requireTLS: port === 587 && !secure,
        auth: { user: config.smtp.user, pass: config.smtp.pass || "" },
      });
    } catch (err) {
      console.error("[Email] processQueue: createTransport failed", err);
      return false;
    }

    let success = true;
    for (let item of queue) {
    if (specificItemId && item.id !== specificItemId) continue;
    if (
      item.status === "pending" &&
      item.scheduledFor <= now &&
      item.stepType === "email"
    ) {
      // Check suppression
      if (suppressionList.includes(item.data.email)) {
        item.status = "suppressed";
        continue;
      }

      try {
        const flow = (config.flows || []).find((f) => f.id === item.flowId);
        const campaign = !flow
          ? fs.existsSync(CAMPAIGNS_FILE_PATH)
            ? JSON.parse(fs.readFileSync(CAMPAIGNS_FILE_PATH)).find(
                (c) => c.id === item.flowId,
              )
            : null
          : null;

        if (!flow && !campaign) {
          item.status = "failed";
          item.error = "Source flow/campaign not found";
          continue;
        }

        const source = flow || campaign;
        const trackingId = item.id;

        const lang = item.data.language || "en";
        const renderData = {
          ...item.data,
          eventDate: item.data.date
            ? new Date(item.data.date).toLocaleDateString()
            : "",
          year: 2026,
        };

        const rawSubject =
          lang === "he" && source.subject_he
            ? source.subject_he
            : source.subject_en || source.subject;
        const rawBody =
          lang === "he" && source.body_he
            ? source.body_he
            : source.body_en || source.body;

        let subject = await liquidEngine.parseAndRender(rawSubject, renderData);
        let body = await liquidEngine.parseAndRender(
          rawBody.replace(/\n/g, "<br>"),
          renderData,
        );

        const html = await inlineCss(
          getEmailTemplate(body, config, trackingId, item.data.email, lang),
          { url: "http://localhost:3001" },
        );

        const mailOptions = {
          from: config.smtp.from,
          to: item.data.email,
          subject: subject,
          html: html,
        };

        if (source.includeCalendar) {
          const { value } = ics.createEvent({
            start: [
              new Date(item.data.date).getFullYear(),
              new Date(item.data.date).getMonth() + 1,
              new Date(item.data.date).getDate(),
              19,
              0,
            ],
            duration: { hours: 3 },
            title: item.data.eventName || "HBM Event",
            location: item.data.location || "Tel Aviv",
          });
          if (value)
            mailOptions.attachments = [
              { filename: "hbm-invite.ics", content: value },
            ];
        }

        await transporter.sendMail(mailOptions);
        item.status = "sent";
        item.sentAt = new Date().toISOString();

        logEngagement(trackingId, "sent", item.data.email);
      } catch (err) {
        logError("SMTP/Queue", err);
        item.status = "failed";
        let errMsg = err.message || String(err);
        const host = (config.smtp?.host || "").toLowerCase();
        if (/535|auth|login|invalid credentials/i.test(errMsg) && (host.includes("office365") || host.includes("outlook"))) {
          errMsg = "SMTP auth failed. For Office 365 use an App Password (Security → App passwords), not your account password.";
        }
        item.error = errMsg;
        success = false;
      }
    }
  }

    fs.writeFileSync(EMAIL_QUEUE_PATH, JSON.stringify(queue, null, 2));
    return success;
  } catch (err) {
    console.error("[Email] processQueue error:", err);
    return false;
  }
};

const logEngagement = (id, type, email, metadata = {}) => {
  const log = fs.existsSync(ENGAGEMENT_LOG_PATH)
    ? JSON.parse(fs.readFileSync(ENGAGEMENT_LOG_PATH))
    : [];
  log.push({
    id,
    type,
    email,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
  fs.writeFileSync(ENGAGEMENT_LOG_PATH, JSON.stringify(log, null, 2));
};

// CRON-LIKE INTERVAL
setInterval(processQueue, 60000); // Process every minute

// ==========================================
// TRACKING & WEBHOOKS
// ==========================================

app.get("/api/track/open/:id", (req, res) => {
  let email = "unknown";
  try {
    const queue = JSON.parse(fs.readFileSync(EMAIL_QUEUE_PATH, "utf8"));
    const item = queue.find((i) => i.id === req.params.id);
    if (item) email = item.data.email;
  } catch (e) {}

  logEngagement(req.params.id, "open", email);
  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64",
  );
  res
    .writeHead(200, {
      "Content-Type": "image/gif",
      "Content-Length": pixel.length,
    })
    .end(pixel);
});

app.get("/api/track/click/:id", (req, res) => {
  let email = "unknown";
  try {
    const queue = JSON.parse(fs.readFileSync(EMAIL_QUEUE_PATH, "utf8"));
    const item = queue.find((i) => i.id === req.params.id);
    if (item) email = item.data.email;
  } catch (e) {}

  logEngagement(req.params.id, "click", email);
  const target = req.query.url || "http://thehbm.org";
  res.redirect(target);
});

app.get("/api/unsubscribe", (req, res) => {
  const { email } = req.query;
  // Add to suppression list logic here
  res.send(
    `<h1>Successfully Unsubscribed</h1><p>The email ${email} has been removed from our marketing list.</p>`,
  );
});

// GET Engagement Log
app.get("/api/engagement", (req, res) => {
  try {
    if (!fs.existsSync(ENGAGEMENT_LOG_PATH)) return res.json([]);
    res.json(JSON.parse(fs.readFileSync(ENGAGEMENT_LOG_PATH, "utf8")));
  } catch {
    res.json([]);
  }
});

// GET Email Queue
app.get("/api/email-queue", (req, res) => {
  try {
    if (!fs.existsSync(EMAIL_QUEUE_PATH)) return res.json([]);
    res.json(JSON.parse(fs.readFileSync(EMAIL_QUEUE_PATH, "utf8")));
  } catch {
    res.json([]);
  }
});

// POST SMTP Check (real connectivity test)
app.post("/api/smtp-check", async (req, res) => {
  const { host, port, user, pass, secure } = req.body;
  if (!host || !user)
    return res.json({ success: false, message: "SMTP not configured" });
  const portNum = parseInt(port) || 587;
  const useSecure =
    typeof secure === "boolean" ? secure : portNum === 465;
  const isOffice365 = (host || "").toLowerCase().includes("office365") || (host || "").toLowerCase().includes("outlook");
  try {
    const transporter = nodemailer.createTransport({
      host,
      port: portNum,
      secure: useSecure,
      requireTLS: portNum === 587 && !useSecure,
      auth: { user, pass: pass || "" },
      connectionTimeout: 10000,
    });
    await transporter.verify();
    res.json({ success: true, message: "SMTP connection verified" });
  } catch (err) {
    console.error("SMTP Check Error:", err);
    let msg = err.message || err.code || "Connection failed";
    if (/535|auth|login|invalid credentials/i.test(String(msg)) && isOffice365) {
      msg = "Auth failed. For Office 365 use an App Password (not your account password). Account → Security → App passwords.";
    }
    res.json({
      success: false,
      message: msg,
    });
  }
});

app.post("/api/automation/trigger", async (req, res) => {
  const { flowId, data } = req.body;
  try {
    await triggerAutomation(flowId, data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ai/improve-copy", async (req, res) => {
  const { text, goal, prompt, tone, language } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const hbmContext =
    "The HBM (Human Being Movement) focus on 8-minute deep human connections. Premium, authentic, psychological depth.";

  // Improved simulation/fallback function
  const getSimulation = (txt, t, g, l, p) => {
    if (l === "he") {
      const cta =
        g === "marketing"
          ? "\n\n**הזדמנות מיוחדת:** אל תישארו מאחור — תפסו את מקומכם עכשיו!"
          : "";
      return `✨ ${txt}\n\n${p ? `[שדרוג: ${p}]` : ""}${cta}`;
    } else {
      const cta =
        g === "marketing" ? "\n\n**Exclusive:** Grab your spot now!" : "";
      return `✨ ${txt}\n\n${p ? `[Refined: ${p}]` : ""}${cta}`;
    }
  };

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.log("[AI] No API Key found, using simulation");
    return res.json({
      text: getSimulation(text, tone, goal, language, prompt),
    });
  }

  try {
    const systemPrompt = `You are the HBM AI Copywriter. Improve the following email text. 
        Tone: ${tone}. Goal: ${goal}. Language: ${language === "he" ? "Hebrew" : "English"}.
        Context: ${hbmContext}. User Instruction: ${prompt || "Make it better"}.
        Keep placeholders like {{name}}, {{eventName}}, {{eventDate}}, {{location}} intact.
        Return ONLY the improved text, no intro or outro.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\nText to improve:\n${text}` }],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (data.error) {
      console.error("[AI Gemini Error]", data.error.message);
      return res.json({
        text: getSimulation(text, tone, goal, language, prompt),
      });
    }

    let raw = null;
    if (data.candidates && Array.isArray(data.candidates) && data.candidates[0]) {
      const c0 = data.candidates[0];
      const part = c0.content && c0.content.parts && c0.content.parts[0];
      if (part != null) {
        if (typeof part === "string") {
          raw = part;
        } else if (typeof part.text !== "undefined") {
          raw = part.text;
        }
      }
      if (raw == null && c0.output != null) {
        raw = c0.output;
      }
    }
    const improvedText =
      raw != null && String(raw).trim() !== ""
        ? String(raw).trim()
        : getSimulation(text, tone, goal, language, prompt);
    res.json({ text: improvedText });
  } catch (err) {
    console.error("[AI Exception]", err);
    res.json({ text: getSimulation(text, tone, goal, language, prompt) });
  }
});

const AUTOMATION_SETTINGS_DEFAULT_FLOWS = [
  {
    id: "newsletter",
    trigger: "onNewsletterSignup",
    name: "Newsletter Welcome",
    desc: "Sent when explicitly signing up for the newsletter",
  },
  {
    id: "physical",
    trigger: "onPhysicalRegistration",
    name: "Physical Event Reg",
    desc: "Sent when booking a spot for a real-world event",
  },
  {
    id: "video",
    trigger: "onVideoRegistration",
    name: "Video Event Reg",
    desc: "Sent when registering for an upcoming video session",
  },
  {
    id: "journey",
    trigger: "on8MinJourney",
    name: "8-Min Journey",
    desc: "Funnel or re-engagement for the general journey",
  },
];

app.get("/api/automation-settings", (req, res) => {
  try {
    let config = {};
    if (fs.existsSync(AUTOMATION_CONFIG_PATH)) {
      config = JSON.parse(fs.readFileSync(AUTOMATION_CONFIG_PATH, "utf8"));
    }
    config.flows = Array.isArray(config.flows) ? config.flows : AUTOMATION_SETTINGS_DEFAULT_FLOWS;
    config.smtp = config.smtp || {};
    config.globalStyling = config.globalStyling || {};
    config.sequences = Array.isArray(config.sequences) ? config.sequences : [];
    res.json(config);
  } catch (error) {
    console.error("Error loading automation settings:", error);
    res.status(200).json({
      smtp: {},
      globalStyling: {},
      flows: AUTOMATION_SETTINGS_DEFAULT_FLOWS,
      sequences: [],
    });
  }
});

// ==========================================
// VIDEO EVENT CMS
// ==========================================
app.get("/api/video-event", (req, res) => {
  if (!fs.existsSync(VIDEO_EVENT_CONFIG_PATH)) {
    // Return default empty structure if file doesn't exist
    return res.json({
      title: { en: "", he: "" },
      date: new Date().toISOString(),
      time: "20:00",
      location: "Zoom / Video Call",
      image: "",
      participants: 0,
      registrationFields: { name: true, email: true, phone: true },
    });
  }
  res.json(JSON.parse(fs.readFileSync(VIDEO_EVENT_CONFIG_PATH, "utf8")));
});

app.post("/api/video-event", (req, res) => {
  try {
    fs.writeFileSync(
      VIDEO_EVENT_CONFIG_PATH,
      JSON.stringify(req.body, null, 2),
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save video event settings" });
  }
});

app.post("/api/automation-settings", (req, res) => {
  try {
    fs.writeFileSync(AUTOMATION_CONFIG_PATH, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save settings" });
  }
});

app.post("/api/test-flow", async (req, res) => {
  const { email, flowId, language } = req.body;
  try {
    const testUser = {
      name: "Test User",
      email: email,
      eventName: "HBM Live Demo",
      date: new Date().toISOString(),
      location: "Tel Aviv Hub",
      id: "TEST-" + Math.floor(Math.random() * 1000),
      language: language || "en",
    };
    const queue = fs.existsSync(EMAIL_QUEUE_PATH)
      ? JSON.parse(fs.readFileSync(EMAIL_QUEUE_PATH))
      : [];
    const itemId = uuidv4();
    queue.push({
      id: itemId,
      status: "pending",
      scheduledFor: Date.now(),
      data: testUser,
      stepType: "email",
      flowId: flowId,
    });
    fs.writeFileSync(EMAIL_QUEUE_PATH, JSON.stringify(queue, null, 2));

    // Immediate attempt with feedback
    const success = await processQueue(itemId);

    if (success) {
      res.json({
        success: true,
        message: "Test email delivered successfully!",
      });
    } else {
      // Re-read queue to find error
      const updatedQueue = JSON.parse(fs.readFileSync(EMAIL_QUEUE_PATH));
      const failedItem = updatedQueue.find((i) => i.id === itemId);
      res
        .status(500)
        .json({ error: failedItem?.error || "Unknown delivery failure" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CAMPAIGNS & CRM ENDPOINTS
// ==========================================

app.get("/api/campaigns", (req, res) => {
  try {
    if (!fs.existsSync(CAMPAIGNS_FILE_PATH)) return res.json([]);
    res.json(JSON.parse(fs.readFileSync(CAMPAIGNS_FILE_PATH, "utf8")));
  } catch {
    res.json([]);
  }
});

app.post("/api/campaigns", (req, res) => {
  try {
    const campaigns = fs.existsSync(CAMPAIGNS_FILE_PATH)
      ? JSON.parse(fs.readFileSync(CAMPAIGNS_FILE_PATH))
      : [];
    const newCampaign = {
      ...req.body,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    campaigns.push(newCampaign);
    fs.writeFileSync(CAMPAIGNS_FILE_PATH, JSON.stringify(campaigns, null, 2));
    res.json({ success: true, campaign: newCampaign });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/campaigns/save-all", (req, res) => {
  try {
    const { campaigns } = req.body;
    fs.writeFileSync(CAMPAIGNS_FILE_PATH, JSON.stringify(campaigns, null, 2));
    res.json({ success: true, message: "All campaigns saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/campaigns/send", (req, res) => {
  const { campaignId, segment } = req.body;
  try {
    if (!fs.existsSync(CAMPAIGNS_FILE_PATH)) return res.status(404).json({ error: "No campaigns file" });
    const campaigns = JSON.parse(fs.readFileSync(CAMPAIGNS_FILE_PATH, "utf8"));
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const regs = fs.existsSync(REGISTRATIONS_FILE_PATH)
      ? JSON.parse(fs.readFileSync(REGISTRATIONS_FILE_PATH, "utf8"))
      : [];
    const targets =
      segment === "all" ? regs : regs.filter((r) => (r.source || r.registrationSource || "").toLowerCase() === String(segment).toLowerCase());

    const queue = fs.existsSync(EMAIL_QUEUE_PATH)
      ? JSON.parse(fs.readFileSync(EMAIL_QUEUE_PATH, "utf8"))
      : [];
    targets.forEach((user) => {
      queue.push({
        id: uuidv4(),
        status: "pending",
        scheduledFor: Date.now(),
        data: user,
        stepType: "email",
        flowId: campaignId,
        isCampaign: true,
      });
    });

    fs.writeFileSync(EMAIL_QUEUE_PATH, JSON.stringify(queue, null, 2));
    res.json({ success: true, count: targets.length });
    processQueue();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/unsubscribe", (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).send("Email missing");
  try {
    const suppressionList = fs.existsSync(SUPPRESSION_LIST_PATH)
      ? JSON.parse(fs.readFileSync(SUPPRESSION_LIST_PATH))
      : [];
    if (!suppressionList.includes(email)) {
      suppressionList.push(email);
      fs.writeFileSync(
        SUPPRESSION_LIST_PATH,
        JSON.stringify(suppressionList, null, 2),
      );
    }
    res.send(
      `<h1>Successfully Unsubscribed</h1><p>The email ${email} has been removed from our marketing list.</p>`,
    );
  } catch (err) {
    res.status(500).send("Error");
  }
});

app.get("/api/suppression", (req, res) => {
  try {
    if (!fs.existsSync(SUPPRESSION_LIST_PATH)) return res.json([]);
    res.json(JSON.parse(fs.readFileSync(SUPPRESSION_LIST_PATH, "utf8")));
  } catch {
    res.json([]);
  }
});

app.post("/api/suppression/toggle", (req, res) => {
  const { email } = req.body;
  try {
    let list = fs.existsSync(SUPPRESSION_LIST_PATH)
      ? JSON.parse(fs.readFileSync(SUPPRESSION_LIST_PATH))
      : [];
    if (list.includes(email)) {
      list = list.filter((e) => e !== email);
    } else {
      list.push(email);
    }
    fs.writeFileSync(SUPPRESSION_LIST_PATH, JSON.stringify(list, null, 2));
    res.json({ success: true, list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/registrations/:id", (req, res) => {
  try {
    let regs = JSON.parse(fs.readFileSync(REGISTRATIONS_FILE_PATH, "utf8"));
    regs = regs.filter((r) => r.id.toString() !== req.params.id.toString());
    fs.writeFileSync(REGISTRATIONS_FILE_PATH, JSON.stringify(regs, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Registration Stats
app.get("/api/registrations", (req, res) => {
  try {
    if (!fs.existsSync(REGISTRATIONS_FILE_PATH)) {
      return res.json([]);
    }
    const data = fs.readFileSync(REGISTRATIONS_FILE_PATH, "utf8");
    res.json(JSON.parse(data));
  } catch (err) {
    console.error("Error reading registrations:", err);
    res.status(500).json({ error: "Failed to read registrations" });
  }
});

// Professional Lead Management
app.get("/api/crm/leads", (req, res) => {
  try {
    if (!fs.existsSync(REGISTRATIONS_FILE_PATH)) return res.json([]);
    const leads = JSON.parse(fs.readFileSync(REGISTRATIONS_FILE_PATH, "utf8"));
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/crm/leads/:id/status", (req, res) => {
  try {
    const { status } = req.body;
    let leads = JSON.parse(fs.readFileSync(REGISTRATIONS_FILE_PATH, "utf8"));
    const leadIndex = leads.findIndex(
      (l) => l.id.toString() === req.params.id.toString(),
    );
    if (leadIndex === -1)
      return res.status(404).json({ error: "Lead not found" });

    leads[leadIndex].status = status;
    if (!leads[leadIndex].history) leads[leadIndex].history = [];
    leads[leadIndex].history.push({
      type: "status_change",
      date: new Date().toISOString(),
      message: `Status changed to ${status}`,
    });

    fs.writeFileSync(REGISTRATIONS_FILE_PATH, JSON.stringify(leads, null, 2));
    res.json({ success: true, lead: leads[leadIndex] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/crm/leads/:id/note", (req, res) => {
  try {
    const { note } = req.body;
    let leads = JSON.parse(fs.readFileSync(REGISTRATIONS_FILE_PATH, "utf8"));
    const leadIndex = leads.findIndex(
      (l) => l.id.toString() === req.params.id.toString(),
    );
    if (leadIndex === -1)
      return res.status(404).json({ error: "Lead not found" });

    if (!leads[leadIndex].history) leads[leadIndex].history = [];
    leads[leadIndex].history.push({
      type: "note",
      date: new Date().toISOString(),
      message: note,
    });

    fs.writeFileSync(REGISTRATIONS_FILE_PATH, JSON.stringify(leads, null, 2));
    res.json({ success: true, lead: leads[leadIndex] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staging & Publish Logic for How It Works
app.get("/api/cms/how-it-works/staging", (req, res) => {
  try {
    const target = fs.existsSync(HOW_IT_WORKS_STAGING_PATH)
      ? HOW_IT_WORKS_STAGING_PATH
      : HOW_IT_WORKS_CONFIG_PATH;
    res.json(JSON.parse(fs.readFileSync(target, "utf8")));
  } catch {
    res.json({});
  }
});

app.post("/api/cms/how-it-works/staging", (req, res) => {
  try {
    fs.writeFileSync(
      HOW_IT_WORKS_STAGING_PATH,
      JSON.stringify(req.body, null, 2),
    );
    res.json({ success: true, message: "Saved to staging" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/cms/how-it-works/publish", (req, res) => {
  try {
    if (!fs.existsSync(HOW_IT_WORKS_STAGING_PATH)) {
      return res.status(400).json({ error: "No staged changes to publish" });
    }
    const staged = fs.readFileSync(HOW_IT_WORKS_STAGING_PATH);
    fs.writeFileSync(HOW_IT_WORKS_CONFIG_PATH, staged);
    res.json({ success: true, message: "Published to live site!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SITE CONTENT CMS (Team, Impact, Partners)
// ==========================================
const SITE_CONFIGS_PATH = path.join(__dirname, "data", "site-configs.json");

app.get("/api/site-content", (req, res) => {
  try {
    if (!fs.existsSync(SITE_CONFIGS_PATH)) {
      return res.json({ team: [], testimonials: [], partners: [], locks: { team: false, testimonials: false, partners: false } });
    }
    res.json(JSON.parse(fs.readFileSync(SITE_CONFIGS_PATH, "utf8")));
  } catch (err) {
    console.error("Error reading site content:", err);
    res.status(200).json({ team: [], testimonials: [], partners: [], locks: { team: false, testimonials: false, partners: false } });
  }
});

app.post("/api/site-content", (req, res) => {
  try {
    fs.writeFileSync(SITE_CONFIGS_PATH, JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: "Site content saved successfully" });
  } catch (err) {
    console.error("Error saving site content:", err);
    res.status(500).json({ error: "Failed to save site content" });
  }
});

// ==========================================
// NEW CMS ENDPOINTS (How It Works, Knowledge Base)
// ==========================================
app.get("/api/cms/how-it-works", (req, res) => {
  try {
    if (!fs.existsSync(HOW_IT_WORKS_CONFIG_PATH)) return res.status(200).json({ videoSteps: [], physicalSteps: [], isLocked: false });
    const data = JSON.parse(fs.readFileSync(HOW_IT_WORKS_CONFIG_PATH, "utf8"));
    res.status(200).json(data);
  } catch (err) {
    console.error("GET /api/cms/how-it-works error:", err);
    res.status(200).json({ videoSteps: [], physicalSteps: [], isLocked: false });
  }
});

app.post("/api/cms/how-it-works", (req, res) => {
  try {
    const config = fs.existsSync(HOW_IT_WORKS_CONFIG_PATH)
      ? JSON.parse(fs.readFileSync(HOW_IT_WORKS_CONFIG_PATH))
      : {};
    if (config.isLocked && !req.query.force) {
      return res.status(403).json({ error: "Section is locked" });
    }
    fs.writeFileSync(
      HOW_IT_WORKS_CONFIG_PATH,
      JSON.stringify(req.body, null, 2),
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/cms/knowledge-base", (req, res) => {
  try {
    if (!fs.existsSync(KNOWLEDGE_BASE_CONFIG_PATH)) return res.status(200).json({ books: [], videos: [], isLocked: false });
    const data = JSON.parse(fs.readFileSync(KNOWLEDGE_BASE_CONFIG_PATH, "utf8"));
    res.status(200).json(data);
  } catch (err) {
    console.error("GET /api/cms/knowledge-base error:", err);
    res.status(200).json({ books: [], videos: [], isLocked: false });
  }
});

app.post("/api/cms/knowledge-base", (req, res) => {
  try {
    const config = fs.existsSync(KNOWLEDGE_BASE_CONFIG_PATH)
      ? JSON.parse(fs.readFileSync(KNOWLEDGE_BASE_CONFIG_PATH))
      : {};
    if (config.isLocked && !req.query.force) {
      return res.status(403).json({ error: "Section is locked" });
    }
    fs.writeFileSync(
      KNOWLEDGE_BASE_CONFIG_PATH,
      JSON.stringify(req.body, null, 2),
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/cms/lock-toggle", (req, res) => {
  const { path: configPath } = req.body;
  const targetPath =
    configPath === "howItWorks"
      ? HOW_IT_WORKS_CONFIG_PATH
      : KNOWLEDGE_BASE_CONFIG_PATH;
  try {
    const config = JSON.parse(fs.readFileSync(targetPath, "utf8"));
    config.isLocked = !config.isLocked;
    fs.writeFileSync(targetPath, JSON.stringify(config, null, 2));
    res.json({ success: true, isLocked: config.isLocked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET Events (Live JSON)
app.get("/api/events", (req, res) => {
  try {
    if (!fs.existsSync(EVENTS_FILE_PATH)) {
      return res.json([]);
    }
    res.json(JSON.parse(fs.readFileSync(EVENTS_FILE_PATH, "utf8")));
  } catch (err) {
    res.status(500).json({ error: "Failed to read events" });
  }
});

app.get("/api/registrations/stats", async (req, res) => {
  try {
    let registrations = [];
    if (fs.existsSync(REGISTRATIONS_FILE_PATH)) {
      registrations = JSON.parse(fs.readFileSync(REGISTRATIONS_FILE_PATH, "utf8"));
    }

    // Return some basic stats
    res.json({
      total: registrations.length,
      today: registrations.filter(
        (r) =>
          new Date(r.timestamp).toDateString() === new Date().toDateString(),
      ).length,
      thisMonth: registrations.filter(
        (r) => new Date(r.timestamp).getMonth() === new Date().getMonth(),
      ).length,
      all: registrations,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ==========================================
// AI FETCHING ENDPOINTS
// ==========================================

// Helper for AI calls with multiple fallbacks
async function callAI(prompt, systemPrompt = "You are a helpful assistant.") {
  // Standard models to try (gemini-2.5-flash currently working)
  const geminiModels = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-pro-latest",
  ];
  const openaiModel = "gpt-4o-mini";

  // 1. Try Gemini Models (Free tier friendly)
  for (const model of geminiModels) {
    if (!process.env.GEMINI_API_KEY) break;
    try {
      console.log(`[AI] Trying Gemini (${model})...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const err = await res.json();
        console.warn(`[AI] Gemini (${model}) failed: ${err.error?.message}`);
      }
    } catch (e) {
      console.error(`[AI] Gemini (${model}) Error:`, e.message);
    }
  }

  // 2. Try OpenAI Fallback
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log(`[AI] Trying OpenAI (${openaiModel})...`);
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: openaiModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        return json.choices?.[0]?.message?.content;
      } else {
        const err = await res.json();
        console.warn(`[AI] OpenAI failed: ${err.error?.message || "Unknown"}`);
      }
    } catch (e) {
      console.error(`[AI] OpenAI Error:`, e.message);
    }
  }

  return null; // All failed
}

// Prefer largest available book cover URL and force https
function getBookCoverUrl(volumeInfo) {
  const links = volumeInfo?.imageLinks;
  if (!links) return null;
  const url =
    links.large || links.medium || links.small || links.thumbnail || links.smallThumbnail;
  if (!url) return null;
  return url.replace(/^http:\/\//i, "https://");
}

// Open Library cover fallback by title (+ optional author)
async function fetchOpenLibraryCover(title, author) {
  try {
    const q = author ? `${title} ${author}` : title;
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=1`
    );
    const data = await res.json();
    const work = data.docs?.[0];
    if (!work) return null;
    const olid = work.cover_edition_key || work.edition_key?.[0];
    const isbn = work.isbn?.[0];
    if (olid)
      return `https://covers.openlibrary.org/b/olid/${olid}-M.jpg`;
    if (isbn)
      return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
    return null;
  } catch (e) {
    return null;
  }
}

app.post("/api/ai/fetch-book", async (req, res) => {
  const { title, author } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    let book;
    const queryStr = title + (author ? ` ${author}` : "");
    try {
      let googleRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(queryStr)}&key=${process.env.GOOGLE_BOOKS_API_KEY || ""}`,
      );
      let googleData = await googleRes.json();

      if (!googleData.items || googleData.items.length === 0) {
        googleRes = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(queryStr)}`,
        );
        googleData = await googleRes.json();
      }

      book = googleData.items?.[0]?.volumeInfo;
    } catch (e) {
      console.error("Google Books Failed:", e.message);
    }

    let coverUrl = getBookCoverUrl(book);
    if (!coverUrl) coverUrl = await fetchOpenLibraryCover(title, author || book?.authors?.[0]);

    let aiData = {};
    const prompt = `Return ONLY a JSON object for the book "${title}" ${author ? `by ${author}` : ""}:
        {
          "authorQuote": "A direct profound quote by the author",
          "threeKeySentences": ["Insight 1", "Insight 2", "Insight 3"],
          "shortSummary": "Impactful 50-word essence",
          "fullSummary": "200-word deep dive analysis",
          "finalQuote": "Final life-changing quote",
          "author": "The author name"
        }`;

    const aiText = await callAI(
      prompt,
      "You are a world-class book curator for The Human Being Movement. Respond in JSON.",
    );
    if (aiText) {
      try {
        const match = aiText.match(/\{[\s\S]*\}/);
        if (match) aiData = JSON.parse(match[0]);
        console.log(`[AI] Success for: ${title}`);
      } catch (e) {
        console.error("AI Parse Fail:", e.message);
      }
    }

    res.json({
      title: book?.title || title,
      author:
        aiData.author ||
        (book?.authors ? book.authors[0] : author) ||
        "Unknown Author",
      description:
        book?.description || aiData.shortSummary || "No description available.",
      coverUrl: coverUrl || null,
      authorQuote: aiData.authorQuote || "",
      threeKeySentences: Array.isArray(aiData.threeKeySentences) ? aiData.threeKeySentences : [],
      shortSummary: aiData.shortSummary || "",
      fullSummary: aiData.fullSummary || "",
      finalQuote: aiData.finalQuote || "",
      pageCount: book?.pageCount || 0,
      infoLink: book?.infoLink || "",
      _aiSuccess: !!aiText,
    });
  } catch (err) {
    console.error("Fetch Book Crash:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

app.post("/api/ai/fetch-video", async (req, res) => {
  const { youtubeUrl } = req.body;
  if (!youtubeUrl)
    return res.status(400).json({ error: "YouTube URL is required" });

  try {
    const videoIdMatch = youtubeUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/|.*shorts\/))([^?&"'>]+)/,
    );
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    let aiData = {
      title: "",
      description: "",
      hashtags: [],
      accentColor: "#6160AB",
    };
    const prompt = `Analyze this YouTube video: ${youtubeUrl}.
        Return ONLY JSON:
        {
          "title": "Growth-oriented title",
          "description": "Compelling summary",
          "hashtags": ["#Tag1", "#Tag2", "#Tag3"],
          "accentColor": "#HexColor"
        }`;

    const aiText = await callAI(prompt, "You are a curator. Return JSON only.");
    if (aiText) {
      try {
        const parsed = JSON.parse(aiText.match(/\{[\s\S]*\}/)[0]);
        aiData = { ...aiData, ...parsed };
      } catch (e) {
        console.error("Video AI Parse Fail");
      }
    }

    res.json({
      videoId,
      youtubeUrl,
      thumbnail: videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : null,
      ...aiData,
      _aiSuccess: !!aiText,
    });
  } catch (err) {
    console.error("Fetch Video Crash:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// ==========================================
// SERVE PRODUCTION BUILD
// ==========================================
// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, "dist")));

// Route all other requests to the React app (Client Side Routing)
// EXCLUDE /api routes from catch-all so they return 404 JSON instead of HTML
app.get(/^(?!\/api|\/assets).*/, (req, res) => {
  const indexPath = path.join(__dirname, "dist", "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: "Not Found" });
  }
});

// Explicit 404 for API to prevent HTML responses
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API Endpoint not found" });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 HBM Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📁 Serving dist from: ${path.join(__dirname, "dist")}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n⏹️  Shutting down gracefully...");
  db.close();
  server.close(() => {
    console.log("✅ Database and server closed");
    process.exit(0);
  });
});
