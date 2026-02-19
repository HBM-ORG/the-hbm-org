import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const EVENTS_FILE_PATH = path.join(__dirname, 'src', 'data', 'eventsConfig.js');
const ASSETS_DIR = path.join(__dirname, 'public', 'assets', 'events');

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

// 1. List Images in a Folder
app.get('/api/images/:folderName', (req, res) => {
    const folderName = req.params.folderName;
    const folderPath = path.join(ASSETS_DIR, folderName);

    if (!fs.existsSync(folderPath)) {
        return res.json({ images: [] });
    }

    try {
        const files = fs.readdirSync(folderPath);
        // Filter for image files only (simple check)
        const images = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
        res.json({ images });
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

    // Convert events array to string format that matches eventsConfig.js structure
    // We want to preserve the file header comments if possible, but for simplicity
    // we will rewrite the file with a standard header and the new data.
    
    const fileContent = `// ==================================================================================
// EVENT MANAGEMENT ENGINE - CONFIGURATION FILE
// ==================================================================================
//
// HOW TO USE THIS FILE:
// 1. To add a new event, copy one of the "Event Block" templates below.
// 2. Paste it at the TOP of the relevant section (Future or Past).
// 3. Update the fields as described.
// 4. IMPORTANT: Do NOT change the variable name \`eventsConfig\`.
// 5. Dates MUST be in YYYY-MM-DD format (e.g., '2026-03-21').
//
// ==================================================================================

export const eventsConfig = ${JSON.stringify(events, null, 2)};
`;

    fs.writeFileSync(EVENTS_FILE_PATH, fileContent, 'utf8');
    
    console.log('Events saved successfully');
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
const REGISTRATIONS_FILE_PATH = path.join(__dirname, 'src', 'data', 'registrations.json');

// Ensure registrations file exists
if (!fs.existsSync(REGISTRATIONS_FILE_PATH)) {
    fs.writeFileSync(REGISTRATIONS_FILE_PATH, '[]', 'utf8');
}

app.post('/api/register', (req, res) => {
  try {
    const { name, email, phone, source, eventId, eventName } = req.body;
    
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
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
      status: 'confirmed'
    };

    registrations.push(newRegistration);
    fs.writeFileSync(REGISTRATIONS_FILE_PATH, JSON.stringify(registrations, null, 2));

    console.log(`New registration: ${name} (${email}) for Event: ${eventName}`);
    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to save registration' });
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

app.listen(PORT, () => {
  console.log(`Admin Server running on http://localhost:${PORT}`);
});
