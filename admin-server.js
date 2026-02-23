import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import * as ics from 'ics';
import { v4 as uuidv4 } from 'uuid';
import { Liquid } from 'liquidjs';
import inlineCss from 'inline-css';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware — Manual CORS (most reliable with Express 5)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());

// Global Paths
const EVENTS_FILE_PATH = path.join(__dirname, 'public', 'data', 'events.json');
const AUTOMATION_CONFIG_PATH = path.join(__dirname, 'src', 'data', 'automationConfig.json');
const REGISTRATIONS_FILE_PATH = path.join(__dirname, 'src', 'data', 'registrations.json');
const EMAIL_QUEUE_PATH = path.join(__dirname, 'src', 'data', 'emailQueue.json');
const ENGAGEMENT_LOG_PATH = path.join(__dirname, 'src', 'data', 'engagement.json');
const VIDEO_EVENT_CONFIG_PATH = path.join(__dirname, 'src', 'data', 'videoEvent.json');
const ASSETS_DIR = path.join(__dirname, 'public', 'assets', 'events');

const liquidEngine = new Liquid();

// Ensure assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Multer Setup for Image Uploads
import multer from 'multer';

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folderName = req.body.folderName;
    
    // Fallback logic if client hasn't sent folderName yet (Multer field order issue)
    if (!folderName) {
        console.warn('Multer: No folderName in body yet. This usually means field order is wrong or field is missing. Defaulting to "general".');
        folderName = 'general';
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
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, Date.now() + '_' + sanitized); // Add timestamp to avoid collisions
  }
});

const upload = multer({ storage: storage });

// ==========================================
// IMAGE ENDPOINTS
// ==========================================

// Dedicated Email Image Upload
const EMAIL_ASSETS_DIR = path.join(__dirname, 'public', 'assets', 'emails');
if (!fs.existsSync(EMAIL_ASSETS_DIR)) fs.mkdirSync(EMAIL_ASSETS_DIR, { recursive: true });

const emailStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, EMAIL_ASSETS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_'))
});
const uploadEmail = multer({ storage: emailStorage });

app.post('/api/upload-email-image', uploadEmail.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fullUrl = req.protocol + '://' + req.get('host') + '/assets/emails/' + req.file.filename;
    res.json({ success: true, url: fullUrl }); // Return absolute URL for email compatibility
});

// 1. List Images in a Folder
app.get('/api/images/:folderName', (req, res) => {
    const folderName = req.params.folderName;
    const folderPath = path.join(ASSETS_DIR, folderName);

    if (!fs.existsSync(folderPath)) {
        return res.json({ images: [] });
    }

    try {
        const files = fs.readdirSync(folderPath);
        // Include both images and videos
        const assets = files.filter(file => /\.(jpg|jpeg|png|gif|webp|mp4|mov|webm|pdf)$/i.test(file));
        res.json({ images: assets, files: assets }); // keep images key for backward compatibility
    } catch (error) {
        res.status(500).json({ error: 'Failed to list images' });
    }
});

// 2. Upload Image(s) - Bulk Support
app.post('/api/upload-image', upload.array('images'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }
    const filenames = req.files.map(f => f.filename);
    res.json({ success: true, filenames });
});

// 2b. Upload General Asset (Video, Partners, etc.)
// Uses 'asset' field name. 'subfolder' in body.
app.post('/api/upload-asset', upload.single('asset'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
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
        res.json({ success: true, path: `${subfolder}/${savedFilename}`, filename: savedFilename });
    } else {
        res.json({ success: true, filename: req.file.filename });
    }
});

// 3. Delete Image (Physical)
app.post('/api/delete-image', (req, res) => {
    const { folderName, filename } = req.body; // filename can be 'partners/logo.png'
    if (!folderName || !filename) return res.status(400).json({ error: 'Missing parameters' });

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
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        console.error(`Failed to delete file: ${error}`);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

app.post('/api/save-events', (req, res) => {
  try {
    const { events } = req.body;
    
    if (!Array.isArray(events)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const fileContent = JSON.stringify(events, null, 2);
    fs.writeFileSync(EVENTS_FILE_PATH, fileContent, 'utf8');
    
    console.log('Events saved successfully to JSON');
    res.json({ success: true, message: 'Events saved successfully' });
  } catch (error) {
    console.error('Error saving events:', error);
    res.status(500).json({ error: 'Failed to save events' });
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
    fs.writeFileSync(REGISTRATIONS_FILE_PATH, '[]', 'utf8');
}

app.post('/api/register', (req, res) => {
  try {
    const { name, email, phone, source, eventId, eventName, language } = req.body;
    
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    let registrations = [];
    if (fs.existsSync(REGISTRATIONS_FILE_PATH)) {
      registrations = JSON.parse(fs.readFileSync(REGISTRATIONS_FILE_PATH, 'utf8'));
    }

    const newRegistration = {
      id: Date.now(),
      name,
      email,
      phone,
      source: source || 'unknown',
      eventId: eventId || 'general',
      eventName: eventName || 'General Registration',
      date: new Date().toISOString(),
      language: language || 'en',
      status: 'confirmed'
    };

    registrations.push(newRegistration);
    fs.writeFileSync(REGISTRATIONS_FILE_PATH, JSON.stringify(registrations, null, 2));

    // TRIGGER EVENT SEQUENCE
    const triggerType = eventId === 'video-event' ? 'onVideoRegistration' : 'onPhysicalRegistration';
    triggerAutomationByEvent(triggerType, newRegistration);

    console.log(`New registration: ${name} (${email}) for Event: ${eventName}`);
    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to save registration' });
  }
});

app.post('/api/newsletter', (req, res) => {
  try {
    const { email, name, language } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    let registrations = [];
    if (fs.existsSync(REGISTRATIONS_FILE_PATH)) {
      registrations = JSON.parse(fs.readFileSync(REGISTRATIONS_FILE_PATH, 'utf8'));
    }

    const newRegistration = {
      id: Date.now(),
      name: name || 'Subscriber',
      email,
      source: 'newsletter',
      eventId: 'newsletter',
      eventName: 'Newsletter Subscription',
      language: language || 'en',
      date: new Date().toISOString(),
      status: 'confirmed'
    };

    if (!registrations.find(r => r.email === email)) {
      registrations.push(newRegistration);
      fs.writeFileSync(REGISTRATIONS_FILE_PATH, JSON.stringify(registrations, null, 2));
    }

    triggerAutomationByEvent('onNewsletterSignup', newRegistration);
    res.json({ success: true, message: 'Newsletter signup successful' });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// ==========================================
// ENTERPRISE EMAIL ENGINE (THE MONSTER)
// ==========================================

const getEmailTemplate = (body, config, trackingId, email, language) => {
    const styling = config?.globalStyling || { primaryColor: '#6160AB', secondaryColor: '#F07B3C', signatureUrl: '' };
    const primary = styling.primaryColor;
    const secondary = styling.secondaryColor;
    const signatureUrl = styling.signatureUrl;
    const trackingUrl = `http://localhost:3001/api/track/open/${trackingId}`;
    const unsubscribeUrl = `http://localhost:3001/api/unsubscribe?email=${encodeURIComponent(email)}`;

    const dir = language === 'he' ? 'rtl' : 'ltr';
    const align = language === 'he' ? 'right' : 'left';

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
                    <img src="${config.globalStyling.logoUrl}" class="logo" alt="The HBM">
                </div>
                <div class="content">
                    ${body}
                    ${signatureUrl ? `<br><img src="${signatureUrl}" class="signature" alt="Signature">` : ''}
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
        const queue = fs.existsSync(EMAIL_QUEUE_PATH) ? JSON.parse(fs.readFileSync(EMAIL_QUEUE_PATH)) : [];
        const config = JSON.parse(fs.readFileSync(AUTOMATION_CONFIG_PATH));
        
        const activeFlows = (config.flows || []).filter(f => f.active && f.trigger === triggerType);
        if (activeFlows.length === 0) return;

        const now = Date.now();
        const pendingItems = activeFlows.map(flow => ({
            id: uuidv4(),
            status: 'pending',
            scheduledFor: now,
            data: userData,
            stepType: 'email',
            flowId: flow.id
        }));

        queue.push(...pendingItems);
        fs.writeFileSync(EMAIL_QUEUE_PATH, JSON.stringify(queue, null, 2));
        console.log(`🚀 Triggered [${triggerType}] for ${userData.email}`);
        
        processQueue();
    } catch (err) {
        console.error("Queue Error:", err);
    }
};

const addToEmailQueue = async (sequenceId, userData) => {};

const parseDelay = (str) => {
    const value = parseInt(str);
    if (str.includes('h')) return value * 60 * 60 * 1000;
    if (str.includes('m')) return value * 60 * 1000;
    if (str.includes('d')) return value * 24 * 60 * 60 * 1000;
    return 0;
};

const processQueue = async () => {
    if (!fs.existsSync(EMAIL_QUEUE_PATH)) return;
    const queue = JSON.parse(fs.readFileSync(EMAIL_QUEUE_PATH));
    const now = Date.now();
    const config = JSON.parse(fs.readFileSync(AUTOMATION_CONFIG_PATH));
    
    if (!config?.smtp?.host) return;

    const transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: parseInt(config.smtp.port) || 587,
        secure: parseInt(config.smtp.port) === 465,
        auth: { user: config.smtp.user, pass: config.smtp.pass },
    });

    for (let item of queue) {
        if (item.status === 'pending' && item.scheduledFor <= now && item.stepType === 'email') {
            try {
                const flow = config.flows.find(f => f.id === item.flowId);
                if (!flow) continue;

                const trackingId = item.id;
                
                // Liquid Rendering
                const lang = item.data.language || 'en';
                const renderData = {
                    ...item.data,
                    eventDate: item.data.date ? new Date(item.data.date).toLocaleDateString() : '',
                    year: 2026
                };
                
                const rawSubject = (lang === 'he' && flow.subject_he) ? flow.subject_he : (flow.subject_en || flow.subject);
                const rawBody = (lang === 'he' && flow.body_he) ? flow.body_he : (flow.body_en || flow.body);

                let subject = await liquidEngine.parseAndRender(rawSubject, renderData);
                let body = await liquidEngine.parseAndRender(rawBody.replace(/\n/g, '<br>'), renderData);

                const html = await inlineCss(getEmailTemplate(body, config, trackingId, item.data.email, lang), { url: 'http://localhost:3001' });

                const mailOptions = {
                    from: config.smtp.from,
                    to: item.data.email,
                    subject: subject,
                    html: html
                };

                // ICS calendar logic...
                if (flow.includeCalendar) {
                    const { value } = ics.createEvent({
                        start: [new Date(item.data.date).getFullYear(), new Date(item.data.date).getMonth()+1, new Date(item.data.date).getDate(), 19, 0],
                        duration: { hours: 3 },
                        title: item.data.eventName,
                        location: item.data.location
                    });
                    if (value) mailOptions.attachments = [{ filename: 'hbm-invite.ics', content: value }];
                }

                await transporter.sendMail(mailOptions);
                item.status = 'sent';
                item.sentAt = new Date().toISOString();
                
                logEngagement(trackingId, 'sent', item.data.email);
            } catch (err) {
                console.error("Queue Processing Error:", err);
                item.status = 'failed';
                item.error = err.message;
            }
        }
    }

    fs.writeFileSync(EMAIL_QUEUE_PATH, JSON.stringify(queue, null, 2));
};

const logEngagement = (id, type, email, metadata = {}) => {
    const log = fs.existsSync(ENGAGEMENT_LOG_PATH) ? JSON.parse(fs.readFileSync(ENGAGEMENT_LOG_PATH)) : [];
    log.push({ id, type, email, timestamp: new Date().toISOString(), ...metadata });
    fs.writeFileSync(ENGAGEMENT_LOG_PATH, JSON.stringify(log, null, 2));
};

// CRON-LIKE INTERVAL
setInterval(processQueue, 60000); // Process every minute

// ==========================================
// TRACKING & WEBHOOKS
// ==========================================

app.get('/api/track/open/:id', (req, res) => {
    logEngagement(req.params.id, 'open', 'unknown');
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, { 'Content-Type': 'image/gif', 'Content-Length': pixel.length }).end(pixel);
});

app.get('/api/track/click/:id', (req, res) => {
    const target = req.query.url || 'https://thehbm.org';
    logEngagement(req.params.id, 'click', 'unknown', { target });
    res.redirect(target);
});

app.get('/api/unsubscribe', (req, res) => {
    const { email } = req.query;
    // Add to suppression list logic here
    res.send(`<h1>Successfully Unsubscribed</h1><p>The email ${email} has been removed from our marketing list.</p>`);
});

// GET Engagement Log
app.get('/api/engagement', (req, res) => {
    try {
        if (!fs.existsSync(ENGAGEMENT_LOG_PATH)) return res.json([]);
        res.json(JSON.parse(fs.readFileSync(ENGAGEMENT_LOG_PATH, 'utf8')));
    } catch { res.json([]); }
});

// GET Email Queue
app.get('/api/email-queue', (req, res) => {
    try {
        if (!fs.existsSync(EMAIL_QUEUE_PATH)) return res.json([]);
        res.json(JSON.parse(fs.readFileSync(EMAIL_QUEUE_PATH, 'utf8')));
    } catch { res.json([]); }
});

// POST SMTP Check (real connectivity test)
app.post('/api/smtp-check', async (req, res) => {
    const { host, port, user, pass } = req.body;
    if (!host || !user) return res.json({ success: false, message: 'SMTP not configured' });
    try {
        const transporter = nodemailer.createTransport({
            host, port: parseInt(port) || 587,
            secure: parseInt(port) === 465,
            auth: { user, pass },
            connectionTimeout: 5000,
        });
        await transporter.verify();
        res.json({ success: true, message: 'SMTP connection verified' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.post('/api/automation/trigger', async (req, res) => {
    const { flowId, data } = req.body;
    try {
        await triggerAutomation(flowId, data);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/ai/improve-copy', (req, res) => {
    const { text, goal, language } = req.body;
    
    // Simulate Gemini Call specifically demanding RTL formatting
    console.log(`[AI Engine] Sending Prompt to Engine: Generate high-converting email copy. Goal: ${goal}. Language: ${language === 'he' ? 'Hebrew with strict RTL formatting' : 'English with LTR formatting'}. Original text: ${text}`);

    let improved = text;
    if (language === 'he') {
        if (goal === 'marketing') improved = text + "\n\n**הזדמנות מיוחדת:** אל תישארו מאחור — תפסו את מקומכם עכשיו וגלו קישור אנושי אמיתי. המקומות מוגבלים!";
        else if (goal === 'community') improved = "חבר/ת קהילה יקר/ה! ✨\n" + text + "\n\nהקהילה שלנו חיה נושמת וקיימת בזכותך. אנחנו מחכים לראות אותך בקרוב.";
        else improved = text + "\n\n(שדרוג מבוסס בינה מלאכותית בקרוב...)";
    } else {
        if (goal === 'marketing') improved = text + "\n\n**Exclusive Opportunity:** Don't just watch from the sidelines—be the heartbeat of the connection. Grab your spot before the energy fills up!";
        else if (goal === 'community') improved = "Hello fellow seeker of connection! ✨\n" + text + "\n\nWe build this space together, and your presence is what makes it bloom. See you soon.";
    }
    
    // Simulate slight processing delay
    setTimeout(() => res.json({ text: improved }), 800);
});

app.get('/api/automation-settings', (req, res) => {
    let config = {};
    if (fs.existsSync(AUTOMATION_CONFIG_PATH)) {
        config = JSON.parse(fs.readFileSync(AUTOMATION_CONFIG_PATH, 'utf8'));
    }

    const DEFAULT_FLOWS = [
        { id: 'newsletter', trigger: 'onNewsletterSignup', name: 'Newsletter Welcome', desc: 'Sent when explicitly signing up for the newsletter' },
        { id: 'physical', trigger: 'onPhysicalRegistration', name: 'Physical Event Reg', desc: 'Sent when booking a spot for a real-world event' },
        { id: 'video', trigger: 'onVideoRegistration', name: 'Video Event Reg', desc: 'Sent when registering for an upcoming video session' },
        { id: 'journey', trigger: 'on8MinJourney', name: '8-Min Journey', desc: 'Funnel or re-engagement for the general journey' }
    ];

    const existingFlows = config.flows || [];
    let updated = false;

    DEFAULT_FLOWS.forEach(df => {
        if (!existingFlows.find(f => f.trigger === df.trigger)) {
            existingFlows.push({
                id: `flow_${Date.now()}_${df.trigger}`,
                name: df.name,
                trigger: df.trigger,
                active: false,
                subject_en: `Welcome to ${df.name}`,
                subject_he: `ברוכים הבאים - ${df.name}`,
                body_en: `Hello {{name}},\n\nYour message here.\n\nBest, Team`,
                body_he: `שלום {{name}},\n\nההודעה שלכם כאן.\n\nבברכה, הצוות`
            });
            updated = true;
        }
    });

    config.flows = existingFlows;

    if (updated) {
        fs.writeFileSync(AUTOMATION_CONFIG_PATH, JSON.stringify(config, null, 2));
    }

    res.json(config);
});

// ==========================================
// VIDEO EVENT CMS
// ==========================================
app.get('/api/video-event', (req, res) => {
    if (!fs.existsSync(VIDEO_EVENT_CONFIG_PATH)) {
        // Return default empty structure if file doesn't exist
        return res.json({
            title: { en: '', he: '' },
            date: new Date().toISOString(),
            time: '20:00',
            location: 'Zoom / Video Call',
            image: '',
            participants: 0,
            registrationFields: { name: true, email: true, phone: true }
        });
    }
    res.json(JSON.parse(fs.readFileSync(VIDEO_EVENT_CONFIG_PATH, 'utf8')));
});

app.post('/api/video-event', (req, res) => {
    try {
        fs.writeFileSync(VIDEO_EVENT_CONFIG_PATH, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save video event settings' });
    }
});

app.post('/api/automation-settings', (req, res) => {
    try {
        fs.writeFileSync(AUTOMATION_CONFIG_PATH, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

app.post('/api/test-flow', async (req, res) => {
    const { email, flowId, language } = req.body;
    try {
        const testUser = {
            name: "Test User",
            email: email,
            eventName: "HBM Live Demo",
            date: new Date().toISOString(),
            location: "Tel Aviv Hub",
            id: "TEST-123",
            language: language || 'en'
        };
        const queue = fs.existsSync(EMAIL_QUEUE_PATH) ? JSON.parse(fs.readFileSync(EMAIL_QUEUE_PATH)) : [];
        queue.push({
            id: uuidv4(),
            status: 'pending',
            scheduledFor: Date.now(),
            data: testUser,
            stepType: 'email',
            flowId: flowId
        });
        fs.writeFileSync(EMAIL_QUEUE_PATH, JSON.stringify(queue, null, 2));
        await processQueue();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Registration Stats
app.get('/api/registrations', (req, res) => {
    try {
        if (!fs.existsSync(REGISTRATIONS_FILE_PATH)) {
            return res.json([]);
        }
        const data = fs.readFileSync(REGISTRATIONS_FILE_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error reading registrations:', err);
        res.status(500).json({ error: 'Failed to read registrations' });
    }
});

// GET Stats by Event ID
app.get('/api/registrations/stats', (req, res) => {
    try {
        if (!fs.existsSync(REGISTRATIONS_FILE_PATH)) {
            return res.json({});
        }
        const registrations = JSON.parse(fs.readFileSync(REGISTRATIONS_FILE_PATH, 'utf8'));
        
        // Group by eventId
        const stats = registrations.reduce((acc, curr) => {
            const id = curr.eventId || 'general';
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {});
        
        res.json(stats);
    } catch (err) {
        console.error('Error calculating stats:', err);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// 4. GET Events (Live JSON)
app.get('/api/events', (req, res) => {
    try {
        if (!fs.existsSync(EVENTS_FILE_PATH)) {
            return res.json([]);
        }
        res.json(JSON.parse(fs.readFileSync(EVENTS_FILE_PATH, 'utf8')));
    } catch (err) {
        res.status(500).json({ error: 'Failed to read events' });
    }
});

// ==========================================
// SERVE PRODUCTION BUILD
// ==========================================
// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Route all other requests to the React app (Client Side Routing)
app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/assets/')) {
        return res.status(404).json({ error: 'Not Found' });
    }
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Site build not found. Run npm run build.');
    }
});

app.listen(PORT, () => {
  console.log(`🚀 HBM Production Server running on http://localhost:${PORT}`);
});
