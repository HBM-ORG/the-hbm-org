import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { eventsConfig } from '../../apps/client/src/data/eventsConfig.js';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '../../apps/client/public');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');


// Domain
const BASE_URL = 'https://www.thehbm.org';

// Routes Configuration
const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/meeter', changefreq: 'monthly', priority: 0.8 },
  { path: '/meeter/who', changefreq: 'monthly', priority: 0.8 }, // New!
  { path: '/meeter/features', changefreq: 'monthly', priority: 0.8 }, // New!
  { path: '/events', changefreq: 'weekly', priority: 0.9 },
  { path: '/knowledge', changefreq: 'weekly', priority: 0.8 }, // New!
  { path: '/about', changefreq: 'monthly', priority: 0.7 },
  { path: '/contact', changefreq: 'monthly', priority: 0.7 },
  { path: '/b2b', changefreq: 'monthly', priority: 0.7 },
  { path: '/gallery', changefreq: 'weekly', priority: 0.6 },
  { path: '/faq', changefreq: 'monthly', priority: 0.6 },
  { path: '/register', changefreq: 'monthly', priority: 0.8 },
  { path: '/events/register', changefreq: 'monthly', priority: 0.8 }
];

// Helper to format date
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const generateSitemap = () => {
  console.log('🗺️  Generating Sitemap...');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const today = formatDate(new Date());

  // 1. Add Static Routes
  staticRoutes.forEach(route => {
    xml += `
  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  });

  // 2. Add Dynamic Event Routes
  eventsConfig.forEach(event => {
    // Only verify published events or valid ones? 
    // The config has drafted events too maybe?
    // Let's include everything for now, or check status if field exists.
    // Assuming status logic: if no status or 'published'.
    // User data shows "status": "draft" for some.
    if (event.status === 'draft') return; 

    // URL structure for events: /events/:id
    const eventUrl = `${BASE_URL}/events/${event.id}`;
    
    // Use event date as lastmod if available, strictly speaking sitemap lastmod is about content change,
    // but event date is a decent proxy for relevance. Or just use today.
    xml += `
  <url>
    <loc>${eventUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  xml += `
</urlset>`;

  // Write to file
  fs.writeFileSync(SITEMAP_PATH, xml);
  console.log(`✅ Sitemap generated at ${SITEMAP_PATH}`);
  console.log(`   - Static Routes: ${staticRoutes.length}`);
  console.log(`   - Dynamic Events: ${eventsConfig.filter(e => e.status !== 'draft').length}`);
};

try {
  generateSitemap();
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}
