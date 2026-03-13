import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { I18nProvider } from './i18n/context'
import Layout from './components/Layout'
import Home from './pages/Home'
import { EventsProvider } from './context/EventsContext'
import { trackPageView, initAnalytics } from './utils/analytics'

// Lazy-load all non-initial routes for faster first load and smaller initial bundle
const MeeterWhat = lazy(() => import('./pages/MeeterWhat'))
const MeeterWho = lazy(() => import('./pages/MeeterWho'))
const MeeterFeatures = lazy(() => import('./pages/MeeterFeatures'))
const About = lazy(() => import('./pages/About'))
const TeamMember = lazy(() => import('./pages/TeamMember'))
const Contact = lazy(() => import('./pages/Contact'))
const Events = lazy(() => import('./pages/Events'))
const EventDetails = lazy(() => import('./pages/EventDetails'))
const Knowledge = lazy(() => import('./pages/Knowledge'))
const EventRegister = lazy(() => import('./pages/EventRegister'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'))
const LegalPage = lazy(() => import('./pages/LegalPage'))

function PageLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center" aria-hidden="true">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
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

function AnalyticsTracker() {
  const location = useLocation()
  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])
  return null
}

export default function App() {
  useEffect(() => {
    const runAnalytics = () => initAnalytics()
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(runAnalytics, { timeout: 2500 })
    } else {
      setTimeout(runAnalytics, 500)
    }
  }, [])

  return (
    <I18nProvider>
      <EventsProvider>
        <BrowserRouter>
          <ScrollToHash />
          <AnalyticsTracker />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/meeter" element={<Suspense fallback={<PageLoader />}><MeeterWhat /></Suspense>} />
              <Route path="/meeter/who" element={<Suspense fallback={<PageLoader />}><MeeterWho /></Suspense>} />
              <Route path="/meeter/features" element={<Suspense fallback={<PageLoader />}><MeeterFeatures /></Suspense>} />

              <Route path="/events" element={<Suspense fallback={<PageLoader />}><Events /></Suspense>} />
              <Route path="/events/:id" element={<Suspense fallback={<PageLoader />}><EventDetails /></Suspense>} />
              <Route path="/events/register" element={<Suspense fallback={<PageLoader />}><EventRegister /></Suspense>} />
              <Route path="/register" element={<Suspense fallback={<PageLoader />}><EventRegister /></Suspense>} />
              <Route path="/knowledge" element={<Suspense fallback={<PageLoader />}><Knowledge /></Suspense>} />
              <Route path="/knowledge/:id" element={<Suspense fallback={<PageLoader />}><Knowledge /></Suspense>} />
              <Route path="/knowledge/:id/:slug" element={<Suspense fallback={<PageLoader />}><Knowledge /></Suspense>} />
              <Route path="/about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
              <Route path="/about/team/:slug" element={<Suspense fallback={<PageLoader />}><TeamMember /></Suspense>} />
              <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
              <Route path="/cookie-policy" element={<Suspense fallback={<PageLoader />}><CookiePolicy /></Suspense>} />
              <Route path="/termsofuse" element={<Suspense fallback={<PageLoader />}><LegalPage type="terms" /></Suspense>} />
              <Route path="/termsofuse/" element={<Suspense fallback={<PageLoader />}><LegalPage type="terms" /></Suspense>} />
              <Route path="/privacypolicy" element={<Suspense fallback={<PageLoader />}><LegalPage type="privacy" /></Suspense>} />
              <Route path="/privacypolicy/" element={<Suspense fallback={<PageLoader />}><LegalPage type="privacy" /></Suspense>} />

              <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
              <Route path="/admin-dashboard" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />

              <Route path="/b2b" element={<Suspense fallback={<PageLoader />}><MeeterWho /></Suspense>} />
              <Route path="/faq" element={<Suspense fallback={<PageLoader />}><MeeterWhat /></Suspense>} />
              <Route path="/gallery" element={<Suspense fallback={<PageLoader />}><Events /></Suspense>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </EventsProvider>
    </I18nProvider>
  )
}
