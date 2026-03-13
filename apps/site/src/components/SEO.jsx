import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSiteUrl } from '../utils/api';

// Canonical production origin for OG tags, canonical URLs, and absolute image resolution (Hostinger).
const siteUrl = getSiteUrl();
// Default OG image: 1200×630 served from same origin so link previews always show an image. File: public/og-default.png
const defaultImage = siteUrl + '/og-default.png';

/** Ensures og:image is always an absolute URL. Missing/empty image → defaultImage (fallback so link preview is never broken). */
function ensureAbsoluteImage(url) {
  if (!url || typeof url !== 'string') return defaultImage;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return siteUrl + (trimmed.startsWith('/') ? trimmed : '/' + trimmed);
}

const pageSEO = {
  '/': {
    title: 'The HBM - Bringing People Together',
    description: 'Discover a movement dedicated to authentic human interaction. We create spaces where meaningful stories are shared and real bonds are formed.',
    keywords: 'HBM, Human Being Movement, Networking Israel, Tel Aviv Events, Human Connection',
    image: defaultImage,
  },
  '/about': {
    title: 'The HBM - Our Mission & Vision',
    description: 'Meet the people behind the movement. We believe that genuine interaction is the fundamental antidote to modern loneliness.',
    keywords: 'HBM Founders, Mission for Connection, Social Impact Israel',
    image: defaultImage,
  },
  '/meeter': {
    title: 'The HBM - The Meeter Experience',
    description: 'A new way to interact. Our guided format turns brief encounters into lasting relationships through structured, high-impact dialogue.',
    keywords: 'Networking Psychology, Connection Technology, The Meeter',
    image: defaultImage,
  },
  '/meeter/who': {
    title: 'The HBM - For Organizations',
    description: 'Empower your community. Tailored solutions for universities, innovative workplaces, and hotels looking to foster deeper social layers.',
    keywords: 'B2B Networking, Corporate Events, University Networking, Hotel Experiences',
    image: defaultImage,
  },
  '/meeter/features': {
    title: 'The HBM - Behind the Science',
    description: 'From psychological prompts to smart matching. See how we facilitate the perfect atmosphere for people to truly open up.',
    keywords: 'Networking App, Connection Technology, Guided Dialogue',
    image: defaultImage,
  },
  '/knowledge': {
    title: 'The HBM - Wisdom & Insights',
    description: 'Explore curated resources on human behavior, community building, and the art of hosting impactful social experiences.',
    keywords: 'Connection Science, Social Dynamics, Community Building Blog',
    image: defaultImage,
  },
  '/events': {
    title: 'The HBM - Join an Experience',
    description: 'Step out of your comfort zone. Browse our upcoming gatherings and find your next unforgettable encounter in an HBM event.',
    keywords: 'Upcoming Events Tel Aviv, Israel Networking Calendar, Event Gallery',
    image: defaultImage,
  },
  '/events/register': {
    title: 'The HBM - Register',
    description: 'Join us for an evening of structured interaction. Reserve your place for a night of real stories and high-quality human time.',
    keywords: 'Event Registration, HBM Events, Networking Registration',
    image: defaultImage,
  },
  '/register': {
    title: 'The HBM - Register',
    description: 'Join us for an evening of structured interaction. Reserve your place for a night of real stories and high-quality human time.',
    keywords: 'Event Registration, HBM Events, Networking Registration',
    image: defaultImage,
  },
  '/contact': {
    title: 'The HBM - Let\'s Connect',
    description: 'Have a question or a partnership idea? Reach out to our team and let\'s explore how we can bring your community closer together.',
    keywords: 'Contact HBM, Get in Touch, Partnership, Support',
    image: defaultImage,
  },
  '/cookie-policy': {
    title: 'The HBM - Cookie Policy',
    description: 'Transparency in how we use cookies and similar technologies to enhance your experience within our community.',
    keywords: 'Cookie Policy, Privacy, The HBM',
    image: defaultImage,
  },
  '/termsofuse': {
    title: 'The HBM - Terms of Use',
    description: 'Please read our terms of use carefully before engaging with our website and services.',
    keywords: 'Terms of Use, Legal, The HBM',
    image: defaultImage,
  },
  '/privacypolicy': {
    title: 'The HBM - Privacy Policy',
    description: 'Your privacy matters. Learn how we protect your personal information while you focus on building real relationships.',
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
  if (segments[0] === 'about') return '/about';
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
  // Locked for production: og:image always https://www.thehbm.org/og-default.png
  const resolvedImage = defaultImage;
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
