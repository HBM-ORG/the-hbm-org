import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const siteUrl = 'https://www.thehbm.org';
// Default OG image: use 1200×630 for rich previews on WhatsApp/social. Must be absolute URL; crawlers need public access.
const defaultImage = 'https://www.thehbm.org/wp-content/uploads/2025/06/Logo-and-Tagline.png';

/** Ensures og:image is always an absolute URL. Missing/empty image → defaultImage (fallback so link preview is never broken). */
function ensureAbsoluteImage(url) {
  if (!url || typeof url !== 'string') return defaultImage;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return siteUrl + (trimmed.startsWith('/') ? trimmed : '/' + trimmed);
}

const pageSEO = {
  '/': {
    title: 'The HBM | The Human Being Movement | 8-Minute Connections',
    description: 'The engine for human connection. HBM creates meaningful 8-minute conversations and networking events.',
    keywords: 'HBM, Human Being Movement, Networking Israel, Tel Aviv Events, 8 Minute Conversations',
    image: defaultImage,
  },
  '/about': {
    title: 'About The HBM | Our Mission to Connect Humanity',
    description: 'Founded by Elad Maor Hefets, HBM believes connection is a need. Learn about our vision to end loneliness.',
    keywords: 'HBM Founders, Mission for Connection, Social Impact Israel',
    image: defaultImage,
  },
  '/meeter': {
    title: 'The Meeter Experience | Redefining Networking Tech',
    description: 'Discover the science behind The Meeter. Authentic professional and personal connections in 8 minutes.',
    keywords: 'Networking Psychology, 8 Minute Rule, Connection Technology',
    image: defaultImage,
  },
  '/meeter/who': {
    title: 'Who Is The Meeter For? | Universities, Companies, Hotels',
    description: 'The Meeter for organizations: universities, companies, and hotels. Meaningful 8-minute connections at scale.',
    keywords: 'B2B Networking, Corporate Events, University Networking, Hotel Experiences',
    image: defaultImage,
  },
  '/meeter/features': {
    title: 'The Meeter Features | How 8-Minute Connections Work',
    description: 'Smart matching, guided prompts, and real feedback. See how The Meeter creates authentic connections.',
    keywords: 'Networking App, Connection Technology, 8 Minute Meetings',
    image: defaultImage,
  },
  '/knowledge': {
    title: 'The Growth Library | HBM Knowledge Base & Insights',
    description: 'Dive deep into human behavior, connectivity, and social science. Resources for community builders.',
    keywords: 'Connection Science, Social Dynamics, Community Building Blog',
    image: defaultImage,
  },
  '/events': {
    title: 'HBM Networking Events | Israel 2025-2026 Experience',
    description: 'Join the next HBM experience. Browse our gallery and book your spot for upcoming networking meetups.',
    keywords: 'Upcoming Events Tel Aviv, Israel Networking Calendar, Event Gallery',
    image: defaultImage,
  },
  '/events/register': {
    title: 'Register for HBM Event | Reserve Your Spot',
    description: 'Reserve your spot at the next HBM networking event. 8-minute connections that matter.',
    keywords: 'Event Registration, HBM Events, Networking Registration',
    image: defaultImage,
  },
  '/register': {
    title: 'Register for HBM Event | Reserve Your Spot',
    description: 'Reserve your spot at the next HBM networking event. 8-minute connections that matter.',
    keywords: 'Event Registration, HBM Events, Networking Registration',
    image: defaultImage,
  },
  '/contact': {
    title: 'Contact The HBM | Get in Touch',
    description: 'Reach out to The HBM team. Questions, partnerships, or just say hello—we\'re here for human connection.',
    keywords: 'Contact HBM, Get in Touch, Partnership, Support',
    image: defaultImage,
  },
  '/cookie-policy': {
    title: 'Cookie Policy | The HBM',
    description: 'How The HBM uses cookies and similar technologies. Your privacy matters.',
    keywords: 'Cookie Policy, Privacy, The HBM',
    image: defaultImage,
  },
  '/termsofuse': {
    title: 'Terms of Use | The HBM',
    description: 'Terms of use for The HBM website and services. Please read before using our site.',
    keywords: 'Terms of Use, Legal, The HBM',
    image: defaultImage,
  },
  '/privacypolicy': {
    title: 'Privacy Policy | The HBM',
    description: 'The HBM privacy policy. How we collect, use, and protect your personal information.',
    keywords: 'Privacy Policy, Data Protection, The HBM',
    image: defaultImage,
  },
};

// For dynamic routes (e.g. /events/123, /knowledge/5/slug) fall back to section defaults.
function getBasePath(pathname) {
  if (!pathname || pathname === '/') return '/';
  const segments = pathname.replace(/^\/|\/$/g, '').split('/');
  if (segments[0] === 'events' && segments.length > 1) return '/events';
  if (segments[0] === 'knowledge') return '/knowledge';
  const base = '/' + segments[0];
  return pageSEO[base] ? base : pathname in pageSEO ? pathname : '/';
}

export default function SEO({
  path,
  title: titleProp,
  description: descProp,
  image: imageProp,
  type = 'website',
  schema,
}) {
  const location = useLocation();
  const rawPath = path || location.pathname;
  const safePath = rawPath.replace(/\/$/, '') || '/';
  const basePath = getBasePath(safePath);
  const seo = pageSEO[safePath] || pageSEO[basePath] || pageSEO['/'];

  const resolvedTitle = titleProp || seo.title;
  const resolvedDescription = descProp || seo.description;
  const resolvedImage = ensureAbsoluteImage(imageProp || seo.image || defaultImage);
  const canonicalUrl = `${siteUrl}${safePath}`;

  // Organization Schema (Global)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The HBM",
    "url": siteUrl,
    "logo": "https://www.thehbm.org/wp-content/uploads/2026/02/לוגו-HBM-עדכני.png",
    "sameAs": [
      "https://www.instagram.com/the__hbm/",
      "https://www.linkedin.com/company/the-human-being-movement/"
    ]
  };

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="keywords" content={seo.keywords || pageSEO['/'].keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="The HBM" />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:secure_url" content={resolvedImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter / X Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedImage} />

      {/* PWA & Brand Assets */}
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="apple-mobile-web-app-title" content="The HBM" />
      <meta name="application-name" content="The HBM" />
      <meta name="theme-color" content="#6160AB" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
