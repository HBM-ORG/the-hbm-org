import { useEffect } from 'react'

const siteUrl = 'https://www.thehbm.org'

const pageSEO = {
  '/': {
    title: 'The HBM | Bringing People Together | 8-Minute Human Connections',
    description: 'The Human Being Movement (HBM) – The engine for human connection. Real professional networking and community platform for deep 8-minute conversations.',
    keywords: 'HBM, Human Being Movement, Networking Events Israel, Business Networking Tel Aviv, Community Platform, 8 Minute Conversations, Human Connection, אירועי נטוורקינג, חיבור אנושי',
  },
  '/about': {
    title: 'About The HBM – Connecting Humanity One Conversation At a Time',
    description: 'Our mission is to end loneliness and enhance professional networking through the power of 8-minute structured conversations.',
    keywords: 'HBM Mission, Elad Maor Hefets, Connection Tech, Social Impact, Human Connectivity',
  },
  '/meeter/who': {
    title: 'Who is The Meeter For? | Hotels, Companies, Universities',
    description: 'Discover how Meeter transforms communities in hotels, corporate offices, and university campuses throughout Israel.',
    keywords: 'Community Management Hotels, Employee Engagement Israel, Campus Social Life, B2B Networking Platform',
  },
  '/events': {
    title: 'Upcoming Networking Events & Experiences | The HBM Israel',
    description: 'Book your spot for the next HBM networking experience. Real connections, zero awkwardness, 8 minutes.',
    keywords: 'Networking Events Tel Aviv, Tech Meetups Israel, Business Social Club, HBM Registry',
  },
  '/knowledge': {
    title: 'Connection Library & Knowledge Base | The Human Being Movement',
    description: 'Learn the science of connection. Resources for community builders and HR professionals on human connectivity.',
    keywords: 'Social Science, Community Building Resources, Networking Tips, Professional Connection',
  },
}

export default function SEO({ path }) {
  const seo = pageSEO[path] || pageSEO['/']

  useEffect(() => {
    document.title = seo.title

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
    setMeta('description', seo.description)
    setMeta('keywords', seo.keywords)
    
    // Open Graph / Social
    setMeta('og:title', seo.title, true)
    setMeta('og:description', seo.description, true)
    setMeta('og:url', `${siteUrl}${path}`, true)
    setMeta('og:type', 'website', true)
    setMeta('og:image', 'https://www.thehbm.org/wp-content/uploads/2025/06/Logo-and-Tagline.png', true)

    // Twitter
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', seo.title)
    setMeta('twitter:description', seo.description)

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
    canonical.setAttribute('href', `${siteUrl}${path}`)
    
  }, [path, seo])

  return null
}
