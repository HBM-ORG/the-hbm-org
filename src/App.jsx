import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { I18nProvider } from './i18n/context'
import Layout from './components/Layout'
import SEO from './components/SEO'
import Home from './pages/Home'
import MeeterWhat from './pages/MeeterWhat'
import MeeterWho from './pages/MeeterWho'
import MeeterFeatures from './pages/MeeterFeatures'

import About from './pages/About'
import Contact from './pages/Contact'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import Knowledge from './pages/Knowledge'
import EventRegister from './pages/EventRegister'
import AdminDashboard from './pages/AdminDashboard'
import { EventsProvider } from './context/EventsContext'

import { trackPageView } from './utils/analytics'
 
function SEOWrapper({ children }) {
  const location = useLocation()
 
  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])
 
  return <><SEO path={location.pathname} />{children}</>
}

function ScrollToHash() {
  const { hash, pathname } = useLocation()
  useEffect(() => {
    if (hash) {
      const timer = setTimeout(() => {
        const el = document.getElementById(hash.replace('#', ''))
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
      return () => clearTimeout(timer)
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [hash, pathname])
  return null
}

export default function App() {
  return (
    <I18nProvider>
      <EventsProvider>
        <BrowserRouter>
          <ScrollToHash />
        <SEOWrapper>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/meeter" element={<MeeterWhat />} />
              <Route path="/meeter/who" element={<MeeterWho />} />
              <Route path="/meeter/features" element={<MeeterFeatures />} />

              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/events/register" element={<EventRegister />} />
              <Route path="/register" element={<EventRegister />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Internal Tools - Dev Only */}
              {import.meta.env.DEV && (
                <>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                </>
              )}

              {/* Redirects */}
              <Route path="/b2b" element={<MeeterWho />} />
              <Route path="/faq" element={<MeeterWhat />} />
              <Route path="/gallery" element={<Events />} />
            </Route>
          </Routes>
        </SEOWrapper>
        </BrowserRouter>
      </EventsProvider>
    </I18nProvider>
  )
}
