import { useEffect } from 'react'

const siteUrl = 'https://www.thehbm.org'

const pageSEO = {
  '/': {
    title: 'The HBM | The Human Being Movement | 8-Minute Connections & Community',
    description: 'The engine for human connection. HBM creates meaningful 8-minute conversations. join networking events in Israel, tech community meetups, and social experiences designed for real bonding.',
    keywords: 'HBM, Human Being Movement, Networking Israel, Tel Aviv Events, Business Connections, Social Platform, 8 Minute Conversations, Human Connectivity, Community Management, אירועי נטוורקינג, נטוורקינג עסקי, פיתוח קהילות, הקשר האנושי, מפגשים חברתיים, תל אביב אירועים',
  },
  '/about': {
    title: 'About The HBM | Our Mission to Connect Humanity | Elad Maor Hefets',
    description: 'Founded by Elad Maor Hefets, HBM believes connection isn\'t a luxury—it\'s a need. Learn about our vision to end loneliness and boost professional networking via structured 8-minute dialogues.',
    keywords: 'HBM Founders, Social Impact Israel, Mission for Connection, Loneliness Solutions, Networking Strategy, Elad Maor Hefets, אלעד מאור חפץ, חזון חברתי, מניעת בדידות, הכרויות עסקיות',
  },
  '/meeter': {
    title: 'The Meeter Experience | How HBM Redefines Networking Tech',
    description: 'Discover the science behind The Meeter. Why 8 minutes? How we remove social anxiety and create a safe space for authentic professional and personal connections.',
    keywords: 'Networking Psychology, 8 Minute Rule, Social Anxiety Solutions, Connection Technology, Meeter App, Tech for Good, פסיכולוגיה חברתית, טכנולוגיה לחיבור אנושי, פלטפורמת מפגשים',
  },
  '/meeter/who': {
    title: 'HBM for Organizations | Hotels, Tech Companies & Universities',
    description: 'The Meeter is designed for hotels, corporate offices, and campuses. Enhance employee engagement, build hotel guest communities, and foster university campus life.',
    keywords: 'B2B Networking, Corporate Wellness, Employee Engagement Israel, Hotel Guest Experience, Campus Community Building, HR Tech, נטוורקינג לארגונים, רווחת עובדים, קהילות בתי מלון, מעורבות סטודנטים',
  },
  '/meeter/features': {
    title: 'HBM Platform Features | AI Matching & Community Insights',
    description: 'Explore the advanced features of The Meeter. Dynamic matching, community analytics, and seamless event management for organizations and organizers.',
    keywords: 'Community Management Software, AI Networking, Event Analytics, Member Engagement Tools, SaaS for Communities, כלי ניהול קהילה, אנליטיקה לאירועים, ניהול משתתפים',
  },
  '/events': {
    title: 'HBM Networking Events | Israel 2025-2026 Experience Gallery',
    description: 'Join the next HBM experience. Browse our gallery of past connections and book your spot for upcoming networking meetups in Tel Aviv and beyond.',
    keywords: 'Upcoming Events Tel Aviv, Israel Networking Calendar, Event Gallery, Professional Meetups, Social Gatherings, אירועים קרובים, לוח אירועים, גלריית מפגשים, מיט-אפ עסקי',
  },
  '/knowledge': {
    title: 'The Science of Connection | HBM Knowledge Base & Insights',
    description: 'Dive deep into human behavior, connectivity, and social science. Resources and guides for community builders and connection-seekers.',
    keywords: 'Connection Science, Social Dynamics, Community Building Blog, Networking Tips, Human Behavior Insights, מדע החיבור, מדריכי קהילה, טיפים לנטוורקינג, התנהגות אנושית',
  },
  '/events/register': {
    title: 'Register for Next HBM Experience | Reserve Your Spot',
    description: 'Don\'t miss the next 8-minute revolution. Register now to join our community of professionals and connection-seekers.',
    keywords: 'Event Registration, HBM Signup, Networking Ticket, Join HBM, הרשמה לאירוע, הזמנת כרטיסים, הצטרפות לנטוורקינג',
  },
}

export default function SEO({ path, title: titleProp, description: descProp }) {
  const safePath = path || '/'
  const seo = pageSEO[safePath] || pageSEO['/']
  // Allow direct title/description overrides (e.g. for dynamic event pages)
  const resolvedTitle = titleProp || seo.title
  const resolvedDescription = descProp || seo.description

  useEffect(() => {
    document.title = resolvedTitle

    const setMeta = (name, content, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    // Standard SEO
    setMeta('description', resolvedDescription)
    setMeta('keywords', seo.keywords)
    
    // Open Graph / Social
    setMeta('og:title', resolvedTitle, true)
    setMeta('og:description', resolvedDescription, true)
    setMeta('og:url', `${siteUrl}${safePath}`, true)
    setMeta('og:type', 'website', true)
    setMeta('og:image', 'https://www.thehbm.org/wp-content/uploads/2025/06/Logo-and-Tagline.png', true)

    // Twitter
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', resolvedTitle)
    setMeta('twitter:description', resolvedDescription)

    // Geo Tags
    setMeta('geo.region', 'IL-TA')
    setMeta('geo.placename', 'Tel Aviv-Yafo')

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', `${siteUrl}${safePath}`)
    
    // JSON-LD Structured Data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": resolvedTitle,
      "description": resolvedDescription,
      "url": `${siteUrl}${safePath}`,
      "publisher": {
        "@type": "Organization",
        "name": "The HBM",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.thehbm.org/wp-content/uploads/2026/02/לוגו-HBM-עדכני.png"
        }
      }
    };

    let script = document.querySelector('script[type="application/ld+json"]#dynamic-seo');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('id', 'dynamic-seo');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

    // Breadcrumbs Schema (Extreme Global Visibility)
    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": safePath.split('/').filter(p => p).reduce((acc, curr, i, arr) => {
        acc.push({
          "@type": "ListItem",
          "position": i + 1,
          "name": curr.charAt(0).toUpperCase() + curr.slice(1),
          "item": `${siteUrl}/${arr.slice(0, i + 1).join('/')}`
        });
        return acc;
      }, [{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      }])
    };

    let breadcrumbScript = document.querySelector('script[type="application/ld+json"]#breadcrumb-seo');
    if (!breadcrumbScript) {
      breadcrumbScript = document.createElement('script');
      breadcrumbScript.setAttribute('type', 'application/ld+json');
      breadcrumbScript.setAttribute('id', 'breadcrumb-seo');
      document.head.appendChild(breadcrumbScript);
    }
    breadcrumbScript.textContent = JSON.stringify(breadcrumbData);
    
  }, [path, seo, resolvedTitle, resolvedDescription])

  return null
}
