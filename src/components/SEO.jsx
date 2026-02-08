import { useEffect } from 'react'

const siteUrl = 'https://www.thehbm.org'

const pageSEO = {
  '/': {
    title: 'The HBM – Bringing People Together | 8-Minute Human Connections',
    description: 'The Human Being Movement (HBM) is a social platform built for real connection. Join 8-minute meaningful video conversations with people near you.',
  },
  '/about': {
    title: 'About The HBM – Who We Are | The Human Being Movement',
    description: 'Meet the team behind HBM. We believe connection isn\'t a luxury—it\'s a need.',
  },
  '/faq': {
    title: 'FAQ – Frequently Asked Questions | The HBM',
    description: 'Everything you need to know about The HBM platform. Why 8 minutes? Is it free?',
  },
  '/b2b': {
    title: 'HBM for Business – Enter The Meeter Experience | The HBM',
    description: 'Events bring people together, but HBM offers the platform that actually connects them. Remove fear and hesitation.',
  },
  '/events': {
    title: 'Events – Community Meetups & Connections | The HBM',
    description: 'Join HBM community events. Experience real 8-minute connections at our offline and online meetups.',
  },
  '/gallery': {
    title: 'Gallery – Moments from Our Events | The HBM',
    description: 'See photos and highlights from HBM community events and meaningful connections.',
  },
  '/contact': {
    title: 'Contact Us – Get in Touch | The HBM',
    description: 'Reach out to The HBM team. Whether you\'re a hotel, company, university, or community – we\'d love to connect.',
  },
  '/meeter': {
    title: 'The Meeter – Everything About HBM | The HBM',
    description: 'Everything you need to know about The HBM platform. Why 8 minutes? Is it free? How does it work?',
  },
}

export default function SEO({ path }) {
  const seo = pageSEO[path] || pageSEO['/']

  useEffect(() => {
    document.title = seo.title

    const setMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('description', seo.description)
    setMeta('og:title', seo.title, true)
    setMeta('og:description', seo.description, true)
    setMeta('og:url', `${siteUrl}${path}`, true)

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
